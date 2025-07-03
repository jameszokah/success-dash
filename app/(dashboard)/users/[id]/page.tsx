"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { formatDate, timestampToDate } from "@/lib/firebase-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: string;
  status: string;
  createdAt: Timestamp;
  bio?: string;
  phone?: string;
}

interface UserActivity {
  id: string;
  type: string;
  title: string;
  timestamp: Timestamp;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);

        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", userId));

        if (!userDoc.exists()) {
          setError("User not found");
          return;
        }

        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;

        setUser(userData);

        // Fetch user activity
        const activityQuery = query(
          collection(db, "userActivity"),
          where("userId", "==", userId)
        );

        const activitySnapshot = await getDocs(activityQuery);
        const activityData = activitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserActivity[];

        setUserActivity(activityData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Not Found</h2>
          <p className="text-muted-foreground">
            The user you are looking for does not exist.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/users")}>
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.photoURL || "/placeholder.svg"}
                alt={user.name}
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status}
              </div>
              <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {user.role}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Additional user information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {formatDate(timestampToDate(user.createdAt))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
                {userActivity.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {userActivity.map((activity) => (
                      <li key={activity.id} className="text-sm">
                        <span className="font-medium">{activity.type}:</span>{" "}
                        {activity.title} -{" "}
                        {formatDate(timestampToDate(activity.timestamp))}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Content</CardTitle>
              <CardDescription>Content saved by the user</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would be populated with data from Firebase */}
              <p className="text-muted-foreground">No favorites found</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewing History</CardTitle>
              <CardDescription>Content viewed by the user</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would be populated with data from Firebase */}
              <p className="text-muted-foreground">No viewing history found</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Manage user settings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would be populated with data from Firebase */}
              <p className="text-muted-foreground">No custom settings found</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
