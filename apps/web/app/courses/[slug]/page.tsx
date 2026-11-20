import { notFound } from "next/navigation";
import { courses } from "@shared/courses";
import { CourseCommunity } from "@/components/course-community";
export const dynamicParams = false;
export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  return {
    title: course ? `${course.name} community` : "Course not found",
    description: course
      ? `Find golf and meet your people at ${course.name} in ${course.city}, ${course.state}.`
      : undefined,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();
  return <CourseCommunity course={course} />;
}
