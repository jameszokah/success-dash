"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/shared/file-uploader"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { collection } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Podcast {
  id: string
  title: string
  host: string
  category: string
  description: string
  audioUrl: string
  imageUrl: string
  publishedAt: string | null
  status: string
}

interface PodcastFormProps {
  podcastId?: string
}

export function PodcastForm({ podcastId }: PodcastFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(!!podcastId)

  const [formData, setFormData] = useState<Partial<Podcast>>({
    title: "",
    host: "",
    category: "",
    description: "",
    audioUrl: "",
    imageUrl: "",
    status: "draft",
  })

  // Fetch podcast data if editing
  useEffect(() => {
    async function fetchPodcast() {
      if (!podcastId) return

      try {
        setLoading(true)
        const podcastDoc = await getDoc(doc(db, "podcasts", podcastId))

        if (podcastDoc.exists()) {
          setFormData({
            id: podcastDoc.id,
            ...podcastDoc.data(),
          } as Podcast)
        } else {
          toast.error("Podcast not found", {
            description: "Podcast not found",
          })
          router.push("/podcasts")
        }
      } catch (error) {
        console.error("Error fetching podcast:", error)
        toast.error("Failed to load podcast data", {
          description: "Failed to load podcast data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPodcast()
  }, [podcastId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (type: "audio" | "image", url: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === "audio" ? "audioUrl" : "imageUrl"]: url,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { title, host, category, description, audioUrl, imageUrl, status } = formData

      // Validate required fields
      if (!title || !host || !category || !description) {
        throw new Error("Please fill in all required fields")
      }

      const podcastData = {
        title,
        host,
        category,
        description,
        audioUrl: audioUrl || "",
        imageUrl: imageUrl || "",
        status,
        updatedAt: serverTimestamp(),
      }

      // Add publishedAt date if status is published
      if (status === "published") {
        if (podcastId && formData.status !== "published") {
          // Only set publishedAt if it's a new publication
          podcastData.publishedAt = serverTimestamp()
        } else if (!podcastId) {
          podcastData.publishedAt = serverTimestamp()
        }
      }

      if (podcastId) {
        // Update existing podcast
        await updateDoc(doc(db, "podcasts", podcastId), podcastData)

        // Add to activity log
        await setDoc(doc(db, "activity", `podcast_update_${Date.now()}`), {
          user: {
            name: "Admin User", // Replace with actual user name
            email: "admin@example.com", // Replace with actual user email
          },
          action: "updated",
          contentType: "podcast",
          contentTitle: title,
          timestamp: serverTimestamp(),
        })

        toast.success("Podcast updated", {
          title: "Podcast updated",
          description: `Successfully updated "${title}"`,
        })
      } else {
        // Create new podcast
        const newPodcastRef = doc(collection(db, "podcasts"))

        // Add createdAt for new podcasts
        podcastData.createdAt = serverTimestamp()

        await setDoc(newPodcastRef, podcastData)

        // Add to activity log
        await setDoc(doc(db, "activity", `podcast_add_${Date.now()}`), {
          user: {
            name: "Admin User", // Replace with actual user name
            email: "admin@example.com", // Replace with actual user email
          },
          action: "added",
          contentType: "podcast",
          contentTitle: title,
          timestamp: serverTimestamp(),
        })

        toast({
          title: "Podcast created",
          description: `Successfully created "${title}"`,
        })
      }

      router.push("/podcasts")
    } catch (error) {
      console.error("Error saving podcast:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="publish">Publishing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="publish">Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter podcast title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="Enter host name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category || ""} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faith">Faith</SelectItem>
                <SelectItem value="Prayer">Prayer</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Worship">Worship</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter podcast description"
              rows={5}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Podcast Audio</Label>
                <FileUploader
                  accept="audio/*"
                  value={formData.audioUrl}
                  onUpload={(url) => handleFileUpload("audio", url)}
                  maxSize={100} // 100MB
                  folder="podcasts/audio"
                />
                {formData.audioUrl && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={formData.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Podcast Cover Image</Label>
                <FileUploader
                  accept="image/*"
                  value={formData.imageUrl}
                  onUpload={(url) => handleFileUpload("image", url)}
                  maxSize={5} // 5MB
                  folder="podcasts/images"
                />
                {formData.imageUrl && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={formData.imageUrl || "/placeholder.svg"}
                      alt="Podcast cover"
                      className="h-48 w-48 rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "draft"}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.status === "published"
                    ? "This podcast will be visible to all users."
                    : "This podcast will be saved as a draft and won't be visible to users."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/podcasts")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : podcastId ? "Update Podcast" : "Create Podcast"}
        </Button>
      </div>
    </form>
  )
}
