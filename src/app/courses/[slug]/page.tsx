import { notFound } from "next/navigation";
import {
  getCourseBySlug,
  getCourseSections,
  getCourseLessons,
} from "@/lib/server/course-store";
import { CourseDetailClient } from "./CourseDetailClient";

interface Props {
  params: { slug: string };
}

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const [sections, lessons] = await Promise.all([
    getCourseSections(course.id),
    getCourseLessons(course.id),
  ]);

  return (
    <CourseDetailClient
      course={JSON.parse(JSON.stringify(course))}
      sections={JSON.parse(JSON.stringify(sections))}
      lessons={JSON.parse(JSON.stringify(lessons))}
    />
  );
}
