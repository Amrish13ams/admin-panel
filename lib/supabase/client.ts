"use client"

// This file provides compatibility for any remaining Supabase imports
// All database operations now use the PostgreSQL client via API routes

export function createClient() {
  // Return a stub object that throws helpful errors if used
  return {
    from: () => {
      throw new Error("Supabase client is no longer used. Please use API routes instead.")
    },
    auth: {
      getUser: () => {
        throw new Error("Authentication is now handled via session cookies. Use useAuth() context instead.")
      },
      signInWithPassword: () => {
        throw new Error("Authentication is now handled via API routes. Use /api/auth/login instead.")
      },
      signUp: () => {
        throw new Error("Authentication is now handled via API routes. Use /api/auth/register instead.")
      },
      signOut: () => {
        throw new Error("Authentication is now handled via API routes. Use /api/auth/logout instead.")
      },
    },
  }
}
