"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LessonManager } from "@/components/courses/lesson-manager";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Plus, ChevronDown, Edit2, Trash2, GripVertical } from "lucide-react";
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

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface SectionManagerProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export function SectionManager({
  sections,
  onSectionsChange,
}: SectionManagerProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const addSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      lessons: [],
    };

    onSectionsChange([...sections, newSection]);
    setNewSectionTitle("");
    setOpenSections(new Set([...openSections, newSection.id]));
  };

  const updateSection = (sectionId: string, title: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, title } : section
    );
    onSectionsChange(updatedSections);
    setEditingSection(null);
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(
      (section) => section.id !== sectionId
    );
    onSectionsChange(updatedSections);
    setOpenSections(
      new Set([...openSections].filter((id) => id !== sectionId))
    );
  };

  const updateSectionLessons = (sectionId: string, lessons: Lesson[]) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, lessons } : section
    );
    onSectionsChange(updatedSections);
  };

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionsChange(items);
  };

  return (
    <div className="space-y-6">
      {/* Add New Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter section title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSection()}
              />
            </div>
            <Button onClick={addSection} disabled={!newSectionTitle.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      {sections.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? "shadow-lg" : ""}
                      >
                        <Collapsible
                          open={openSections.has(section.id)}
                          onOpenChange={() => toggleSection(section.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex-1 justify-start p-0"
                                >
                                  <ChevronDown className="mr-2 h-4 w-4 transition-transform duration-200 data-[state=closed]:-rotate-90" />
                                  <div className="flex items-center gap-3">
                                    {editingSection === section.id ? (
                                      <Input
                                        defaultValue={section.title}
                                        onBlur={(e) =>
                                          updateSection(
                                            section.id,
                                            e.target.value
                                          )
                                        }
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            updateSection(
                                              section.id,
                                              e.currentTarget.value
                                            );
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                        className="h-8"
                                      />
                                    ) : (
                                      <>
                                        <span className="font-medium">
                                          {section.title}
                                        </span>
                                        <Badge variant="secondary">
                                          {section.lessons.length} lesson
                                          {section.lessons.length !== 1
                                            ? "s"
                                            : ""}
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </Button>
                              </CollapsibleTrigger>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSection(section.id);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Section
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {section.title}&quot;? This will also
                                        delete all lessons in this section.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteSection(section.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardHeader>

                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <LessonManager
                                lessons={section.lessons}
                                onLessonsChange={(lessons) =>
                                  updateSectionLessons(section.id, lessons)
                                }
                              />
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
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

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              No sections added yet. Create your first section to get started.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
