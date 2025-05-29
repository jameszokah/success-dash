"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Headphones, BookOpen, Video, Settings, Menu, LogOut, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { deleteToken } from "../actions"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Podcasts",
    href: "/podcasts",
    icon: <Headphones className="mr-2 h-4 w-4" />,
  },
  {
    title: "Devotionals",
    href: "/devotionals",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: <Video className="mr-2 h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, userRole, loading, logOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isDesktop])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="space-y-4 w-[280px]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  // If not authenticated, don't render the layout
  if (!user) {
    return null
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-full p-2">
            <Image
              src="/icon-light.png"
              alt="logo"
              width={200}
              height={200}
              className="h-14 w-14 text-primary-foreground"
            />
          </div>
          <h1 className="text-xl font-bold">SuccessLife</h1>
        </Link>
      </div>
      <Separator />
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-muted text-primary"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <Separator />
      <div className="p-4">
        <div className="flex items-center gap-4 py-4">
          <Avatar>
            <AvatarImage
              src={user?.photoURL || undefined}
              alt={user?.displayName || "Admin"}
            />
            <AvatarFallback>
              {user?.displayName?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user?.displayName || "Admin User"}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={() => {
            deleteToken()
            logOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {isDesktop ? (
        <div className="grid lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <h1 className="text-xl font-semibold">
                {navItems.find((item) => item.href === pathname)?.title || "Dashboard"}
              </h1>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-2">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold">
                {navItems.find((item) => item.href === pathname)?.title || "Dashboard"}
              </h1>
            </div>
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "Admin"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      )}
    </div>
  )
}
