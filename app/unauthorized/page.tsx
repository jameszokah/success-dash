"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { logOut } = useAuth()

  const handleLogout = async () => {
    await logOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this area</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            This dashboard is restricted to administrators only. If you believe you should have access, please contact
            your system administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
