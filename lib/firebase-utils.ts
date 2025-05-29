import { Timestamp } from "firebase/firestore"

// Convert Firebase timestamp to Date object
export function timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null
  return timestamp.toDate()
}

// Format date to string
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—"
  return date.toLocaleDateString()
}

// Convert JS Date to Firebase Timestamp
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date)
}

// Get server timestamp
export function getServerTimestamp() {
  return Timestamp.now()
}
