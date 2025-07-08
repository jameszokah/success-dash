"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QuoteForm } from "@/components/quotes/quote-form"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditQuotePage() {
  const params = useParams()
  const quoteId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setExists] = useState(true)

  useEffect(() => {
    async function checkQuote() {
      try {
        setLoading(true)
        const quoteDoc = await getDoc(doc(db, "quotes", quoteId))

        if (!quoteDoc.exists()) {
          setExists(false)
          setError("The quote you are looking for does not exist.")
        }
      } catch (error) {
        console.error("Error checking quote:", error)
        setError("Failed to load quote data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    checkQuote()
  }, [quoteId])

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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quote Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Quote</h2>
        <p className="text-muted-foreground">Update quote details</p>
      </div>

      <QuoteForm quoteId={quoteId} />
    </div>
  );
}
