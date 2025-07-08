"use client"

import { PostForm } from "@/components/posts/posts-form";

  export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Post</h2>
        <p className="text-muted-foreground">Create a new post</p>
      </div>

      <PostForm />
    </div>
  )
}
