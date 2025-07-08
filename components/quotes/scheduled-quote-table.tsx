"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,  
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Search, Calendar, Trash2, Eye } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
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
import { format } from "date-fns";

interface ScheduledQuote {
  id: string;
  quoteId: string;
  quoteQuote: string;
  quoteAuthor: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "cancelled";
  createdAt: string;
  recurringType?: string;
  bulkScheduled?: boolean;
}

export function ScheduledQuotesTable() {
  const [scheduledQuotes, setScheduledQuotes] = useState<
    ScheduledQuote[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch scheduled devotionals
  useEffect(() => {
    fetchScheduledDevotionals();
  }, []);

  const fetchScheduledDevotionals = async () => {
    try {
      setLoading(true);
      const scheduledRef = collection(db, "scheduledQuotes");
      const q = query(scheduledRef, orderBy("scheduledDate", "desc"));
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

  const handleDeleteScheduled = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteDoc(doc(db, "scheduledQuotes", selectedSchedule));

      setScheduledQuotes((prev) =>
        prev.filter((schedule) => schedule.id !== selectedSchedule)
      );

      toast.success("Schedule cancelled");
    } catch (error) {
      console.error("Error cancelling scheduled quote:", error);
      toast.error("Failed to cancel scheduled quote");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleStatusChange = async (scheduleId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "scheduledQuotes", scheduleId), {
        status: newStatus,
      });

      setScheduledQuotes((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                status: newStatus as "scheduled" | "published" | "cancelled",
              }
            : schedule
        )
      );

      toast.success(`Schedule status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredSchedules = scheduledQuotes.filter((schedule) => {
    const matchesSearch =
      schedule.quoteQuote
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      schedule.quoteAuthor
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      schedule.quoteId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || schedule.status === statusFilter;

    const today = new Date().toISOString().split("T")[0];
    const scheduleDate = schedule.scheduledDate;

    let matchesDate = true;
    if (dateFilter === "upcoming") {
      matchesDate = scheduleDate >= today;
    } else if (dateFilter === "past") {
      matchesDate = scheduleDate < today;
    } else if (dateFilter === "today") {
      matchesDate = scheduleDate === today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scheduled quotes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading scheduled quotes...
                </TableCell>
              </TableRow>
            ) : filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No scheduled quotes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/quotes/${schedule.quoteId}`}
                      className="hover:underline"
                    >
                      {schedule.quoteQuote}
                    </Link>
                  </TableCell>
                  <TableCell>{schedule.quoteAuthor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(schedule.scheduledDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        schedule.status === "published"
                          ? "default"
                          : schedule.status === "scheduled"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {schedule.recurringType && (
                        <Badge variant="outline" className="text-xs">
                          {schedule.recurringType}
                        </Badge>
                      )}
                      {schedule.bulkScheduled && (
                        <Badge variant="outline" className="text-xs">
                          bulk
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link
                            href={`/quotes/${schedule.quoteId}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Quote
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(schedule.id, "published")
                          }
                          disabled={schedule.status === "published"}
                        >
                          Mark as Published
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(schedule.id, "scheduled")
                          }
                          disabled={schedule.status === "scheduled"}
                        >
                          Mark as Scheduled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSchedule(schedule.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Schedule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel the
              scheduled quote.
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
