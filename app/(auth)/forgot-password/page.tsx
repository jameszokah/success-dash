"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import Image from "next/image";
import { FirebaseError } from "firebase/app";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent", {
        description: "Check your email for instructions to reset your password",
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to send reset email";
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email address";
        }
        if (error.code === "auth/user-not-found") {
          errorMessage = "No account found with this email";
        }
      }

      setError(errorMessage);
      toast.error("Request failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              className="h-16 w-16 text-primary-foreground"
            />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your email and follow the instructions.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
