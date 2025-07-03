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
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

interface Devotional {
  id: string;
  title: string;
  verse: string;
  verseContent?: string;
  content: string;
  type: string;
  author: string;
  date: string;
  imageURL?: string;
  publishedAt: FieldValue;
  status: string;
}

interface DevotionalFormProps {
  devotionalId?: string;
}

export function DevotionalForm({ devotionalId }: DevotionalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!devotionalId);
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Devotional>>({
    title: "",
    verse: "",
    verseContent: "",
    content: "",
    type: "devotional",
    author: "",
    date: new Date().toISOString(),
    imageURL: "",
    status: "draft",
  });

  // Fetch devotional data if editing
  useEffect(() => {
    async function fetchDevotional() {
      if (!devotionalId) return;

      try {
        setLoading(true);
        const devotionalDoc = await getDoc(
          doc(db, "devotionals", devotionalId)
        );

        if (devotionalDoc.exists()) {
          setFormData({
            id: devotionalDoc.id,
            ...devotionalDoc.data(),
          } as Devotional);
        } else {
          toast.error("Devotional not found", {
            description: "Devotional not found",
          });
          router.push("/devotionals");
        }
      } catch (error) {
        console.error("Error fetching devotional:", error);
        toast.error("Failed to load devotional data", {
          description: "Failed to load devotional data",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDevotional();
  }, [devotionalId, router, toast]);

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
        verse,
        verseContent,
        content,
        author,
        imageURL,
        status,
        type,
        date,
      } = formData;

      // Validate required fields
      if (!title || !verse || !content || !author) {
        toast.error("Please fill in all required fields");
        throw new Error("Please fill in all required fields");
      }

      const devotionalData = {
        title,
        verse,
        verseContent: verseContent || "",
        content,
        author,
        imageURL: type === "quote" ? "" : imageURL || "",
        status,
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type,
        date,
      };

      // Add publishedAt date if status is published
      if (status === "published") {
        if (devotionalId && formData.status !== "published") {
          // Only set publishedAt if it's a new publication
          devotionalData.publishedAt = new Date().toISOString();
        } else if (!devotionalId) {
          devotionalData.publishedAt = new Date().toISOString();
        }
      }

      if (devotionalId) {
        // Update existing devotional
        await updateDoc(doc(db, "devotionals", devotionalId), devotionalData);

        // Add to activity log
        await setDoc(doc(db, "activity", `devotional_update_${Date.now()}`), {
          user: {
            name: user?.displayName || "", // Replace with actual user name
            email: user?.email || "", // Replace with actual user email
          },
          action: "updated",
          contentType: "devotional",
          contentTitle: title,
          timestamp: serverTimestamp(),
        });

        toast.success("Devotional updated", {
          description: `Successfully updated "${title}"`,
        });
      } else {
        // Create new devotional
        const newDevotionalRef = doc(collection(db, "devotionals"));

        // Add createdAt for new devotionals
        devotionalData.createdAt = new Date().toISOString();

        await setDoc(newDevotionalRef, devotionalData);

        // Add to activity log
        await setDoc(doc(db, "activity", `devotional_add_${Date.now()}`), {
          user: {
            name: user?.displayName || "",
            email: user?.email || "",
          },
          action: "added",
          contentType: type === "quote" ? "quote" : "devotional",
          contentTitle: title,
          timestamp: serverTimestamp(),
        });

        toast.success("Devotional created", {
          description: `Successfully created "${title}"`,
        });
      }

      router.push("/devotionals");
    } catch (error) {
      console.error("Error saving devotional:", error);
      toast.error("Failed to save devotional", {
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
                placeholder="Enter devotional title"
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
            <Label htmlFor="verse">Bible Verse</Label>
            <Input
              id="verse"
              name="verse"
              value={formData.verse}
              onChange={handleChange}
              placeholder="e.g., John 3:16"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verseContent">Verse Content</Label>
            <Textarea
              id="verseContent"
              name="verseContent"
              value={formData.verseContent}
              onChange={handleChange}
              placeholder="Enter the verse content"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Devotional Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter devotional content"
              rows={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="type"
                name="type"
                value={formData.type}
                checked={formData.type === "quote"}
                onCheckedChange={(checked) =>
                  handleSelectChange("type", checked ? "quote" : "devotional")
                }
              />
              <Label htmlFor="type">Quote</Label>
              <p className="text-sm text-muted-foreground">
                {formData.type === "quote"
                  ? "This devotional will be a quote from a book, article, or other source."
                  : "This devotional will be a devotional from the Bible."}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                {!(formData.type == "quote") ? (
                  <>
                    <FileUploader
                      accept="image/*"
                      value={formData.imageURL}
                      onUpload={handleFileUpload}
                      maxSize={5} // 5MB
                      folder="devotionals/images"
                    />
                    {formData.imageURL && (
                      <div className="mt-4 flex justify-center">
                        <Image
                          src={formData.imageURL || "/placeholder.svg"}
                          alt="Devotional image"
                          width={300}
                          height={300}
                          className="h-48 w-auto rounded-md object-cover"
                        />
                      </div>
                    )}
                  </>
                ) : (
                    <>
                      <p className="text-sm text-muted-foreground/70 mb-2 "> Since you have selected a quote, you can no longer upload an image for the quote.</p>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground bg-gray-200 text-primary-foreground w-full h-32 px-4 py-2 rounded-md"
                    disabled
                  >
                    Upload Image
                      </button>
                      </>
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
                    ? "This devotional will be visible to all users."
                    : "This devotional will be saved as a draft and won't be visible to users."}
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
          onClick={() => router.push("/devotionals")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : devotionalId
            ? "Update Devotional"
            : "Create Devotional"}
        </Button>
      </div>
    </form>
  );
}
