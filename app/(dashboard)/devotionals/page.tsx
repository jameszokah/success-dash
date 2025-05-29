import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DevotionalsTable } from "@/components/devotionals/devotionals-table"

export default function DevotionalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Devotionals</h2>
          <p className="text-muted-foreground">Manage and create daily devotionals</p>
        </div>
        <Button asChild>
          <Link href="/devotionals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Devotional
          </Link>
        </Button>
      </div>

      <DevotionalsTable />
    </div>
  )
}
