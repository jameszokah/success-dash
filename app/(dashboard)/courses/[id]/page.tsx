"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Edit,
  Users,
  Clock,
  Star,
  Play,
  ChevronDown,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import Image from "next/image";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  description?: string;
  completed?: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseWithContent {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorPhotoUrl?: string;
  imageURL: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  trending?: boolean;
  views?: number;
  createdAt: string;
  enrollments?: number;
  duration: string;
  lessons: number;
  level: string;
  offersCertificate?: boolean;
  category?: string;
  sections: Section[];
  progress?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const courseDoc = await getDoc(doc(db, "courses", courseId));

        if (courseDoc.exists()) {
          const courseData = {
            id: courseDoc.id,
            ...courseDoc.data(),
          } as CourseWithContent;
          setCourse(courseData);

          // Open all sections by default
          const sectionIds = new Set(
            courseData.sections.map((section) => section.id)
          );
          setOpenSections(sectionIds);
        } else {
          toast.error("Course not found");
          router.push("/courses");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalDuration = () => {
    if (!course) return "0m";
    let totalMinutes = 0;
    course.sections.forEach((section) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">Course Details & Content</p>
        </div>
        <Link href={`/courses/${courseId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={course.imageURL || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={course.instructorPhotoUrl || "/placeholder.svg"}
                      alt={course.instructor}
                    />
                    <AvatarFallback>
                      {course.instructor.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{course.instructor}</div>
                    <div className="text-sm text-muted-foreground">
                      Instructor
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-12" />

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">
                    ({course.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.sections.length} sections • {course.lessons} lessons •{" "}
                {getTotalDuration()} total length
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.sections.map((section, sectionIndex) => (
                  <Collapsible
                    key={section.id}
                    open={openSections.has(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {sectionIndex + 1}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{section.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {section.lessons.length} lesson
                              {section.lessons.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=closed]:-rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="ml-4 space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs">
                              {lessonIndex + 1}
                            </div>
                            <Play className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {lesson.title}
                              </div>
                              {lesson.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {lesson.description}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              {lesson.duration}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <span className="font-medium">
                  {course.enrollments?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Lessons</span>
                </div>
                <span className="font-medium">{course.lessons}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="font-medium">{getTotalDuration()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Level</span>
                </div>
                <Badge variant="outline">{course.level}</Badge>
              </div>

              {course.offersCertificate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Certificate</span>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Status */}
          <Card>
            <CardHeader>
              <CardTitle>Course Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Published</span>
                  <span className="text-muted-foreground">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
                {course.category && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Category</span>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {course.featured && (
                  <Badge className="w-full justify-center">
                    Featured Course
                  </Badge>
                )}
                {course.trending && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Trending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/courses/${courseId}/edit`} className="block">
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/courses")}
              >
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
