// lib/database.ts
import { Pool } from "pg"

interface QueryResult {
  rows: any[]
  rowCount: number
}

// Create a single pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <-- keep your DB URL here
  ssl: {
    rejectUnauthorized: false, // needed if you're using Railway, Render, Supabase, etc.
  },
})

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  try {
    console.log("[v0] Executing query:", text, "with params:", params)

    const result = await pool.query(text, params)

    return {
      rows: result.rows,
      rowCount: result.rowCount,
    }
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

// Export a pool-compatible object for compatibility
export default {
  query,
}
