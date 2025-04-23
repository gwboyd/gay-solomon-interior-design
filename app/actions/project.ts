"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type {
  Project,
  ProjectImage,
  HomepageSettings,
  NewProject,
  UpdateProject,
  NewProjectImage,
  UpdateProjectImage,
} from "@/types/project"

// Projects

export async function getProjects(): Promise<Project[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("projects").select("*").order("display_order")

  if (error) {
    console.error("Error fetching projects:", error)
    throw new Error("Failed to fetch projects")
  }

  return data || []
}

export async function getProjectsWithImages(): Promise<Project[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      images:project_images(*)
    `)
    .order("display_order")
    .order("display_order", { foreignTable: "images" })

  if (error) {
    console.error("Error fetching projects with images:", error)
    throw new Error("Failed to fetch projects with images")
  }

  // Sort images by display_order for each project (as a backup in case DB ordering fails)
  const projectsWithSortedImages = data?.map(project => ({
    ...project,
    images: project.images?.sort((a: ProjectImage, b: ProjectImage) => a.display_order - b.display_order)
  })) || []

  return projectsWithSortedImages
}

export async function getProject(id: number): Promise<Project | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }

  return data
}

export async function getProjectWithImages(id: number): Promise<Project | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      images:project_images(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching project ${id} with images:`, error)
    return null
  }

  return data
}

export async function createProject(project: NewProject): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("projects").insert(project).select("id").single()

    if (error) {
      console.error("Error creating project:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createProject:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateProject(project: UpdateProject): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const updateData: any = { ...project }
    delete updateData.id

    const { error } = await supabase.from("projects").update(updateData).eq("id", project.id)

    if (error) {
      console.error("Error updating project:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateProject:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteProject(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Note: This will also delete all project images due to ON DELETE CASCADE

    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteProject:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateProjectOrder(
  id: number,
  direction: "up" | "down",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current project
    const { data: currentProject, error: currentError } = await supabase
      .from("projects")
      .select("id, display_order")
      .eq("id", id)
      .single()

    if (currentError || !currentProject) {
      return { success: false, error: "Project not found" }
    }

    // Find the adjacent project
    const operator = direction === "up" ? "lt" : "gt"
    const order = direction === "up" ? "desc" : "asc"

    const { data: adjacentProject, error: adjacentError } = await supabase
      .from("projects")
      .select("id, display_order")
      .filter("display_order", operator, currentProject.display_order)
      .order("display_order", { ascending: order === "asc" })
      .limit(1)
      .single()

    if (adjacentError || !adjacentProject) {
      return { success: false, error: "No project to swap with" }
    }

    // Swap the display orders
    const { error: updateError } = await supabase
      .from("projects")
      .update({ display_order: adjacentProject.display_order })
      .eq("id", currentProject.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const { error: updateError2 } = await supabase
      .from("projects")
      .update({ display_order: currentProject.display_order })
      .eq("id", adjacentProject.id)

    if (updateError2) {
      return { success: false, error: updateError2.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateProjectOrder:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Project Images

export async function getProjectImages(projectId?: number): Promise<ProjectImage[]> {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("project_images").select("*").order("display_order")

  if (projectId !== undefined) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching project images:", error)
    throw new Error("Failed to fetch project images")
  }

  return data || []
}

export async function getProjectImage(id: number): Promise<ProjectImage | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("project_images").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching project image ${id}:`, error)
    return null
  }

  return data
}

export async function createProjectImage(
  projectImage: NewProjectImage,
  imageFile: File,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Upload to Vercel Blob
    const { put } = await import("@vercel/blob")
    const timestamp = Date.now()
    const filename = `project-images/${timestamp}-${imageFile.name.replace(/\s+/g, "-")}`

    const blob = await put(filename, imageFile, {
      access: "public",
    })

    // Create project image in database
    const { data, error } = await supabase
      .from("project_images")
      .insert({
        ...projectImage,
        image_url: blob.url,
        image_blob_url: blob.url,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating project image:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createProjectImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateProjectImage(
  projectImage: UpdateProjectImage,
  imageFile?: File,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const updateData: any = { ...projectImage }
    delete updateData.id

    // If there's a new image, upload it
    if (imageFile) {
      const { put } = await import("@vercel/blob")
      const timestamp = Date.now()
      const filename = `project-images/${timestamp}-${imageFile.name.replace(/\s+/g, "-")}`

      const blob = await put(filename, imageFile, {
        access: "public",
      })

      updateData.image_url = blob.url
      updateData.image_blob_url = blob.url
    }

    const { error } = await supabase.from("project_images").update(updateData).eq("id", projectImage.id)

    if (error) {
      console.error("Error updating project image:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateProjectImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteProjectImage(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Note: In a production app, you might want to also delete the image from Blob storage

    const { error } = await supabase.from("project_images").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project image:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteProjectImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateProjectImageOrder(
  id: number,
  direction: "up" | "down",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current image
    const { data: currentImage, error: currentError } = await supabase
      .from("project_images")
      .select("id, project_id, display_order")
      .eq("id", id)
      .single()

    if (currentError || !currentImage) {
      return { success: false, error: "Image not found" }
    }

    // Find the adjacent image
    const operator = direction === "up" ? "lt" : "gt"
    const order = direction === "up" ? "desc" : "asc"

    const { data: adjacentImage, error: adjacentError } = await supabase
      .from("project_images")
      .select("id, display_order")
      .eq("project_id", currentImage.project_id)
      .filter("display_order", operator, currentImage.display_order)
      .order("display_order", { ascending: order === "asc" })
      .limit(1)
      .single()

    if (adjacentError || !adjacentImage) {
      return { success: false, error: "No image to swap with" }
    }

    // Swap the display orders
    const { error: updateError } = await supabase
      .from("project_images")
      .update({ display_order: adjacentImage.display_order })
      .eq("id", currentImage.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const { error: updateError2 } = await supabase
      .from("project_images")
      .update({ display_order: currentImage.display_order })
      .eq("id", adjacentImage.id)

    if (updateError2) {
      return { success: false, error: updateError2.message }
    }

    revalidatePath("/portfolio")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateProjectImageOrder:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Homepage Settings

export async function getHomepageSettings(): Promise<HomepageSettings | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("homepage_settings")
    .select(`
      *,
      hero_image:project_images!homepage_settings_hero_image_id_fkey(*),
      about_image:project_images!homepage_settings_about_image_id_fkey(*)
    `)
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching homepage settings:", error)
    return null
  }

  return data
}

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
