"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "@/components/courses/course-form";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p className="text-muted-foreground">
          Update your course content and settings
        </p>
      </div>

      <CourseForm courseId={courseId} mode="edit" />
    </div>
  );
}
