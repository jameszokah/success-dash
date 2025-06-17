"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/shared/file-uploader";
import { SectionManager } from "@/components/courses/section-manager";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Save, Eye } from "lucide-react";

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  description?: string;
  completed?: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  instructorPhotoUrl: string;
  imageURL: string;
  level: string;
  category: string;
  duration: string;
  lessons: number;
  featured: boolean;
  trending: boolean;
  offersCertificate: boolean;
  sections: Section[];
}

interface CourseFormProps {
  courseId?: string;
  mode: "create" | "edit";
}

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const COURSE_CATEGORIES = [
  "Faith & Spirituality",
  "Bible Study",
  "Prayer & Worship",
  "Christian Living",
  "Leadership",
  "Theology",
  "Discipleship",
  "Ministry",
];

export function CourseForm({ courseId, mode }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    instructor: "",
    instructorPhotoUrl: "",
    imageURL: "",
    level: "All Levels",
    category: "Faith & Spirituality",
    duration: "",
    lessons: 0,
    featured: false,
    trending: false,
    offersCertificate: false,
    sections: [],
  });

  useEffect(() => {
    if (mode === "edit" && courseId) {
      loadCourse();
    }
  }, [courseId, mode]);

  const loadCourse = async () => {
    try {
      setInitialLoading(true);
      const courseDoc = await getDoc(doc(db, "courses", courseId!));

      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          instructor: courseData.instructor || "",
          instructorPhotoUrl: courseData.instructorPhotoUrl || "",
          imageURL: courseData.imageURL || "",
          level: courseData.level || "All Levels",
          category: courseData.category || "Faith & Spirituality",
          duration: courseData.duration || "",
          lessons: courseData.lessons || 0,
          featured: courseData.featured || false,
          trending: courseData.trending || false,
          offersCertificate: courseData.offersCertificate || false,
          sections: courseData.sections || [],
        });
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course data");
    } finally {
      setInitialLoading(false);
    }
  };

  const calculateCourseDuration = (sections: Section[]) => {
    let totalMinutes = 0;
    sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        const [minutes, seconds] = lesson.duration.split(":").map(Number);
        totalMinutes += minutes + seconds / 60;
      });
    });

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.round(totalMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const calculateLessonsCount = (sections: Section[]) => {
    return sections.reduce(
      (total, section) => total + section.lessons.length,
      0
    );
  };

  const handleSectionsChange = (sections: Section[]) => {
    const duration = calculateCourseDuration(sections);
    const lessonsCount = calculateLessonsCount(sections);

    setFormData((prev) => ({
      ...prev,
      sections,
      duration,
      lessons: lessonsCount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.instructor) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.sections.length === 0) {
      toast.error("Please add at least one section with lessons");
      return;
    }

    try {
      setLoading(true);

      const courseData = {
        ...formData,
        rating: mode === "create" ? 0 : undefined,
        reviewCount: mode === "create" ? 0 : undefined,
        enrollments: mode === "create" ? 0 : undefined,
        views: mode === "create" ? 0 : undefined,
        createdAt: mode === "create" ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      if (mode === "create") {
        const newCourseRef = doc(db, "courses", `course-${Date.now()}`);
        await setDoc(newCourseRef, courseData);
        toast.success("Course created successfully!");
        router.push("/courses");
      } else {
        await updateDoc(doc(db, "courses", courseId!), courseData);
        toast.success("Course updated successfully!");
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the basic details about your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter course title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what students will learn in this course"
              rows={4}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor Name *</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) =>
                  setFormData({ ...formData, instructor: e.target.value })
                }
                placeholder="Enter instructor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Course Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Course Media</CardTitle>
          <CardDescription>
            Upload images for your course and instructor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Course Thumbnail *</Label>
              <FileUploader
                accept="image/*"
                value={formData.imageURL}
                onUpload={(url) => setFormData({ ...formData, imageURL: url })}
                maxSize={5}
                folder="courses/thumbnails"
              />
            </div>
            <div className="space-y-2">
              <Label>Instructor Photo</Label>
              <FileUploader
                accept="image/*"
                value={formData.instructorPhotoUrl}
                onUpload={(url) =>
                  setFormData({ ...formData, instructorPhotoUrl: url })
                }
                maxSize={5}
                folder="instructors/photos"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            Organize your course into sections and lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionManager
            sections={formData.sections}
            onSectionsChange={handleSectionsChange}
          />
        </CardContent>
      </Card>

      {/* Course Statistics */}
      {formData.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Statistics</CardTitle>
            <CardDescription>
              Automatically calculated based on your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{formData.lessons}</div>
                <div className="text-sm text-muted-foreground">
                  Total Lessons
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formData.duration}</div>
                <div className="text-sm text-muted-foreground">
                  Total Duration
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formData.sections.length}
                </div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Course Settings</CardTitle>
          <CardDescription>Configure additional course options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Course</Label>
              <div className="text-sm text-muted-foreground">
                Display this course prominently on the app
              </div>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Trending Course</Label>
              <div className="text-sm text-muted-foreground">
                Mark this course as trending
              </div>
            </div>
            <Switch
              checked={formData.trending}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, trending: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offers Certificate</Label>
              <div className="text-sm text-muted-foreground">
                Students receive a certificate upon completion
              </div>
            </div>
            <Switch
              checked={formData.offersCertificate}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, offersCertificate: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex items-center gap-4">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === "create" ? "Create Course" : "Update Course"}
          </Button>
        </div>
      </div>
    </form>
  );
}
