import { createClient } from "@supabase/supabase-js"

const SUPABASE_SCHEMA = "gay_solomon"

// Create a single supabase client for server-side usage
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }).schema(SUPABASE_SCHEMA as never)
}

// Create a singleton client for client-side usage
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createBrowserSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance.schema(SUPABASE_SCHEMA as never)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseInstance.schema(SUPABASE_SCHEMA as never)
}

export const createClientSupabaseClient = createBrowserSupabaseClient
