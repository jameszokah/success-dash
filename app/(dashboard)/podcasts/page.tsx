import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PodcastsTable } from "@/components/podcasts/podcasts-table"

export default function PodcastsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Podcasts</h2>
          <p className="text-muted-foreground">Manage and upload podcast episodes</p>
        </div>
        <Button asChild>
          <Link href="/podcasts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Podcast
          </Link>
        </Button>
      </div>

      <PodcastsTable />
    </div>
  )
}
