"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { setToken } from "@/app/actions"

declare module "firebase/auth" {
  interface User {
    accessToken: string
  }
}

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Check if user is an admin
        try {
          const userDoc = await getDoc(doc(db, "admins", user.uid))
          if (userDoc.exists()) {
            setUserRole("admin")
            await setToken(user.accessToken)
          } else {
            // If not in admins collection, check role in users collection
            const regularUserDoc = await getDoc(doc(db, "users", user.uid))
            if (regularUserDoc.exists() && regularUserDoc.data().role === "admin") {
              setUserRole("admin")
              await setToken(user.accessToken)
            } else {
              setUserRole("user")
              // Redirect non-admin users
              router.push("/unauthorized")
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      

      // Check if user is an admin
      const userDoc = await getDoc(doc(db, "admins", user.uid))
      if (!userDoc.exists()) {
        console.log("user", user)
        // Check regular users collection
        const regularUserDoc = await getDoc(doc(db, "users", user.uid))
        console.log('regularUserDoc.data()', regularUserDoc.data())
        if (!regularUserDoc.exists() || regularUserDoc.data().role !== "admin") {
          await signOut(auth)
          throw new Error("Unauthorized: Only admin users can access the dashboard")
        }
      }
      

      return
    } catch (error: unknown) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, logOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
