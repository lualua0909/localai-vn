"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Course } from "@/lib/course-data";
import { getPublishedCourses } from "@/lib/firestore-courses";
import { getCategories, type Category } from "@/lib/firestore";
import { useTranslations, useLanguage } from "@/lib/i18n";
import { CourseCard } from "@/components/course/CourseCard";
import { GraduationCap } from "lucide-react";

function CoursesContent() {
  const t = useTranslations("courses");
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState(
    searchParams.get("category") || ""
  );
  const [filterLevel, setFilterLevel] = useState(
    searchParams.get("level") || ""
  );

  useEffect(() => {
    Promise.all([getPublishedCourses(), getCategories()])
      .then(([c, cats]) => {
        setCourses(c);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) => {
    if (filterCategory && course.category !== filterCategory) return false;
    if (filterLevel && course.level !== filterLevel) return false;
    return true;
  });

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container-main section-padding text-center">
          <p className="typo-caption font-semibold text-accent uppercase tracking-wider mb-3">
            {t.hero.eyebrow}
          </p>
          <h1 className="typo-h1 mb-4">{t.hero.title}</h1>
          <p className="typo-body text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t.hero.description}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container-main pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              router.push("?page=1");
            }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 typo-body outline-none"
          >
            <option value="">{t.catalog.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {language === "vi" ? cat.label_vi : cat.label_en}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => {
              setFilterLevel(e.target.value);
              router.push("?page=1");
            }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 typo-body outline-none"
          >
            <option value="">{t.catalog.allLevels}</option>
            <option value="beginner">{t.catalog.beginner}</option>
            <option value="intermediate">{t.catalog.intermediate}</option>
            <option value="advanced">{t.catalog.advanced}</option>
          </select>

          <span className="typo-caption text-[var(--color-text-secondary)] ml-auto">
            {filteredCourses.length} {t.catalog.lessons}
          </span>
        </div>
      </section>

      {/* Course Grid */}
      <section className="container-main pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap
              size={48}
              className="mx-auto text-[var(--color-text-secondary)] mb-4"
            />
            <p className="typo-body text-[var(--color-text-secondary)]">
              {t.catalog.noResults}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] typo-body disabled:opacity-30 hover:bg-[var(--color-bg-alt)] transition-colors"
            >
              &larr;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl typo-body font-medium transition-colors ${
                  page === currentPage
                    ? "bg-accent text-white"
                    : "border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] typo-body disabled:opacity-30 hover:bg-[var(--color-bg-alt)] transition-colors"
            >
              &rarr;
            </button>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesContent />
    </Suspense>
  );
}
