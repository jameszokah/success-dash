"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FileUploader } from "@/components/shared/file-uploader";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Podcast } from "@/types";
import { getHours, parse } from "date-fns";

interface PodcastFormProps {
  podcastId?: string;
}

export function PodcastForm({ podcastId }: PodcastFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!podcastId);

  const [formData, setFormData] = useState<Partial<Podcast>>({
    title: "",
    description: "",
    host: "",
    duration: "",
    imageURL: "",
    audioURL: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    status: "draft",
    featured: false,
    trending: false,
  });

  // Fetch podcast data if editing
  useEffect(() => {
    async function fetchPodcast() {
      if (!podcastId) return;

      try {
        setLoading(true);
        const podcastDoc = await getDoc(doc(db, "podcasts", podcastId));

        if (podcastDoc.exists()) {
          const data = podcastDoc.data() as Podcast;
          setFormData({
            ...data,
            date: data.date
              ? new Date(data.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
        } else {
          toast.error("Podcast not found");
          router.push("/podcasts");
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
        toast.error("Failed to load podcast data");
      } finally {
        setLoading(false);
      }
    }

    fetchPodcast();
  }, [podcastId, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileUpload = (type: "audio" | "image", url: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === "audio" ? "audioURL" : "imageURL"]: url,
    }));
  };

  function extractHours(time: string): number {
    if (/h|m/.test(time)) {
      // Match formats like 1h:32m, 1h32min, 1h, etc.
      const match = time.match(/(?:(\d+)h)?(?::)?(?:(\d+)(?:m|min))?/);
      return match?.[1] ? parseInt(match[1]) : 0;
    } else {
      const date = parse(time, "HH:mm", new Date());
      return getHours(date);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        title,
        description,
        host,
        duration,
        imageURL,
        audioURL,
        category,
        date,
        status,
        featured,
        trending,
      } = formData;

      // Validate required fields
      if (!title || !description || !host || !category) {
        throw new Error("Please fill in all required fields");
      }

      const podcastData = {
        title,
        description,
        host,
        duration: duration || "",
        imageURL: imageURL || "",
        audioURL: audioURL || "",
        category,
        date: date || new Date().toISOString(),
        totalHours: duration && duration !== "" ? extractHours(duration) : 0,
        status: status || "draft",
        featured: featured || false,
        trending: trending || false,
        updatedAt: serverTimestamp(),
      };

      if (podcastId) {
        // Update existing podcast
        await updateDoc(doc(db, "podcasts", podcastId), podcastData);

        toast.success("Podcast updated", {
          description: `Successfully updated "${title}"`,
        });
      } else {
        // Create new podcast
        const newPodcastRef = doc(collection(db, "podcasts"));

        await setDoc(newPodcastRef, {
          ...podcastData,
          createdAt: serverTimestamp(),
          episodes: 0,
          totalHours: podcastData.duration && podcastData.duration !== "" ? extractHours(podcastData.duration) : 0,
          views: 0,
        });

        toast.success("Podcast created", {
          description: `Successfully created "${title}"`,
        });
      }

      router.push("/podcasts");
    } catch (error) {
      console.error("Error saving podcast:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Skeleton className="h-64 w-full" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Podcast Title *</Label>
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
                  <Label htmlFor="host">Host *</Label>
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faith">Faith</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="recommended">Recommended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 45:30 or 1h 30m"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Podcast Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FileUploader
                  accept="image/*"
                  value={formData.imageURL}
                  onUpload={(url) => handleFileUpload("image", url)}
                  maxSize={5} // 5MB
                  folder="podcasts/images"
                />
                {formData.imageURL && (
                  <div className="flex justify-center">
                    <img
                      src={formData.imageURL || "/placeholder.svg"}
                      alt="Podcast cover"
                      className="h-48 w-48 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Main Audio File (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a main audio file for this podcast series, or manage
                  individual episodes separately.
                </p>
                <FileUploader
                  accept="audio/*"
                  value={formData.audioURL}
                  onUpload={(url) => handleFileUpload("audio", url)}
                  maxSize={200} // 200MB
                  folder="podcasts/audio"
                />
                {formData.audioURL && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={formData.audioURL} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Podcast Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Podcast</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this podcast in the featured section
                  </p>
                </div>
                <Switch
                  checked={formData.featured || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("featured", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trending</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this podcast as trending
                  </p>
                </div>
                <Switch
                  checked={formData.trending || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("trending", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || "draft"}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/podcasts")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : podcastId
            ? "Update Podcast"
            : "Create Podcast"}
        </Button>
      </div>
    </form>
  );
}
