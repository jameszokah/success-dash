import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevotionalScheduler } from "@/components/devotionals/devotional-scheduler";
import { ScheduledDevotionalsTable } from "@/components/devotionals/scheduled-devotionals-table";
import { DevotionalCalendar } from "@/components/devotionals/devotional-calendar";
import { BulkScheduler } from "@/components/devotionals/bulk-scheduler";

export default function DevotionalSchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Devotional Scheduling
        </h2>
        <p className="text-muted-foreground">
          Schedule devotionals to automatically display on specific dates
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
          <DevotionalCalendar />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <DevotionalScheduler />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkScheduler />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <ScheduledDevotionalsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
