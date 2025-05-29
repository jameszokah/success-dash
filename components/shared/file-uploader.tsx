"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X } from "lucide-react"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { v4 as uuidv4 } from "uuid"

interface FileUploaderProps {
  accept: string
  value?: string
  onUpload: (url: string) => void
  maxSize: number // in MB
  folder?: string // Firebase storage folder path
}

export function FileUploader({ accept, value, onUpload, maxSize, folder = "uploads" }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create a unique file name
      const fileExtension = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const storageRef = ref(storage, `${folder}/${fileName}`)

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          setError("Error uploading file. Please try again.")
          setIsUploading(false)
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          onUpload(downloadURL)
          setIsUploading(false)
        },
      )
    } catch (error) {
      console.error("File upload error:", error)
      setError("Error uploading file. Please try again.")
      setIsUploading(false)
    }
  }

  const handleClear = async () => {
    if (value && value.includes("firebase")) {
      try {
        // Extract the file path from the URL
        const fileRef = ref(storage, value)
        await deleteObject(fileRef)
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    }

    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {!value && !isUploading ? (
        <>
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload {accept.includes("image") ? "Image" : "Audio"}
          </Button>
          <input type="file" accept={accept} ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      ) : isUploading ? (
        <div className="space-y-2">
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-sm text-muted-foreground">Uploading... {Math.round(progress)}%</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border p-2">
          <div className="flex items-center gap-2">
            {accept.includes("image") ? (
              <img src={value || "/placeholder.svg"} alt="Uploaded" className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            )}
            <span className="text-sm truncate max-w-[200px]">
              {value ? value.split("/").pop() || "Uploaded file" : ""}
            </span>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
