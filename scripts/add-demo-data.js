import { query } from "../lib/database.js"

async function addDemoData() {
  try {
    console.log("[v0] Starting demo data insertion...")

    // First, let's check if the companies table exists
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

    // Insert demo company
    const insertCompany = await query(
      `
      INSERT INTO companies (
        username,
        password_hash,
        email,
        shop_name,
        description,
        phone,
        whatsapp,
        website,
        status,
        plan,
        subdomain,
        product_limit,
        current_products,
        join_date,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW()
      ) ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        shop_name = EXCLUDED.shop_name,
        description = EXCLUDED.description,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        website = EXCLUDED.website,
        status = EXCLUDED.status,
        plan = EXCLUDED.plan,
        subdomain = EXCLUDED.subdomain,
        product_limit = EXCLUDED.product_limit,
        current_products = EXCLUDED.current_products,
        updated_at = NOW()
      RETURNING id
    `,
      [
        "demo",
        "demo123",
        "demo@company.com",
        "Demo Shop",
        "A demo company for testing the admin panel",
        "+1234567890",
        "+1234567890",
        "https://demo-shop.com",
        "active",
        "premium",
        "demo-shop",
        100,
        0,
      ],
    )

    console.log("[v0] Demo company inserted/updated:", insertCompany.rows[0])

    // Get the company ID
    const companyResult = await query("SELECT id FROM companies WHERE username = $1", ["demo"])
    const companyId = companyResult.rows[0].id

    console.log("[v0] Demo company ID:", companyId)

    // Insert demo products
    const products = [
      ["Demo Product 1", "This is a demo product for testing purposes", 29.99, 50, "Electronics"],
      ["Demo Product 2", "Another demo product with different specifications", 49.99, 25, "Accessories"],
      ["Demo Product 3", "Premium demo product for showcase", 99.99, 10, "Premium"],
    ]

    for (const [name, description, price, stock, category] of products) {
      await query(
        `
        INSERT INTO products (
          name, description, price, stock_quantity, category, image_url, company_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (name, company_id) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          stock_quantity = EXCLUDED.stock_quantity,
          category = EXCLUDED.category,
          updated_at = NOW()
      `,
        [name, description, price, stock, category, "/placeholder.svg?height=200&width=200", companyId],
      )
    }

    console.log("[v0] Demo products inserted")

    // Update product count
    await query(`
      UPDATE companies 
      SET current_products = (
        SELECT COUNT(*) 
        FROM products 
        WHERE company_id = companies.id
      ) 
      WHERE username = 'demo'
    `)

    console.log("[v0] Updated product count")

    // Verify the demo user exists
    const verifyUser = await query(
      "SELECT username, password_hash, shop_name, current_products FROM companies WHERE username = $1",
      ["demo"],
    )
    console.log("[v0] Demo user verification:", verifyUser.rows[0])

    console.log("[v0] Demo data insertion completed successfully!")
  } catch (error) {
    console.error("[v0] Error inserting demo data:", error)
    throw error
  }
}

addDemoData()
