"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EpisodeManager } from "@/components/podcasts/episode-manager";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Podcast } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastEpisodesPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPodcast() {
      try {
        const podcastDoc = await getDoc(doc(db, "podcasts", podcastId));
        if (podcastDoc.exists()) {
          setPodcast({
            id: podcastDoc.id,
            ...podcastDoc.data(),
          } as Podcast);
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPodcast();
  }, [podcastId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Podcast Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The podcast you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/podcasts")}>
          Back to Podcasts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/podcasts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Podcasts
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{podcast.title}</h1>
          <p className="text-muted-foreground">
            Manage episodes for this podcast
          </p>
        </div>
      </div>

      <EpisodeManager podcastId={podcastId} podcastTitle={podcast.title} />
    </div>
  );
}
