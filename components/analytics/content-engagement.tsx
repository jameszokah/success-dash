"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

interface ContentData {
  name: string
  views: number
  likes: number
  shares: number
}

export function ContentEngagement() {
  const [data, setData] = useState<ContentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContentData() {
      try {
        setLoading(true)
        const contentStatsRef = collection(db, "contentStats")
        const snapshot = await getDocs(contentStatsRef)

        // Process the data to aggregate by content type
        const aggregatedData: Record<string, ContentData> = {}

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          const contentType = data.type

          if (!aggregatedData[contentType]) {
            aggregatedData[contentType] = {
              name: contentType,
              views: 0,
              likes: 0,
              shares: 0,
            }
          }

          aggregatedData[contentType].views += data.views || 0
          aggregatedData[contentType].likes += data.likes || 0
          aggregatedData[contentType].shares += data.shares || 0
        })

        setData(Object.values(aggregatedData))
      } catch (error) {
        console.error("Error fetching content engagement data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchContentData()
  }, [])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No content engagement data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="views" fill="#7C4DFF" radius={[4, 4, 0, 0]} />
        <Bar dataKey="likes" fill="#A78BFA" radius={[4, 4, 0, 0]} />
        <Bar dataKey="shares" fill="#C4B5FD" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
