export interface Category {
  id: number
  name: string
  created_at: string
}

export interface PortfolioItem {
  id: number
  title: string
  description: string | null
  category_id: number
  image_url: string
  image_blob_url: string
  display_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface HomepageSettings {
  id: number
  hero_image_id: number | null
  about_image_id: number | null
  featured_1_id: number | null
  featured_2_id: number | null
  featured_3_id: number | null
  updated_at: string
  hero_image?: PortfolioItem
  about_image?: PortfolioItem
  featured_1?: PortfolioItem
  featured_2?: PortfolioItem
  featured_3?: PortfolioItem
}

export interface PortfolioItemWithCategory extends PortfolioItem {
  category: Category
}

export interface NewPortfolioItem {
  title: string
  description?: string
  category_id: number
  image_url: string
  image_blob_url: string
  display_order: number
}

export interface UpdatePortfolioItem {
  id: number
  title?: string
  description?: string
  category_id?: number
  image_url?: string
  image_blob_url?: string
  display_order?: number
}
