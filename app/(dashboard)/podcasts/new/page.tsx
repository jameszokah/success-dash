"use client"

import { PodcastForm } from "@/components/podcasts/podcast-form"

export default function NewPodcastPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Podcast</h2>
        <p className="text-muted-foreground">Create a new podcast episode</p>
      </div>

      <PodcastForm />
    </div>
  )
}
