"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PostForm } from "@/components/posts/posts-form"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditPostPage() {
  const params = useParams()
  const postId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setExists] = useState(true)

  useEffect(() => {
    async function checkPost() {
      try {
        setLoading(true)
        const postDoc = await getDoc(doc(db, "posts", postId))

        if (!postDoc.exists()) {
          setExists(false)
          setError("The post you are looking for does not exist.")
        }
      } catch (error) {
        console.error("Error checking post:", error)
        setError("Failed to load post data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    checkPost()
  }, [postId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Post Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
        <p className="text-muted-foreground">Update post details</p>
      </div>

      <PostForm postId={postId} />
    </div>
  )
}
