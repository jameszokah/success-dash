import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const formattedMinutes = String(minutes).padStart(2, "0")
  const formattedSeconds = String(remainingSeconds).padStart(2, "0")

  return `${formattedMinutes}:${formattedSeconds}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDuration = (duration: string) => {
    // Convert duration to minutes:seconds format if needed
    if (duration.includes(":")) return duration;
    const minutes = Math.floor(Number(duration) / 60);
    const seconds = Number(duration) % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };