import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  console.log("[v0] Login API called - starting")

  try {
    console.log("[v0] API route is working")

    const body = await request.json()
    console.log("[v0] Request body received:", body)

    const { username, password } = body
    console.log("[v0] Login attempt for username:", username)

    if (!username || !password) {
      console.log("[v0] Missing username or password")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    console.log("[v0] Database module imported successfully")

    console.log("[v0] Attempting database query...")

    // First, let's check if the companies table exists and has the required columns
    const tableCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND table_schema = 'public'
    `)

    console.log(
      "[v0] Companies table columns:",
      tableCheck.rows.map((r) => r.column_name),
    )

    // Query the database for the company
    const result = await query("SELECT * FROM companies WHERE username = $1", [username])
    console.log("[v0] Database query result:", result.rows.length, "rows found")

    if (result.rows.length === 0) {
      console.log("[v0] No company found with username:", username)

      const allUsers = await query("SELECT username FROM companies LIMIT 10")
      console.log(
        "[v0] Available usernames:",
        allUsers.rows.map((r) => r.username),
      )

      return NextResponse.json(
        {
          error: "Invalid username or company not found",
          availableUsernames: allUsers.rows.map((r) => r.username),
        },
        { status: 401 },
      )
    }

    const company = result.rows[0]
    console.log("[v0] Found company:", company.shop_name || company.name, "with status:", company.status)

    // Check if company is active (if status column exists)
    if (company.status && company.status.toLowerCase() !== "active") {
      console.log("[v0] Company is not active:", company.status)
      return NextResponse.json({ error: "Company account is not active" }, { status: 401 })
    }

    // Simple password check (in production, use proper hashing)
    if (company.password_hash !== password) {
      console.log("[v0] Password mismatch for user:", username)
      console.log("[v0] Expected password:", company.password_hash, "Got:", password)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    console.log("[v0] Login successful for:", username)
    return NextResponse.json({ success: true, company })
  } catch (error) {
    console.error("[v0] Login error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Server error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 },
    )
  }
}
