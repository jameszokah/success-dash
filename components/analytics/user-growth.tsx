"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

interface UserGrowthData {
  month: string
  users: number
}

export function UserGrowth() {
  const [data, setData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserGrowthData() {
      try {
        setLoading(true)
        const userGrowthRef = collection(db, "userGrowth")
        const q = query(userGrowthRef, orderBy("timestamp"))
        const snapshot = await getDocs(q)

        const growthData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            month: new Date(data.timestamp.toDate()).toLocaleString("default", { month: "short" }),
            users: data.count,
          }
        })

        setData(growthData)
      } catch (error) {
        console.error("Error fetching user growth data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserGrowthData()
  }, [])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No user growth data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Area type="monotone" dataKey="users" stroke="#7C4DFF" fill="#7C4DFF" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
