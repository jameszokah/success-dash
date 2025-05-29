"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(email, password)
      toast.success("Login successful", {
        description: "Welcome back to SuccessLife Admin",
      })
      router.push("/dashboard")
      console.log('signIn', true)
      } catch (error: any) {
      let errorMessage = "Failed to sign in"

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled"
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Try again later"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid email or password";
      } else if (error.message.includes("Unauthorized")) {
        errorMessage =
          "You don't have permission to access the admin dashboard";
      }

      setError(errorMessage)
      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full p-2">
            <Image
              src="/icon-light.png"
              alt="logo"
              width={200}
              height={200}
              className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">SuccessLife Admin</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@successlife.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
