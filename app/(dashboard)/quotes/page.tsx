import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { QuotesTable } from "@/components/quotes/quote-table";

export default function QuotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quotes</h2>
          <p className="text-muted-foreground">
            Manage and create quotes
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button asChild variant="outline">
            <Link href="/quotes/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Quotes
            </Link>
          </Button> */}
          <Button asChild>
            <Link href="/quotes/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Quote
            </Link>
          </Button>
        </div>
      </div>

      <QuotesTable />
    </div>
  );
}
