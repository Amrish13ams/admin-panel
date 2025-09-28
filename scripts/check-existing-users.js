import pg from "pg"

const { Pool } = pg

async function checkExistingUsers() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log("[v0] Connecting to database...")

    // Check if companies table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      );
    `)

    if (!tableCheck.rows[0].exists) {
      console.log("[v0] Companies table does not exist")
      return
    }

    // Get all existing users
    const result = await pool.query(`
      SELECT id, username, email, company_name, created_at 
      FROM companies 
      ORDER BY created_at DESC
    `)

    console.log("[v0] Existing users in database:")
    console.log("Total users found:", result.rows.length)

    if (result.rows.length === 0) {
      console.log("[v0] No users found in the database")
    } else {
      result.rows.forEach((user, index) => {
        console.log(`[v0] User ${index + 1}:`)
        console.log(`  - Username: ${user.username}`)
        console.log(`  - Email: ${user.email}`)
        console.log(`  - Company: ${user.company_name}`)
        console.log(`  - Created: ${user.created_at}`)
        console.log("")
      })
    }
  } catch (error) {
    console.error("[v0] Database error:", error.message)
  } finally {
    await pool.end()
  }
}

checkExistingUsers()
