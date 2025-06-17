import { CourseForm } from "@/components/courses/course-form";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
        <p className="text-muted-foreground">
          Build a comprehensive course with sections and lessons
        </p>
      </div>

      <CourseForm mode="create" />
    </div>
  );
}
