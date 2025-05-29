"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

interface UsageData {
  date: string
  users: number
}

export function UsageChart() {
  const [data, setData] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsageData() {
      try {
        setLoading(true)
        const usageQuery = query(collection(db, "appUsage"), orderBy("date"), limit(30))
        const usageSnapshot = await getDocs(usageQuery)
        const usageData = usageSnapshot.docs.map((doc) => ({
          date: doc.id,
          users: doc.data().users,
        }))

        setData(usageData)
      } catch (error) {
        console.error("Error fetching usage data:", error)
        // Fallback to empty data
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">No usage data available</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="users" stroke="#7C4DFF" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
