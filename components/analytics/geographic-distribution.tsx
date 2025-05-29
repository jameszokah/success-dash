"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

interface GeoData {
  name: string
  value: number
}

const COLORS = ["#7C4DFF", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE", "#F5F3FF", "#F9FAFB"]

export function GeographicDistribution() {
  const [data, setData] = useState<GeoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGeoData() {
      try {
        setLoading(true)
        const geoStatsRef = collection(db, "geoStats")
        const snapshot = await getDocs(geoStatsRef)

        const geoData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            name: data.country,
            value: data.users,
          }
        })

        // Sort by value in descending order
        geoData.sort((a, b) => b.value - a.value)

        // Take top 6 countries and group the rest as "Other"
        if (geoData.length > 6) {
          const topCountries = geoData.slice(0, 6)
          const otherCountries = geoData.slice(6)

          const otherValue = otherCountries.reduce((sum, country) => sum + country.value, 0)

          setData([...topCountries, { name: "Other", value: otherValue }])
        } else {
          setData(geoData)
        }
      } catch (error) {
        console.error("Error fetching geographic data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchGeoData()
  }, [])

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No geographic data available
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
