import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteScheduler } from "@/components/quotes/quote-scheduler";
import { ScheduledQuotesTable } from "@/components/quotes/scheduled-quote-table";
import { QuoteCalendar } from "@/components/quotes/quote-calendar";
import { BulkScheduler } from "@/components/quotes/bulk-scheduler";

export default function QuoteSchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Quote Scheduling
        </h2>
        <p className="text-muted-foreground">
          Schedule quotes to automatically display on specific dates
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>  
          <TabsTrigger value="bulk">Bulk Schedule</TabsTrigger>
          <TabsTrigger value="manage">Manage Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <QuoteCalendar />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <QuoteScheduler />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkScheduler />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
              <ScheduledQuotesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
