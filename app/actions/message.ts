"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Message, NewMessage } from "@/types/project"

export async function createMessage(message: NewMessage): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("messages").insert({
      name: message.name,
      email: message.email,
      message: message.message,
      read: false,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error creating message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getMessages(): Promise<Message[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return data || []
}

export async function markMessageAsRead(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error marking message as read:", error)
    return { success: false, error: "Failed to mark message as read" }
  }
}

export async function deleteMessage(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting message:", error)
    return { success: false, error: "Failed to delete message" }
  }
}
