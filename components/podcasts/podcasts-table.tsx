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
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
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

interface Podcast {
  id: string
  title: string
  host: string
  category: string
  publishedAt: string | null
  status: string
}

export function PodcastsTable() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch podcasts from Firebase
  useEffect(() => {
    async function fetchPodcasts() {
      try {
        setLoading(true)
        const podcastsRef = collection(db, "podcasts")
        const q = query(podcastsRef, orderBy("title"))
        const querySnapshot = await getDocs(q)

        const podcastsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Podcast[]

        setPodcasts(podcastsData)
      } catch (error) {
        console.error("Error fetching podcasts:", error)
        toast.error("Failed to load podcasts. Please try again.", {
          description: "Failed to load podcasts. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPodcasts()
  }, [toast])

  const handleDeletePodcast = async () => {
    if (!selectedPodcast) return

    try {
      await deleteDoc(doc(db, "podcasts", selectedPodcast))

      // Update the UI by removing the deleted podcast
      setPodcasts((prev) => prev.filter((podcast) => podcast.id !== selectedPodcast))

      toast.success("Podcast deleted", {
        description: "The podcast has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting podcast:", error)
      toast.error("Failed to delete podcast. Please try again.", {
        description: "Failed to delete podcast. Please try again.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedPodcast(null)
    }
  }

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.host.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || podcast.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search podcasts..."
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
              <TableHead>Host</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading podcasts...
                </TableCell>
              </TableRow>
            ) : filteredPodcasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No podcasts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPodcasts.map((podcast) => (
                <TableRow key={podcast.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/podcasts/${podcast.id}`} className="hover:underline">
                      {podcast.title}
                    </Link>
                  </TableCell>
                  <TableCell>{podcast.host}</TableCell>
                  <TableCell>{podcast.category}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        podcast.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {podcast.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    {podcast.publishedAt ? new Date(podcast.publishedAt).toLocaleDateString() : "—"}
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
                          <Link href={`/podcasts/${podcast.id}`} className="w-full">
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPodcast(podcast.id)
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
              This action cannot be undone. This will permanently delete the podcast and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePodcast} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
