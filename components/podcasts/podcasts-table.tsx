"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Clock,
  Headphones,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Podcast } from "@/types";
import Image from "next/image";

export function PodcastsTable() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch podcasts from Firebase
  useEffect(() => {
    async function fetchPodcasts() {
      try {
        setLoading(true);
        const podcastsRef = collection(db, "podcasts");
        const q = query(podcastsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const podcastsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const podcastData = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as Podcast;

            // Get episode count for each podcast
            const episodesQuery = query(
              collection(db, "podcastEpisodes"),
              where("podcastId", "==", docSnapshot.id)
            );
            const episodeCount = await getCountFromServer(episodesQuery);
            podcastData.episodes = episodeCount.data().count;

            // Calculate total duration from episodes
            const episodesSnapshot = await getDocs(episodesQuery);
            let totalDuration = 0;
            episodesSnapshot.docs.forEach((episodeDoc) => {
              const episode = episodeDoc.data();
              totalDuration += episode.duration || 0;
            });

            // Convert seconds to hours
            podcastData.totalHours =
              Math.round((totalDuration / 3600) * 10) / 10;

            return podcastData;
          })
        );

        setPodcasts(podcastsData);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
        toast.error("Failed to load podcasts. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPodcasts();
  }, [toast]);

  const handleDeletePodcast = async () => {
    if (!selectedPodcast) return;

    try {
      // Delete all episodes first
      const episodesQuery = query(
        collection(db, "podcastEpisodes"),
        where("podcastId", "==", selectedPodcast)
      );
      const episodesSnapshot = await getDocs(episodesQuery);

      const deletePromises = episodesSnapshot.docs.map((episodeDoc) =>
        deleteDoc(doc(db, "podcastEpisodes", episodeDoc.id))
      );
      await Promise.all(deletePromises);

      // Delete the podcast
      await deleteDoc(doc(db, "podcasts", selectedPodcast));

      // Update the UI
      setPodcasts((prev) =>
        prev.filter((podcast) => podcast.id !== selectedPodcast)
      );

      toast.success("Podcast deleted", {
        description:
          "The podcast and all its episodes have been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting podcast:", error);
      toast.error("Failed to delete podcast. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPodcast(null);
    }
  };

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || podcast.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || podcast.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  };

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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="faith">Faith</SelectItem>
              <SelectItem value="prayer">Prayer</SelectItem>
              <SelectItem value="worship">Worship</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="recommended">Recommended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Podcast</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Episodes</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading podcasts...
                </TableCell>
              </TableRow>
            ) : filteredPodcasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No podcasts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPodcasts.map((podcast) => (
                <TableRow key={podcast.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={
                            podcast.imageURL ||
                            "/placeholder.svg?height=48&width=48"
                          }
                          alt={podcast.title}
                          className="h-full w-full object-cover"
                          width={1000}
                          height={1000}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/podcasts/${podcast.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {podcast.title}
                        </Link>
                        <p className="text-sm text-muted-foreground w-48 line-clamp-1">
                          {podcast.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{podcast.host}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {podcast.category || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Headphones className="h-4 w-4 text-muted-foreground" />
                      <span>{podcast.episodes || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(podcast.totalHours || 0)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        podcast.status === "published" ? "default" : "secondary"
                      }
                      className={
                        podcast.status === "published"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {podcast.status || "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {podcast.date
                      ? new Date(podcast.date).toLocaleDateString()
                      : "—"}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/podcasts/${podcast.id}`}>
                            Edit Podcast
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/podcasts/${podcast.id}/episodes`}>
                            Manage Episodes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPodcast(podcast.id);
                            setIsDeleteDialogOpen(true);
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              podcast and all its episodes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePodcast}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
