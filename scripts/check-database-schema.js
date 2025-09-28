import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

async function checkSchema() {
  try {
    console.log("[v0] Connecting to database...")

    // Check if companies table exists and get its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'companies'
      ORDER BY ordinal_position;
    `)

    console.log("[v0] Companies table structure:")
    console.table(tableInfo.rows)

    // Check if there are any existing records
    const existingData = await pool.query("SELECT * FROM companies LIMIT 5")
    console.log("[v0] Existing companies data:")
    console.table(existingData.rows)

    // Check other tables too
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    console.log("[v0] All tables in database:")
    console.table(allTables.rows)

    // Check products table structure if it exists
    const productsInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `)

    if (productsInfo.rows.length > 0) {
      console.log("[v0] Products table structure:")
      console.table(productsInfo.rows)
    }
  } catch (error) {
    console.error("[v0] Database error:", error.message)
  } finally {
    await pool.end()
  }
}

checkSchema()
