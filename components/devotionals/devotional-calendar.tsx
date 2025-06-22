"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DevotionalScheduler } from "./devotional-scheduler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScheduledDevotional {
  id: string;
  devotionalId: string;
  devotionalTitle: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "cancelled";
  createdAt: string;
  devotionalAuthor?: string;
  devotionalVerse?: string;
}

export function DevotionalCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledDevotionals, setScheduledDevotionals] = useState<
    ScheduledDevotional[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevotional, setSelectedDevotional] =
    useState<ScheduledDevotional | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch scheduled devotionals
  useEffect(() => {
    fetchScheduledDevotionals();
  }, [currentMonth]);

  const fetchScheduledDevotionals = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      );

      const scheduledRef = collection(db, "scheduledDevotionals");
      const q = query(
        scheduledRef,
        where("scheduledDate", ">=", startOfMonth.toISOString().split("T")[0]),
        where("scheduledDate", "<=", endOfMonth.toISOString().split("T")[0]),
        orderBy("scheduledDate")
      );

      const querySnapshot = await getDocs(q);
      const scheduledData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledDevotional[];

      setScheduledDevotionals(scheduledData);
    } catch (error) {
      console.error("Error fetching scheduled devotionals:", error);
      toast.error("Failed to load scheduled devotionals");
    } finally {
      setLoading(false);
    }
  };

  const getDevotionalsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return scheduledDevotionals.filter((d) => d.scheduledDate === dateString);
  };

  const handleDeleteScheduled = async () => {
    if (!selectedDevotional) return;

    try {
      await deleteDoc(doc(db, "scheduledDevotionals", selectedDevotional.id));

      setScheduledDevotionals((prev) =>
        prev.filter((d) => d.id !== selectedDevotional.id)
      );

      toast.success("Schedule cancelled");
    } catch (error) {
      console.error("Error cancelling scheduled devotional:", error);
      toast.error("Failed to cancel scheduled devotional");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDevotional(null);
    }
  };

  const selectedDateDevotionals = getDevotionalsForDate(selectedDate);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Devotional Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border w-full"
            // components={{
            //   Day: ({ date, ...props }) => {
            //     const devotionals = getDevotionalsForDate(date);
            //     const hasDevotionals = devotionals.length > 0;

            //     return (
            //       <div className="relative">
            //         <button
            //           {...props}
            //           className={`${
            //             props.className
            //           } ${
            //             hasDevotionals
            //               ? "bg-primary/10 text-primary font-semibold"
            //               : ""
            //           }`}
            //         >
            //           {date.getDate()}
            //           {hasDevotionals && (
            //             <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
            //           )}
            //         </button>
            //       </div>
            //     );
            //   },
            // }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
          <Dialog
            open={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Devotional</DialogTitle>
                <DialogDescription>
                  Schedule a devotional for {selectedDate.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <DevotionalScheduler
                preselectedDate={selectedDate}
                onScheduled={() => {
                  setIsScheduleDialogOpen(false);
                  fetchScheduledDevotionals();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : selectedDateDevotionals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No devotionals scheduled for this date</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Devotional
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateDevotionals.map((devotional) => (
                <div
                  key={devotional.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {devotional.devotionalTitle}
                    </h4>
                    {devotional.devotionalAuthor && (
                      <p className="text-sm text-muted-foreground">
                        by {devotional.devotionalAuthor}
                      </p>
                    )}
                    {devotional.devotionalVerse && (
                      <p className="text-sm text-muted-foreground">
                        {devotional.devotionalVerse}
                      </p>
                    )}
                    <Badge
                      variant={
                        devotional.status === "published"
                          ? "default"
                          : devotional.status === "scheduled"
                          ? "secondary"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {devotional.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedDevotional(devotional);
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedDevotional(devotional);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Devotional?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled devotional &quot;
              {selectedDevotional?.devotionalTitle}&quot; for &quot;
              {selectedDevotional?.scheduledDate}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Schedule</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScheduled}
              className="bg-destructive text-destructive-foreground"
            >
              Cancel Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
