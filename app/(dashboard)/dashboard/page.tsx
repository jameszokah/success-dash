"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import {
  ActivityItem,
  RecentActivity,
} from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ContentItem, TopContent } from "@/components/dashboard/top-content";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    podcasts: 0,
    devotionals: 0,
    courses: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topContent, setTopContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch collection counts
        const usersSnapshot = await getDocs(collection(db, "users"));
        const podcastsSnapshot = await getDocs(collection(db, "podcasts"));
        const devotionalsSnapshot = await getDocs(
          collection(db, "devotionals")
        );
        const coursesSnapshot = await getDocs(collection(db, "courses"));

        setStats({
          users: usersSnapshot.size,
          podcasts: podcastsSnapshot.size,
          devotionals: devotionalsSnapshot.size,
          courses: coursesSnapshot.size,
        });

        // Fetch recent activity
        const activityQuery = query(
          collection(db, "activity"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const activitySnapshot = await getDocs(activityQuery);
        const activityData = activitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ActivityItem[];
        setRecentActivity(activityData);

        // Fetch top content
        const contentQuery = query(
          collection(db, "contentStats"),
          orderBy("views", "desc"),
          limit(5)
        );
        const contentSnapshot = await getDocs(contentQuery);
        const contentData = contentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContentItem[];
        setTopContent(contentData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              App usage and engagement over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Content</CardTitle>
            <CardDescription>Most popular content this month</CardDescription>
          </CardHeader>
          <CardContent>
            <TopContent data={topContent} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and content changes</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity data={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
