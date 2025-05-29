"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsageChart } from "@/components/analytics/usage-chart"
import { ContentEngagement } from "@/components/analytics/content-engagement"
import { UserGrowth } from "@/components/analytics/user-growth"
import { GeographicDistribution } from "@/components/analytics/geographic-distribution"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    downloads: 0,
    activeUsers: 0,
    avgSession: "0m 0s",
    retentionRate: 0,
  })

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)

        // Fetch analytics stats
        const statsDoc = await getDocs(collection(db, "appStats"))

        if (!statsDoc.empty) {
          const data = statsDoc.docs[0].data()
          setStats({
            downloads: data.totalDownloads || 0,
            activeUsers: data.activeUsers || 0,
            avgSession: data.avgSessionTime || "0m 0s",
            retentionRate: data.retentionRate || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">View app usage and engagement metrics</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.downloads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+5.4% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgSession}</div>
                <p className="text-xs text-muted-foreground">+1.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.retentionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>App Usage</CardTitle>
              <CardDescription>Daily active users over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Engagement</CardTitle>
              <CardDescription>Most popular content by type and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentEngagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <UserGrowth />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <GeographicDistribution />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
