import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Debug companies API called")

    // Get all companies with their details
    const companiesResult = await query(`
      SELECT id, shop_name, username, status, created_at, updated_at
      FROM companies 
      ORDER BY id
    `)

    console.log("[v0] All companies in database:")
    companiesResult.rows.forEach((company) => {
      console.log(
        `[v0] Company ID: ${company.id}, Name: ${company.shop_name}, Username: ${company.username}, Status: ${company.status}`,
      )
    })

    // Check for orphaned products
    const orphanedProducts = await query(`
      SELECT DISTINCT company_id 
      FROM products 
      WHERE company_id NOT IN (SELECT id FROM companies)
    `)

    console.log(
      "[v0] Orphaned product company IDs:",
      orphanedProducts.rows.map((r) => r.company_id),
    )

    return NextResponse.json({
      companies: companiesResult.rows,
      orphanedProductCompanyIds: orphanedProducts.rows.map((r) => r.company_id),
    })
  } catch (error) {
    console.error("[v0] Debug companies error:", error)
    return NextResponse.json({ error: "Failed to debug companies" }, { status: 500 })
  }
}
