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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/shared/file-uploader";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  FieldValue,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;  
  author: string;
  date: string;
  category: string;
  readTime: string;
  imageURL?: string;
  publishedAt: FieldValue;
  status: string;
}

interface PostFormProps {
  postId?: string;
}

export function PostForm({ postId }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Post>>({
    title: "",
    content: "",
    author: "",
    date: new Date().toISOString(),
    category: "",
    readTime: "3 mins read",
    imageURL: "",
    status: "draft",
  });

  // Fetch devotional data if editing
  useEffect(() => {
    async function fetchDevotional() {
      if (!postId) return;

      try {
        setLoading(true);
        const postDoc = await getDoc(
          doc(db, "posts", postId)
        );

        if (postDoc.exists()) {
          setFormData({
            id: postDoc.id,
            ...postDoc.data(),
          } as Post);
        } else {
          toast.error("Devotional not found", {
            description: "Devotional not found",
          });
          router.push("/posts");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post data", {
          description: "Failed to load post data",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDevotional();
  }, [postId, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageURL: url,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        title,
        content,
        author,
        category,
        readTime,
        imageURL,
        status,
        date,
      } = formData;

      // Validate required fields
      if (!title || !content || !author || !category) {
        toast.error("Please fill in all required fields");
        throw new Error("Please fill in all required fields");
      }

      const postData = {
        title,
        content,
        author,
        category,
        readTime,
        imageURL: imageURL || "",
        status,
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        date,
      };

      // Add publishedAt date if status is published
      if (status === "published") {
        if (postId && formData.status !== "published") {
          // Only set publishedAt if it's a new publication
          postData.publishedAt = new Date().toISOString();
        } else if (!postId) {
          postData.publishedAt = new Date().toISOString();
        }
      }

      if (postId) {
        // Update existing post
        await updateDoc(doc(db, "posts", postId), postData);

        // Add to activity log
        await setDoc(doc(db, "activity", `post_update_${Date.now()}`), {
          user: {
            name: user?.displayName || "", // Replace with actual user name
            email: user?.email || "", // Replace with actual user email
          },
          action: "updated",
          contentType: "post",
          contentTitle: title,
          timestamp: serverTimestamp(),
        });

        toast.success("Post updated", {
          description: `Successfully updated "${title}"`,
        });
      } else {
        // Create new post
        const newPostRef = doc(collection(db, "posts"));

        // Add createdAt for new posts
        postData.createdAt = new Date().toISOString();

        await setDoc(newPostRef, postData);

        // Add to activity log
        await setDoc(doc(db, "activity", `post_add_${Date.now()}`), {
          user: {
            name: user?.displayName || "",
            email: user?.email || "",
          },
          action: "added",
          contentType: "post",
          contentTitle: title,
          timestamp: serverTimestamp(),
        });

        toast.success("Post created", {
          description: `Successfully created "${title}"`,
        });
      }

      router.push("/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="publish">Publishing</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 pt-4">
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
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="publish">Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select

              name="category"
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            > 
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devotional">Devotional</SelectItem>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="testimony">Testimony</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter post content"
              rows={10}
              required
            />
          </div>

        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                
                  
                    <FileUploader
                      accept="image/*"
                      value={formData.imageURL}
                      onUpload={handleFileUpload}
                      maxSize={5} // 5MB
                      folder="posts/images"
                    />
                    {formData.imageURL && (
                      <div className="mt-4 flex justify-center">
                        <Image
                          src={formData.imageURL || "/placeholder.svg"}
                          alt="Post image"
                          width={300}
                          height={300}
                          className="h-48 w-auto rounded-md object-cover"
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
                    ? "This post will be visible to all users."
                    : "This post will be saved as a draft and won't be visible to users."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/posts")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : postId
            ? "Update Post"
            : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
