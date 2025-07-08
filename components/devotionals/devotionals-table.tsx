"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search } from "lucide-react"
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Devotional {
  id: string
  title: string
  verse: string
  author: string
  publishedAt: string | null
  status: string
}

export function DevotionalsTable() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDevotional, setSelectedDevotional] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  console.log(devotionals)

  // Fetch devotionals from Firebase
  useEffect(() => {
    async function fetchDevotionals() {
      try {
        setLoading(true)
        const devotionalsRef = collection(db, "devotionals")
        const q = query(devotionalsRef, orderBy("title"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const devotionalsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Devotional[]

        setDevotionals(devotionalsData)
      } catch (error) {
        console.error("Error fetching devotionals:", error)
        toast.error("Failed to load devotionals. Please try again.", {
          description: "Failed to load devotionals. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDevotionals()
  }, [toast])

  const handleDeleteDevotional = async () => {
    if (!selectedDevotional) return

    try {
      await deleteDoc(doc(db, "devotionals", selectedDevotional))

      // Update the UI by removing the deleted devotional
      setDevotionals((prev) => prev.filter((devotional) => devotional.id !== selectedDevotional))

      toast.success("Devotional deleted", {
        description: "The devotional has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting devotional:", error)
      toast.error("Failed to delete devotional. Please try again.", {
        description: "Failed to delete devotional. Please try again.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedDevotional(null)
    }
  }

  const filteredDevotionals = devotionals.filter((devotional) => {
    const matchesSearch =
      devotional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      devotional.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      devotional.verse.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || devotional.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search devotionals..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Verse</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading devotionals...
                </TableCell>
              </TableRow>
            ) : filteredDevotionals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No devotionals found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDevotionals.map((devotional) => (
                <TableRow key={devotional.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/devotionals/${devotional.id}`} className="hover:underline">
                      {devotional.title}
                    </Link>
                  </TableCell>
                  <TableCell>{devotional.verse}</TableCell>
                  <TableCell>{devotional.author}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        devotional.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {devotional.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    {devotional.publishedAt ? new Date((devotional.publishedAt as unknown as Timestamp | string) instanceof Timestamp ? (devotional.publishedAt as unknown as Timestamp).toDate() : devotional.publishedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/devotionals/${devotional.id}`} className="w-full">
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDevotional(devotional.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the devotional and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDevotional} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
