"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  collection,
  getDocs,
  query,
  orderBy,
  setDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  quote: string;
  author: string;
  status: string;
}

interface QuoteSchedulerProps {
  preselectedDate?: Date;
  onScheduled?: () => void;
}

export function QuoteScheduler({
  preselectedDate,
  onScheduled,
}: QuoteSchedulerProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>(
    preselectedDate || new Date()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurringType, setRecurringType] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");
  const [recurringCount, setRecurringCount] = useState(1);

  // Fetch devotionals
  useEffect(() => {
    fetchDevotionals();
  }, [statusFilter]);

  const fetchDevotionals = async () => {
    try {
      setLoading(true);
      const quotesRef = collection(db, "quotes");
      let q = query(quotesRef, orderBy("quote"));

      if (statusFilter !== "all") {
        q = query(
          quotesRef,
          where("status", "==", statusFilter),
          orderBy("quote")
        );
      }

      const querySnapshot = await getDocs(q);
      const quotesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Quote[];

      setQuotes(quotesData);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

        const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuoteToggle = (quoteId: string) => {
    setSelectedQuotes((prev) =>
      prev.includes(quoteId)
        ? prev.filter((id) => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const generateScheduleDates = (
    startDate: Date,
    type: string,
    count: number
  ): Date[] => {
    const dates = [startDate];

    if (type === "none") return dates;

    for (let i = 1; i < count; i++) {
      const newDate = new Date(startDate);

      switch (type) {
        case "daily":
          newDate.setDate(startDate.getDate() + i);
          break;
        case "weekly":
          newDate.setDate(startDate.getDate() + i * 7);
          break;
        case "monthly":
          newDate.setMonth(startDate.getMonth() + i);
          break;
      }

      dates.push(newDate);
    }

    return dates;
  };

  const handleSchedule = async () => {
    if (selectedQuotes.length === 0) {
      toast.error("Please select at least one quote to schedule");
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduleDates = generateScheduleDates(
        scheduledDate,
        recurringType,
        recurringCount
      );

      // Check for conflicts
      const conflicts = [];
      for (const date of scheduleDates) {
        const dateString = date.toISOString().split("T")[0];
        const existingQuery = query(
          collection(db, "scheduledQuotes"),
          where("scheduledDate", "==", dateString)
        );
        const existingSnapshot = await getDocs(existingQuery);
        if (!existingSnapshot.empty) {
          conflicts.push(dateString);
        }
      }

      if (conflicts.length > 0) {
        toast.error(
          `Quotes are already scheduled for: ${conflicts.join(", ")}`
        );
        return;
      }

      // Schedule devotionals
      let scheduleIndex = 0;
      for (const date of scheduleDates) {
        for (const quoteId of selectedQuotes) {
          const quote = quotes.find((d) => d.id === quoteId);
          if (!quote) continue;

          const scheduleId = `${quoteId}_${
            date.toISOString().split("T")[0]
          }_${Date.now()}`;

          await setDoc(doc(db, "scheduledQuotes", scheduleId), {
            quoteId,
            quoteQuote: quote.quote,
            quoteAuthor: quote.author,
            scheduledDate: date.toISOString().split("T")[0],
            status: "scheduled",
            createdAt: serverTimestamp(),
            recurringType: recurringType !== "none" ? recurringType : null,
            recurringIndex: scheduleIndex,
          });

          // Add to activity log
          await setDoc(
            doc(
              db,
              "activity",
              `quote_schedule_${Date.now()}_${Math.random()}`
            ),
            {
              user: {
                name: "Admin User",
                email: "admin@example.com",
              },
              action: "scheduled",
              contentType: "quote",
              contentTitle: quote.quote,
              scheduledDate: date.toISOString().split("T")[0],
              timestamp: serverTimestamp(),
            }
          );
        }
        scheduleIndex++;
      }

      toast.success(
        `${selectedQuotes.length} quote(s) scheduled for ${scheduleDates.length} date(s)`
      );

      // Reset form
      setSelectedQuotes([]);
      setRecurringType("none");
      setRecurringCount(1);

      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error("Error scheduling quotes:", error);
      toast.error("Failed to schedule quotes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Date & Recurrence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate
                      ? format(scheduledDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => date && setScheduledDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select
                value={recurringType}
                onValueChange={(value) =>
                  setRecurringType(value as "none" | "daily" | "weekly" | "monthly")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No recurrence</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recurringType !== "none" && (
            <div className="space-y-2">
              <Label>Number of occurrences</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={recurringCount}
                onChange={(e) =>
                  setRecurringCount(Number.parseInt(e.target.value) || 1)
                }
                placeholder="Enter number of occurrences"
              />
              <p className="text-sm text-muted-foreground">
                This will schedule devotionals for {recurringCount}{" "}
                {recurringType} occurrence(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Devotional Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Quotes</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search quotes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No quotes found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    id={quote.id}
                    checked={selectedQuotes.includes(quote.id)}
                    onCheckedChange={() =>
                      handleQuoteToggle(quote.id)
                    }
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={quote.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {quote.quote}
                    </label>
                    <p className="text-sm text-muted-foreground">
                        by {quote.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      {selectedQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{selectedQuotes.length}</strong> quote(s)
                selected
              </p>
              <p className="text-sm">
                <strong>
                  {
                    generateScheduleDates(
                      scheduledDate,
                      recurringType,
                      recurringCount
                    ).length
                  }
                </strong>{" "}
                date(s) to schedule
              </p>
              <p className="text-sm">
                <strong>Total schedules:</strong>{" "}
                {selectedQuotes.length *
                  generateScheduleDates(
                    scheduledDate,
                    recurringType,
                    recurringCount
                  ).length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSchedule}
          disabled={selectedQuotes.length === 0 || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Scheduling..." : "Schedule Quotes"}
        </Button>
      </div>
    </div>
  );
}
