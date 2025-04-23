"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import type {
  PortfolioItem,
  NewPortfolioItem,
  UpdatePortfolioItem,
  Category,
  HomepageSettings,
} from "@/types/portfolio"

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }

  return data || []
}

// Get all portfolio items with their categories
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      category:categories(id, name)
    `)
    .order("display_order")

  if (error) {
    console.error("Error fetching portfolio items:", error)
    throw new Error("Failed to fetch portfolio items")
  }

  return data || []
}

// Get a single portfolio item by ID
export async function getPortfolioItem(id: number): Promise<PortfolioItem | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("portfolio_items")
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching portfolio item ${id}:`, error)
    return null
  }

  return data
}

// Create a new portfolio item
export async function createPortfolioItem(
  item: NewPortfolioItem,
  imageFile: File,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `portfolio/${timestamp}-${imageFile.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, imageFile, {
      access: "public",
    })

    // Create portfolio item in database
    const { data, error } = await supabase
      .from("portfolio_items")
      .insert({
        ...item,
        image_url: blob.url,
        image_blob_url: blob.url,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating portfolio item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createPortfolioItem:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update a portfolio item
export async function updatePortfolioItem(
  item: UpdatePortfolioItem,
  imageFile?: File,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const updateData: any = { ...item }
    delete updateData.id

    // If there's a new image, upload it
    if (imageFile) {
      const timestamp = Date.now()
      const filename = `portfolio/${timestamp}-${imageFile.name.replace(/\s+/g, "-")}`

      const blob = await put(filename, imageFile, {
        access: "public",
      })

      updateData.image_url = blob.url
      updateData.image_blob_url = blob.url
    }

    const { error } = await supabase.from("portfolio_items").update(updateData).eq("id", item.id)

    if (error) {
      console.error("Error updating portfolio item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updatePortfolioItem:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Delete a portfolio item
export async function deletePortfolioItem(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Note: In a production app, you might want to also delete the image from Blob storage

    const { error } = await supabase.from("portfolio_items").delete().eq("id", id)

    if (error) {
      console.error("Error deleting portfolio item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in deletePortfolioItem:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update the display order of portfolio items
export async function updatePortfolioItemOrder(
  id: number,
  direction: "up" | "down",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current item
    const { data: currentItem, error: currentError } = await supabase
      .from("portfolio_items")
      .select("id, display_order")
      .eq("id", id)
      .single()

    if (currentError || !currentItem) {
      return { success: false, error: "Item not found" }
    }

    // Find the adjacent item
    const operator = direction === "up" ? "lt" : "gt"
    const order = direction === "up" ? "desc" : "asc"

    const { data: adjacentItem, error: adjacentError } = await supabase
      .from("portfolio_items")
      .select("id, display_order")
      .filter("display_order", operator, currentItem.display_order)
      .order("display_order", { ascending: order === "asc" })
      .limit(1)
      .single()

    if (adjacentError || !adjacentItem) {
      return { success: false, error: "No item to swap with" }
    }

    // Swap the display orders
    const { error: updateError } = await supabase
      .from("portfolio_items")
      .update({ display_order: adjacentItem.display_order })
      .eq("id", currentItem.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const { error: updateError2 } = await supabase
      .from("portfolio_items")
      .update({ display_order: currentItem.display_order })
      .eq("id", adjacentItem.id)

    if (updateError2) {
      return { success: false, error: updateError2.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updatePortfolioItemOrder:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get homepage settings
export async function getHomepageSettings(): Promise<HomepageSettings | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("homepage_settings")
    .select(`
      *,
      hero_image:portfolio_items!homepage_settings_hero_image_id_fkey(*),
      about_image:portfolio_items!homepage_settings_about_image_id_fkey(*),
      featured_1:portfolio_items!homepage_settings_featured_1_id_fkey(*),
      featured_2:portfolio_items!homepage_settings_featured_2_id_fkey(*),
      featured_3:portfolio_items!homepage_settings_featured_3_id_fkey(*)
    `)
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching homepage settings:", error)
    return null
  }

  return data
}

// Update homepage settings
export async function updateHomepageSettings(
  settings: Partial<HomepageSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("homepage_settings").update(settings).eq("id", 1)

    if (error) {
      console.error("Error updating homepage settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateHomepageSettings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
