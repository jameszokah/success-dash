"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileUploader } from "@/components/shared/file-uploader";
import {
  Plus,
  MoreHorizontal,
  Play,
  Clock,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PodcastEpisode } from "@/types";
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

interface EpisodeManagerProps {
  podcastId: string;
  podcastTitle: string;
}

export function EpisodeManager({
  podcastId,
  podcastTitle,
}: EpisodeManagerProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteEpisodeId, setDeleteEpisodeId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    artist: "",
    url: "",
    artwork: "",
    duration: 0,
    episodeNumber: 1,
    status: "draft",
  });

  // Fetch episodes
  useEffect(() => {
    fetchEpisodes();
  }, [podcastId]);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      const episodesQuery = query(
        collection(db, "podcastEpisodes"),
        where("podcastId", "==", podcastId),
        orderBy("episodeNumber", "desc")
      );

      const querySnapshot = await getDocs(episodesQuery);
      const episodesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PodcastEpisode[];

      setEpisodes(episodesData);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast.error("Failed to load episodes");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      artist: "",
      url: "",
      artwork: "",
      duration: 0,
      episodeNumber: episodes.length + 1,
      status: "draft",
    });
    setEditingEpisode(null);
  };

  const handleOpenDialog = (episode?: PodcastEpisode) => {
    if (episode) {
      setEditingEpisode(episode);
      setFormData({
        title: episode.title,
        description: episode.description || "",
        artist: episode.artist,
        url: episode.url,
        artwork: episode.artwork,
        duration: episode.duration,
        episodeNumber: episode.episodeNumber || 1,
        status: episode.status || "draft",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.artist || !formData.url) {
        throw new Error("Please fill in all required fields");
      }

      const episodeData = {
        title: formData.title,
        description: formData.description,
        artist: formData.artist,
        url: formData.url,
        artwork: formData.artwork,
        duration: formData.duration,
        episodeNumber: formData.episodeNumber,
        status: formData.status,
        podcastId,
        date: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      };

      if (editingEpisode) {
        // Update existing episode
        await updateDoc(
          doc(db, "podcastEpisodes", editingEpisode.id),
          episodeData
        );
        toast.success("Episode updated", {
          description: "Episode has been successfully updated",
        });
      } else {
        // Create new episode
        await addDoc(collection(db, "podcastEpisodes"), {
          ...episodeData,
          createdAt: serverTimestamp(),
        });
        toast.success("Episode created", {
          description: "New episode has been successfully created",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEpisodes();
    } catch (error) {
      console.error("Error saving episode:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save episode"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpisode = async () => {
    if (!deleteEpisodeId) return;

    try {
      await deleteDoc(doc(db, "podcastEpisodes", deleteEpisodeId));
      setEpisodes((prev) => prev.filter((ep) => ep.id !== deleteEpisodeId));
      toast.success("Episode deleted", {
        description: "Episode has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast.error("Failed to delete episode");
    } finally {
      setDeleteEpisodeId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Episodes</h3>
          <p className="text-sm text-muted-foreground">
            Manage episodes for &quot;{podcastTitle}&quot;
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Episode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEpisode ? "Edit Episode" : "Add New Episode"}
              </DialogTitle>
              <DialogDescription>
                {editingEpisode
                  ? "Update episode details"
                  : "Create a new episode for this podcast"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Episode Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter episode title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist/Host *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        artist: e.target.value,
                      }))
                    }
                    placeholder="Enter artist or host name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="episodeNumber">Episode Number</Label>
                  <Input
                    id="episodeNumber"
                    type="number"
                    min="1"
                    value={formData.episodeNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        episodeNumber: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Duration in seconds"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter episode description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Audio File *</Label>
                <FileUploader
                  accept="audio/*"
                  value={formData.url}
                  onUpload={(url) => setFormData((prev) => ({ ...prev, url }))}
                  maxSize={200} // 200MB
                  folder="podcasts/episodes"
                />
                {formData.url && (
                  <audio controls className="w-full mt-2">
                    <source src={formData.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>

              <div className="space-y-2">
                <Label>Episode Artwork</Label>
                <FileUploader
                  accept="image/*"
                  value={formData.artwork}
                  onUpload={(url) =>
                    setFormData((prev) => ({ ...prev, artwork: url }))
                  }
                  maxSize={5} // 5MB
                  folder="podcasts/episode-artwork"
                />
                {formData.artwork && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={formData.artwork || "/placeholder.svg"}
                      alt="Episode artwork"
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editingEpisode
                    ? "Update Episode"
                    : "Create Episode"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading episodes...</div>
      ) : episodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">No episodes yet</h4>
              <p className="text-muted-foreground mb-4">
                Start by adding your first episode to this podcast.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Episode
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {episodes.map((episode) => (
            <Card key={episode.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={
                          episode.artwork ||
                          "/placeholder.svg?height=64&width=64"
                        }
                        alt={episode.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">
                          {episode.title}
                        </h4>
                        <Badge
                          variant={
                            episode.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {episode.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {episode.artist}
                      </p>
                      {episode.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {episode.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(episode.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(episode.date).toLocaleDateString()}
                          </span>
                        </div>
                        {episode.episodeNumber && (
                          <span>Episode #{episode.episodeNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleOpenDialog(episode)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteEpisodeId(episode.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteEpisodeId}
        onOpenChange={() => setDeleteEpisodeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this episode? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEpisode}
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
