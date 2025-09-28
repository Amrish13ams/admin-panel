// This file provides compatibility for any remaining Supabase imports
// All database operations now use the PostgreSQL client via API routes

export function createClient() {
  // Return a stub object that throws helpful errors if used
  return {
    from: () => {
      throw new Error("Supabase server client is no longer used. Please use direct PostgreSQL queries in API routes.")
    },
    auth: {
      getUser: () => {
        throw new Error("Server-side authentication is now handled via session cookies.")
      },
    },
  }
}

export async function createServerClient() {
  return createClient()
}
