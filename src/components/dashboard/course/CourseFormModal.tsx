"use client";

import { useState, useEffect } from "react";
import type { Course } from "@/lib/course-data";
import type { Category } from "@/lib/firestore";
import { getCategories } from "@/lib/firestore";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Button } from "@/components/ui/Button";
import { SectionEditor, type SectionData } from "./SectionEditor";
import {
  addCourse,
  updateCourse,
  addSection,
  addLesson,
  deleteSection,
  deleteLesson,
  getCourseSections,
  getCourseLessons,
} from "@/lib/firestore-courses";
import { useAuth } from "@/lib/useAuth";
import { getFirebaseAuth } from "@/lib/firebase";
import { resolveLocalMediaUrl } from "@/lib/local-media";
import {
  inferVideoSourceFromUrl,
  validateVideoSourceInput,
} from "@/lib/lesson-assets";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCourse?: Course | null;
  onSaved: () => void | Promise<void>;
}

async function uploadPendingFile(
  courseId: string,
  file: File,
  idToken: string,
  kind: "lesson" | "thumbnail" | "poster" = "lesson"
): Promise<{ path: string; url?: string; previewPath?: string; previewUrl?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("courseId", courseId);
  formData.append("kind", kind);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Upload failed");
  }
  const { path, url, previewPath, previewUrl } = await res.json();
  return {
    path: path as string,
    url: url as string | undefined,
    previewPath: previewPath as string | undefined,
    previewUrl: previewUrl as string | undefined,
  };
}

export function CourseFormModal({
  isOpen,
  onClose,
  editingCourse,
  onSaved,
}: CourseFormModalProps) {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [draftAssetScope, setDraftAssetScope] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    title_vi: "",
    description: "",
    description_vi: "",
    thumbnail: "",
    price: 0,
    currency: "VND" as "VND" | "USD",
    category: "",
    level: "beginner" as Course["level"],
    status: "draft" as Course["status"],
    tags: [] as string[],
    tagsInput: "",
  });

  const [sections, setSections] = useState<SectionData[]>([
    {
      section: { title: "", title_vi: "", order: 0, lessonCount: 0 },
      lessons: [],
    },
  ]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setThumbnailFile(null);
    setDraftAssetScope(
      editingCourse?.id ||
        `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );

    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        title_vi: editingCourse.title_vi,
        description: editingCourse.description,
        description_vi: editingCourse.description_vi,
        thumbnail: resolveLocalMediaUrl(editingCourse.thumbnail),
        price: editingCourse.price,
        currency: editingCourse.currency,
        category: editingCourse.category,
        level: editingCourse.level,
        status: editingCourse.status,
        tags: editingCourse.tags,
        tagsInput: editingCourse.tags.join(", "),
      });
      loadExistingContent(editingCourse.id);
    } else {
      setFormData({
        title: "",
        title_vi: "",
        description: "",
        description_vi: "",
        thumbnail: "",
        price: 0,
        currency: "VND",
        category: "",
        level: "beginner",
        status: "draft",
        tags: [],
        tagsInput: "",
      });
      setSections([
        {
          section: { title: "", title_vi: "", order: 0, lessonCount: 0 },
          lessons: [],
        },
      ]);
    }
    setSaveError("");
    setStep(1);
  }, [editingCourse, isOpen]);

  const loadExistingContent = async (courseId: string) => {
    const [secs, les] = await Promise.all([
      getCourseSections(courseId),
      getCourseLessons(courseId),
    ]);

    const sectionData: SectionData[] = secs.map((sec) => ({
      section: {
        title: sec.title,
        title_vi: sec.title_vi,
        order: sec.order,
        lessonCount: sec.lessonCount,
      },
      lessons: les
        .filter((l) => l.sectionId === sec.id)
        .map(({ id, ...rest }) => ({ ...rest, _draftId: id })),
    }));

    if (sectionData.length > 0) setSections(sectionData);
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;
    setSaving(true);
    setSaveError("");

    try {
      for (const sectionData of sections) {
        for (const lesson of sectionData.lessons) {
          if (lesson.type !== "video") continue;

          const videoSource =
            lesson.videoSource || inferVideoSourceFromUrl(lesson.videoUrl);

          if (videoSource === "upload" || lesson._pendingFile) continue;

          const validationError = validateVideoSourceInput(
            videoSource,
            lesson.videoUrl
          );

          if (validationError) {
            throw new Error(
              `${lesson.title || "Untitled lesson"}: ${validationError}`
            );
          }
        }
      }

      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let courseId = editingCourse?.id;
      let thumbnailUrl = formData.thumbnail;

      if (!courseId) {
        courseId = await addCourse({
          slug: formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),
          title: formData.title,
          title_vi: formData.title_vi,
          description: formData.description,
          description_vi: formData.description_vi,
          thumbnail: "",
          instructorUid: user.uid,
          instructorName:
            user.displayName || userProfile.username || userProfile.email,
          price: formData.price,
          currency: formData.currency,
          category: formData.category,
          level: formData.level,
          status: formData.status,
          totalLessons: 0,
          totalDuration: 0,
          enrollmentCount: 0,
          tags,
        });
      } else {
        await updateCourse(courseId, {
          title: formData.title,
          title_vi: formData.title_vi,
          description: formData.description,
          description_vi: formData.description_vi,
          price: formData.price,
          currency: formData.currency,
          category: formData.category,
          level: formData.level,
          status: formData.status,
          tags,
        });
      }

      // When editing, clear existing sections and lessons before re-adding
      if (editingCourse) {
        const [existingSecs, existingLessons] = await Promise.all([
          getCourseSections(courseId),
          getCourseLessons(courseId),
        ]);
        await Promise.all([
          ...existingSecs.map((s) => deleteSection(courseId!, s.id)),
          ...existingLessons.map((l) => deleteLesson(courseId!, l.id)),
        ]);
      }

      // Save sections and lessons
      let totalLessons = 0;
      let totalDuration = 0;

      for (const sectionData of sections) {
        if (!sectionData.section.title && sectionData.lessons.length === 0) continue;

        const sectionId = await addSection(courseId, {
          ...sectionData.section,
          lessonCount: sectionData.lessons.length,
        });

        for (let i = 0; i < sectionData.lessons.length; i++) {
          const { _pendingFile, _pendingCaptionFile, _pendingPosterFile, ...lesson } =
            sectionData.lessons[i];

          let videoUrl = lesson.videoUrl;
          let pdfUrl = lesson.pdfUrl;
          let documentUrl = lesson.documentUrl;
          let videoSource = lesson.videoSource || inferVideoSourceFromUrl(videoUrl);
          let videoPosterUrl = lesson.videoPosterUrl;
          let captionUrl = lesson.captionUrl;
          let captionLabel = lesson.captionLabel?.trim();
          let captionLanguage = lesson.captionLanguage?.trim();

          // Upload pending file to local /data storage
          if (_pendingFile) {
            const { path, previewPath } = await uploadPendingFile(
              courseId,
              _pendingFile,
              idToken
            );
            if (lesson.type === "video") {
              videoUrl = path;
              videoSource = "upload";
            }
            if (lesson.type === "pdf") {
              documentUrl = path;
              pdfUrl = previewPath || path;
            }
          }

          if (
            lesson.type === "video" &&
            videoSource !== "youtube" &&
            _pendingCaptionFile
          ) {
            const { path } = await uploadPendingFile(
              courseId,
              _pendingCaptionFile,
              idToken
            );
            captionUrl = path;
          }

          if (
            lesson.type === "video" &&
            videoSource !== "youtube" &&
            _pendingPosterFile
          ) {
            const { path } = await uploadPendingFile(
              courseId,
              _pendingPosterFile,
              idToken,
              "poster"
            );
            videoPosterUrl = path;
          }

          if (videoSource === "youtube") {
            captionUrl = undefined;
            captionLabel = undefined;
            captionLanguage = undefined;
          }

          await addLesson(courseId, {
            ...lesson,
            sectionId,
            order: totalLessons,
            sectionOrder: i,
            ...(lesson.type === "video" && videoUrl
              ? {
                  videoUrl,
                  videoSource,
                  ...(videoPosterUrl ? { videoPosterUrl } : {}),
                  ...(captionUrl
                    ? {
                        captionUrl,
                        captionLabel: captionLabel || "CC",
                        captionLanguage: captionLanguage || "vi",
                      }
                    : {}),
                }
              : {}),
            ...(lesson.type === "pdf" && pdfUrl
              ? { pdfUrl, ...(documentUrl ? { documentUrl } : {}) }
              : {}),
          });

          totalLessons++;
          totalDuration += lesson.duration || 0;
        }
      }

      await updateCourse(courseId, { totalLessons, totalDuration });

      if (thumbnailFile) {
        const { url } = await uploadPendingFile(
          courseId,
          thumbnailFile,
          idToken,
          "thumbnail"
        );
        thumbnailUrl = url || "";
        await updateCourse(courseId, { thumbnail: thumbnailUrl });
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save course:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCourse ? "Edit Course" : "Create New Course"}
      actions={
        <>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step < 2 ? (
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!formData.title}
            >
              Next: Content
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Course"}
            </Button>
          )}
        </>
      }
    >
      {step === 1 && (
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">Title (EN)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="Course title in English"
              />
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-2">Tiêu đề (VI)</label>
              <input
                type="text"
                value={formData.title_vi}
                onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                className={inputClass}
                placeholder="Tiêu đề khóa học"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">Description (EN)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputClass} h-24 resize-none`}
                placeholder="Course description"
              />
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-2">Mô tả (VI)</label>
              <textarea
                value={formData.description_vi}
                onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                className={`${inputClass} h-24 resize-none`}
                placeholder="Mô tả khóa học"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass}
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.label_en} ({cat.label_vi})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value as Course["level"] })
                }
                className={inputClass}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Course["status"] })
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">Price</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className={`${inputClass} flex-1`}
                  placeholder="0 = Free"
                />
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value as "VND" | "USD" })
                  }
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 typo-body outline-none"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block typo-caption font-semibold mb-2">Tags</label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                className={inputClass}
                placeholder="AI, Machine Learning, Python"
              />
            </div>
          </div>

          <div>
            <label className="block typo-caption font-semibold mb-2">Thumbnail</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setThumbnailFile(file);
                    setFormData({ ...formData, thumbnail: URL.createObjectURL(file) });
                  }
                }}
                className="flex-1 typo-caption"
              />
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="w-16 h-10 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="typo-body text-[var(--color-text-secondary)]">
            Thêm sections và bài học. Có thể import từ thư mục.
          </p>
          <SectionEditor
            sections={sections}
            onChange={setSections}
            draftNamespace={editingCourse?.id || draftAssetScope}
            assetScope={editingCourse?.id || draftAssetScope}
          />
          {saveError && (
            <p className="typo-caption text-red-500 p-3 rounded-lg bg-red-500/10">
              {saveError}
            </p>
          )}
        </div>
      )}
    </SimpleModal>
  );
}
