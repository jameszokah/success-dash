import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostsTable } from "@/components/posts/posts-table";

export default function PostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">
            Manage and create Posts
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button asChild variant="outline">
            <Link href="/devotionals/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Posts
            </Link>
          </Button> */}
          <Button asChild>
            <Link href="/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Posts
            </Link>
          </Button>
        </div>
      </div>

      <PostsTable />
    </div>
  );
}
