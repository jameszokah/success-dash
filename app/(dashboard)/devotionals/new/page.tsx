
import { DevotionalForm } from "@/components/devotionals/devotional-form"

export default function NewDevotionalPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Devotional</h2>
        <p className="text-muted-foreground">Create a new daily devotional</p>
      </div>

      <DevotionalForm />
    </div>
  )
}
