import { query } from "../lib/database.js"

async function testLogin() {
  try {
    console.log("[v0] Testing database connection...")

    // Test basic connection
    const testResult = await query("SELECT NOW() as current_time")
    console.log("[v0] Database connection successful:", testResult.rows[0].current_time)

    // Check if companies table exists
    const tableCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND table_schema = 'public'
      ORDER BY column_name
    `)

    console.log(
      "[v0] Companies table columns:",
      tableCheck.rows.map((r) => r.column_name),
    )

    // Get all users
    const users = await query("SELECT username, shop_name, email, status FROM companies ORDER BY username")
    console.log("[v0] Existing users:")
    users.rows.forEach((user) => {
      console.log(
        `  - Username: ${user.username}, Shop: ${user.shop_name}, Email: ${user.email}, Status: ${user.status}`,
      )
    })

    // Test specific login for demo user
    const demoUser = await query("SELECT * FROM companies WHERE username = $1", ["demo"])
    if (demoUser.rows.length > 0) {
      const user = demoUser.rows[0]
      console.log("[v0] Demo user found:")
      console.log(`  - Username: ${user.username}`)
      console.log(`  - Password: ${user.password_hash}`)
      console.log(`  - Shop: ${user.shop_name}`)
      console.log(`  - Status: ${user.status}`)
    } else {
      console.log("[v0] Demo user NOT found")
    }

    // Test login for demo_user (what the user is trying)
    const demoUserTest = await query("SELECT * FROM companies WHERE username = $1", ["demo_user"])
    if (demoUserTest.rows.length > 0) {
      console.log("[v0] demo_user found in database")
    } else {
      console.log("[v0] demo_user NOT found in database")
    }
  } catch (error) {
    console.error("[v0] Database test failed:", error.message)
    console.error("[v0] Full error:", error)
  }
}

testLogin()
