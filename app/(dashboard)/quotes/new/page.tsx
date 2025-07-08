"use client";

import { QuoteForm } from "@/components/quotes/quote-form";

export default function NewQuotePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Quote</h2>
        <p className="text-muted-foreground">Create a new quote</p>
      </div>

      <QuoteForm />
    </div>
  );
}
