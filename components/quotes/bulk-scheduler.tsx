"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Shuffle, Clock, AlertCircle } from "lucide-react"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import { collection, getDocs, query, orderBy, setDoc, doc, serverTimestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface Quote {
  id: string
  quote: string
  author: string
  status: string
}

export function BulkScheduler() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 1))
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "monthly">("daily")
  const [statusFilter, setStatusFilter] = useState("published")
  const [randomize, setRandomize] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  // Fetch quotes
  useEffect(() => {
    fetchQuotes()
  }, [statusFilter])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const quotesRef = collection(db, "quotes")
      let q = query(quotesRef, orderBy("quote"))

      if (statusFilter !== "all") {
        q = query(quotesRef, where("status", "==", statusFilter), orderBy("quote"))
      } 

      const querySnapshot = await getDocs(q)
      const quotesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Quote[]

      setQuotes(quotesData)
    } catch (error) {
      console.error("Error fetching quotes:", error)
      toast.error("Failed to load quotes")
    } finally {
      setLoading(false)
    }
  }

  const generateScheduleDates = (): Date[] => {
    const dates: Date[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))

      switch (scheduleType) {
        case "daily":
          currentDate = addDays(currentDate, 1)
          break
        case "weekly":
          currentDate = addWeeks(currentDate, 1)
          break
        case "monthly":
          currentDate = addMonths(currentDate, 1)
          break
      }
    }

    return dates
  }

  const handleBulkSchedule = async () => {
    if (quotes.length === 0) {
      toast.error("No quotes available")
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    try {
      const scheduleDates = generateScheduleDates()
      let availableQuotes = [...quotes]

      if (randomize) {
        availableQuotes = availableQuotes.sort(() => Math.random() - 0.5)
      }

      // Check for existing schedules
      const conflicts = []
      for (const date of scheduleDates) {
        const dateString = date.toISOString().split("T")[0]
        const existingQuery = query(collection(db, "scheduledQuotes"), where("scheduledDate", "==", dateString))
        const existingSnapshot = await getDocs(existingQuery)
        if (!existingSnapshot.empty) {
          conflicts.push(dateString)
        }
      }

      if (conflicts.length > 0) {
          toast.error(`Scheduling conflicts detected: ${conflicts.length} dates already have scheduled quotes. Please clear them first or choose different dates.`)
        return
      }

      // Schedule quotes
      let quoteIndex = 0
      const totalOperations = scheduleDates.length

      for (let i = 0; i < scheduleDates.length; i++) {
        const date = scheduleDates[i]
        const quote = availableQuotes[quoteIndex % availableQuotes.length]

        const scheduleId = `${quote.id}_${date.toISOString().split("T")[0]}_${Date.now()}`

        await setDoc(doc(db, "scheduledQuotes", scheduleId), {
          quoteId: quote.id,
          quoteQuote: quote.quote,
          quoteAuthor: quote.author,
          scheduledDate: date.toISOString().split("T")[0],
          status: "scheduled",
          createdAt: serverTimestamp(),
          bulkScheduled: true,
          scheduleType,
        })

        quoteIndex++
        setProgress(((i + 1) / totalOperations) * 100)
      }

      // Add to activity log
      await setDoc(doc(db, "activity", `bulk_schedule_${Date.now()}`), {
        user: {
          name: "Admin User",
          email: "admin@example.com",
        },
        action: "bulk_scheduled",
        contentType: "quote",
        scheduledCount: scheduleDates.length,
        dateRange: `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`,
        scheduleType,
        timestamp: serverTimestamp(),
      })

      toast.success(`Bulk scheduling completed: Successfully scheduled ${scheduleDates.length} quotes`)
    } catch (error) {
      console.error("Error bulk scheduling quotes:", error)
        toast.error("Failed to bulk schedule quotes. Please try again.")
    } finally {
      setIsSubmitting(false)
      setProgress(0)
    }
  }

  const scheduleDates = generateScheduleDates()
  const estimatedQuotes = Math.min(quotes.length, scheduleDates.length)

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Bulk Schedule Configuration
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
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Schedule Frequency</Label>
              <Select value={scheduleType} onValueChange={(value) => setScheduleType(value as "daily" | "weekly" | "monthly")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quote Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="draft">Draft Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="randomize"
              checked={randomize}
              onChange={(e) => setRandomize(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="randomize">Randomize quote order</Label>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
              <div className="text-center py-4">Loading quotes...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{quotes.length}</div>
                  <div className="text-sm text-muted-foreground">Available Quotes</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{scheduleDates.length}</div>
                  <div className="text-sm text-muted-foreground">Schedule Dates</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{estimatedQuotes}</div>
                  <div className="text-sm text-muted-foreground">Will be Scheduled</div>
                </div>
              </div>

              {quotes.length < scheduleDates.length && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have more schedule dates ({scheduleDates.length}) than available quotes (
                    {quotes.length}). Quotes will be repeated to fill all dates.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p>
                  Schedule period: {format(startDate, "PPP")} to {format(endDate, "PPP")}
                </p>
                <p>Frequency: {scheduleType}</p>
                <p>Order: {randomize ? "Randomized" : "Sequential"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      {isSubmitting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scheduling progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleBulkSchedule}
          disabled={quotes.length === 0 || isSubmitting || scheduleDates.length === 0}
          className="min-w-[150px]"
        >
          {isSubmitting ? "Scheduling..." : "Start Bulk Schedule"}
        </Button>
      </div>
    </div>
  )
}
