"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  contentType: string
  contentTitle: string
  timestamp: string
}

interface RecentActivityProps {
  data: ActivityItem[]
}

export function RecentActivity({ data }: RecentActivityProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No recent activity</div>
  }

  return (
    <div className="space-y-6">
      {data.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{activity.user.name}</p>
              <Badge
                variant={
                  activity.action === "added" ? "default" : activity.action === "updated" ? "outline" : "destructive"
                }
                className="capitalize"
              >
                {activity.action}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {activity.contentType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activity.contentTitle}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
