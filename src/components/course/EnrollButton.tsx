"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/course-data";
import { useTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";
import { useEnrollment } from "@/hooks/useEnrollment";

interface EnrollButtonProps {
  course: Course;
}

export function EnrollButton({ course }: EnrollButtonProps) {
  const t = useTranslations("courses");
  const router = useRouter();
  const { user } = useAuth();
  const { isEnrolled, enrollment, enroll, loading } = useEnrollment(
    user?.uid,
    course.id
  );
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    setEnrolling(true);
    try {
      await enroll();
      router.push(`/courses/${course.slug}/learn`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinue = () => {
    router.push(`/courses/${course.slug}/learn`);
  };

  if (loading) {
    return (
      <Button variant="primary" disabled className="w-full py-3">
        ...
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button
        variant="primary"
        onClick={handleContinue}
        className="w-full py-3"
      >
        {enrollment?.progress
          ? t.detail.continueLearning
          : t.detail.startLearning}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={handleEnroll}
      disabled={enrolling}
      className="w-full py-3"
    >
      {enrolling
        ? "..."
        : course.price === 0
          ? t.detail.enrollFree
          : t.detail.enrollNow}
    </Button>
  );
}
