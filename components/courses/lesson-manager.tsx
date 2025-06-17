"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUploader } from "@/components/shared/file-uploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Play, Clock, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  description?: string;
  completed?: boolean;
}

interface LessonManagerProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}

export function LessonManager({
  lessons,
  onLessonsChange,
}: LessonManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    videoUrl: "",
    thumbnail: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      duration: "",
      videoUrl: "",
      thumbnail: "",
      description: "",
    });
    setEditingLesson(null);
  };

  const openDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        thumbnail: lesson.thumbnail || "",
        description: lesson.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const saveLesson = () => {
    if (!formData.title || !formData.duration || !formData.videoUrl) {
      return;
    }

    const lessonData: Lesson = {
      id: editingLesson?.id || `lesson-${Date.now()}`,
      title: formData.title,
      duration: formData.duration,
      videoUrl: formData.videoUrl,
      thumbnail: formData.thumbnail,
      description: formData.description,
      completed: false,
    };

    if (editingLesson) {
      const updatedLessons = lessons.map((lesson) =>
        lesson.id === editingLesson.id ? lessonData : lesson
      );
      onLessonsChange(updatedLessons);
    } else {
      onLessonsChange([...lessons, lessonData]);
    }

    closeDialog();
  };

  const deleteLesson = (lessonId: string) => {
    const updatedLessons = lessons.filter((lesson) => lesson.id !== lessonId);
    onLessonsChange(updatedLessons);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onLessonsChange(items);
  };


  return (
    <div className="space-y-4">
      {/* Add Lesson Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => openDialog()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson details"
                : "Create a new lesson for this section"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Duration (mm:ss) *</Label>
                <Input
                  id="lesson-duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="15:30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what students will learn in this lesson"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Video File *</Label>
              <FileUploader
                accept="video/*"
                value={formData.videoUrl}
                onUpload={(url) => setFormData({ ...formData, videoUrl: url })}
                maxSize={500} // 500MB for videos
                folder="courses/videos"
              />
            </div>

            <div className="space-y-2">
              <Label>Video Thumbnail</Label>
              <FileUploader
                accept="image/*"
                value={formData.thumbnail}
                onUpload={(url) => setFormData({ ...formData, thumbnail: url })}
                maxSize={5}
                folder="courses/thumbnails"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={saveLesson}
              disabled={
                !formData.title || !formData.duration || !formData.videoUrl
              }
            >
              {editingLesson ? "Update Lesson" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lessons List */}
      {lessons.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {lessons.map((lesson, index) => (
                  <Draggable
                    key={lesson.id}
                    draggableId={lesson.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging ? "shadow-lg" : ""
                        } transition-shadow`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium truncate">
                                  {lesson.title}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </Badge>
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {lesson.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {lesson.videoUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    window.open(lesson.videoUrl, "_blank")
                                  }
                                  title="Preview video"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDialog(lesson)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Lesson
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;
                                      {lesson.title}&quot;? This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteLesson(lesson.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {lessons.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-muted-foreground">
              No lessons added yet. Click &quot;Add Lesson&quot; to create your
              first lesson.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
