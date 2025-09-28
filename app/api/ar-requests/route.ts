import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] AR requests GET API called")

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")

    if (!companyId) {
      console.log("[v0] No company_id provided")
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    console.log("[v0] Fetching AR requests for company:", companyId)

    // Verify company exists
    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])

    if (companyResult.rows.length === 0) {
      console.log("[v0] Company not found:", companyId)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Fetch AR requests for the company with product names
    const arRequestsResult = await query(
      `SELECT ar.id, ar.status, ar.request_date, p.name as product_name
       FROM ar_requests ar
       JOIN products p ON ar.product = p.id
       WHERE ar.shop = $1 
       ORDER BY ar.request_date DESC`,
      [companyId],
    )

    console.log("[v0] Found AR requests:", arRequestsResult.rows.length)

    // Transform the data to match the expected format
    const transformedRequests = arRequestsResult.rows.map((row) => ({
      id: row.id,
      status: row.status,
      request_date: row.request_date,
      products: { name: row.product_name },
    }))

    return NextResponse.json(transformedRequests)
  } catch (error) {
    console.error("[v0] AR requests GET error:", error)
    return NextResponse.json({ error: "Failed to fetch AR requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, companyId } = await request.json()

    if (!productId || !companyId) {
      return NextResponse.json({ error: "Product ID and Company ID are required" }, { status: 400 })
    }

    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])

    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify the product belongs to the company
    const productResult = await query("SELECT id, has_ar FROM products WHERE id = $1 AND company_id = $2", [
      productId,
      companyId,
    ])

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = productResult.rows[0]

    if (product.has_ar) {
      return NextResponse.json({ error: "Product already has AR" }, { status: 400 })
    }

    // Check if there's already a pending request
    const existingResult = await query("SELECT id FROM ar_requests WHERE product = $1 AND shop = $2 AND status = $3", [
      productId,
      companyId,
      "pending",
    ])

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: "AR request already pending for this product" }, { status: 400 })
    }

    // Create AR request
    const insertResult = await query(
      `INSERT INTO ar_requests (product, shop, status, request_date) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [productId, companyId, "pending"],
    )

    const arRequest = insertResult.rows[0]

    return NextResponse.json({ success: true, request: arRequest })
  } catch (error) {
    console.error("AR request error:", error)
    return NextResponse.json({ error: "Failed to create AR request" }, { status: 500 })
  }
}
