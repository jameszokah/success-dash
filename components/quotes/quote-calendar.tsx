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
  import { QuoteScheduler } from "@/components/quotes/quote-scheduler"; 
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

interface ScheduledQuote {
  id: string;
  quoteId: string;
  quoteQuote: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "cancelled";
  createdAt: string;
  quoteAuthor?: string;
}

export function QuoteCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledQuotes, setScheduledQuotes] = useState<
    ScheduledQuote[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] =
    useState<ScheduledQuote | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch scheduled quotes
  useEffect(() => {
    fetchScheduledQuotes();
  }, [currentMonth]);

  const fetchScheduledQuotes = async () => {
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

      const scheduledRef = collection(db, "scheduledQuotes");
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
      })) as ScheduledQuote[];

      setScheduledQuotes(scheduledData);
    } catch (error) {
      console.error("Error fetching scheduled quotes:", error);
      toast.error("Failed to load scheduled quotes");
    } finally {
      setLoading(false);
    }
  };

  const getQuotesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return scheduledQuotes.filter((d) => d.scheduledDate === dateString);
  };

  const handleDeleteScheduled = async () => {
    if (!selectedQuote) return;

    try {
      await deleteDoc(doc(db, "scheduledQuotes", selectedQuote.id));

      setScheduledQuotes((prev) =>
        prev.filter((d) => d.id !== selectedQuote.id)
      );

      toast.success("Schedule cancelled");
    } catch (error) {
      console.error("Error cancelling scheduled quote:", error);
      toast.error("Failed to cancel scheduled quote");
    } finally {
      setIsDeleteDialogOpen(false);
          setSelectedQuote(null);
    }
  };

  const selectedDateQuotes = getQuotesForDate(selectedDate);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Quote Calendar</CardTitle>
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
                <DialogTitle>Schedule Quote</DialogTitle>
                <DialogDescription>
                  Schedule a quote for {selectedDate.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
                <QuoteScheduler
                preselectedDate={selectedDate}
                onScheduled={() => {
                  setIsScheduleDialogOpen(false);
                  fetchScheduledQuotes();
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
          ) : selectedDateQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No quotes scheduled for this date</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Quote
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {quote.quoteQuote}
                    </h4>
                    {quote.quoteAuthor && (
                      <p className="text-sm text-muted-foreground">
                        by {quote.quoteAuthor}
                      </p>
                    )}
                    <Badge
                      variant={
                        quote.status === "published"
                          ? "default"
                          : quote.status === "scheduled"
                          ? "secondary"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedQuote(quote);
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
            <AlertDialogTitle>Cancel Scheduled Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled quote &quot;
              {selectedQuote?.quoteQuote}&quot; for &quot;
              {selectedQuote?.scheduledDate}. This action cannot be undone.
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
