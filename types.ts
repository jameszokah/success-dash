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
  duration: string
  imageURL: string
  audioURL: string
  category?: string
  totalHours?: number
  episodes?: number
  date: string
  status?: string
  featured?: boolean
  trending?: boolean
  views?: number
  createdAt?: string
  updatedAt?: string
}

export interface PodcastEpisode {
  id: string
  title: string
  duration: number // in seconds
  url: string
  artwork: string
  artist: string
  description?: string
  date: string
  podcastId: string
  episodeNumber?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorPhotoUrl?: string
  imageURL: string
  rating: number
  reviewCount: number
  featured?: boolean
  trending?: boolean
  views?: number
  createdAt: string
  enrollments?: number
  duration: string
  lessons: number
  level: string
  offersCertificate?: boolean
  category?: string
  completed?: boolean
  progress?: number
}

export interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl: string
  thumbnail?: string
  description?: string
  completed?: boolean
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface CourseWithContent extends Course {
  sections: Section[]
  progress?: number
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
