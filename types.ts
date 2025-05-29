export interface Devotional {
  id: string
  title: string
  content: string
  author: string
  date: string
  imageURL: string
  verse?: string
  verseContent?: string
}

export interface Podcast {
  id: string
  title: string
  description: string
  host: string
  imageURL: string
  category?: string
  totalHours?: number
  episodes?: number
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  imageURL: string
  duration: string
  lessons: number
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  date: string
  imageURL: string
  likes: number
  comments: number
}

export interface Speaker {
  id: string
  name: string
  imageURL: string
  bio?: string
}

export interface User {
  id: string
  name: string
  email: string
  photoURL?: string
  bio?: string
  phone?: string
  favorites?: {
    devotionals?: string[]
    podcasts?: string[]
    courses?: string[]
    posts?: string[]
  }
  preferences?: {
    darkMode?: boolean
    notifications?: boolean
  }
}

export interface FavoriteItem {
  id: string
  userId: string
  itemId: string
  itemType: "devotional" | "podcast" | "course" | "post"
  title: string
  imageURL: string
  dateAdded: string
}
