"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Headphones, BookOpen, Video } from "lucide-react"

export interface ContentItem {
  id: string
  title: string
  type: string
  views: number
  image?: string
}

interface TopContentProps {
  data: ContentItem[]
}

export function TopContent({ data }: TopContentProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No content data available</div>
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.image || "/placeholder.svg"} alt={item.title} />
            <AvatarFallback>
              {item.type === "podcast" ? (
                <Headphones className="h-4 w-4" />
              ) : item.type === "devotional" ? (
                <BookOpen className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{item.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
          </div>
          <div className="text-sm text-muted-foreground">{item.views.toLocaleString()} views</div>
        </div>
      ))}
    </div>
  )
}
