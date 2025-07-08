"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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

interface Quote {
  id: string;
  quote: string;
  author: string;
  date: string;
  publishedAt: FieldValue;
  status: string;
}

interface QuoteFormProps {
  quoteId?: string;
}

export function QuoteForm({ quoteId }: QuoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!quoteId);
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Quote>>({
    quote: "",
    author: "",
    date: new Date().toISOString(),
    status: "draft",
  });

  // Fetch devotional data if editing
  useEffect(() => {
    async function fetchQuote() {
      if (!quoteId) return;

      try {
        setLoading(true);
        const quoteDoc = await getDoc(
          doc(db, "quotes", quoteId)
        );

        if (quoteDoc.exists()) {
          setFormData({
            id: quoteDoc.id,
            ...quoteDoc.data(),
          } as Quote);
        } else {
          toast.error("Quote not found", {
            description: "Quote not found",
          });
          router.push("/quotes");
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        toast.error("Failed to load quote data", {
          description: "Failed to load quote data",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, [quoteId, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        quote,
        author,
        status,
        date,
      } = formData;

      // Validate required fields
      if (!quote || !author) {
        toast.error("Please fill in all required fields");
        throw new Error("Please fill in all required fields");
      }

      const quoteData = {
        quote,
        author,
        status,
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        date,
      };

      // Add publishedAt date if status is published
      if (status === "published") {
        if (quoteId && formData.status !== "published") {
          // Only set publishedAt if it's a new publication
          quoteData.publishedAt = new Date().toISOString();
        } else if (!quoteId) {
          quoteData.publishedAt = new Date().toISOString();
        }
      }

      if (quoteId) {
        // Update existing quote
        await updateDoc(doc(db, "quotes", quoteId), quoteData);

        // Add to activity log
          await setDoc(doc(db, "activity", `quote_update_${Date.now()}`), {
          user: {
            name: user?.displayName || "", // Replace with actual user name
            email: user?.email || "", // Replace with actual user email
          },
          action: "updated",
          contentType: "quote",
          contentTitle: quote,
          timestamp: serverTimestamp(),
        });

        toast.success("Quote updated", {
          description: `Successfully updated "${quote}"`,
        });
      } else {
        // Create new quote
        const newQuoteRef = doc(collection(db, "quotes"));

        // Add createdAt for new quotes
        quoteData.createdAt = new Date().toISOString();

        await setDoc(newQuoteRef, quoteData);

        // Add to activity log
        await setDoc(doc(db, "activity", `quote_add_${Date.now()}`), {
          user: {
            name: user?.displayName || "",
            email: user?.email || "",
          },
          action: "added",
          contentType: "quote",
          contentTitle: quote,
          timestamp: serverTimestamp(),
        });

        toast.success("Quote created", {
          description: `Successfully created "${quote}"`,
        });
      }

      router.push("/quotes");
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote", {
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
              <Label htmlFor="quote">Quote</Label>
              <Input
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                placeholder="Enter quote"
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
                    ? "This quote will be visible to all users."
                    : "This quote will be saved as a draft and won't be visible to users."}
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
          onClick={() => router.push("/quotes")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : quoteId
            ? "Update Quote"
            : "Create Quote"}
        </Button>
      </div>
    </form>
  );
}
