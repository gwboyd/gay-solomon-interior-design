export interface Project {
  id: number
  name: string
  description: string | null
  location: string | null
  display_order: number
  created_at: string
  updated_at: string
  images?: ProjectImage[]
}

export interface ProjectImage {
  id: number
  project_id: number
  title: string
  description: string | null
  image_url: string
  image_blob_url: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface HomepageSettings {
  id: number
  hero_image_id: number | null
  about_image_id: number | null
  updated_at: string
  hero_image?: ProjectImage
  about_image?: ProjectImage
}

export interface NewProject {
  name: string
  description?: string
  location?: string
  display_order: number
}

export interface UpdateProject {
  id: number
  name?: string
  description?: string
  location?: string
  display_order?: number
}

export interface NewProjectImage {
  project_id: number
  title: string
  description?: string
  image_url: string
  image_blob_url: string
  display_order: number
}

export interface UpdateProjectImage {
  id: number
  project_id?: number
  title?: string
  description?: string
  image_url?: string
  image_blob_url?: string
  display_order?: number
}

export interface Message {
  id: number
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}

export interface NewMessage {
  name: string
  email: string
  message: string
}
