import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - SuccessLife Admin",
  description: "Authentication for SuccessLife Admin Dashboard",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </div>
  )
}
