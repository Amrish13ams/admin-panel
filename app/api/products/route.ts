import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// Helper: Generate random 6-digit number
function generateProductId() {
  return Math.floor(Math.random() * 900000 + 100000)
}

// Ensure unique 6-digit ID
async function getUniqueProductId(): Promise<number> {
  let uniqueId = generateProductId()
  let exists = true
  while (exists) {
    const res = await query("SELECT id FROM products WHERE id = $1", [uniqueId])
    if (res.rows.length === 0) exists = false
    else uniqueId = generateProductId()
  }
  return uniqueId
}

// -------------------- GET PRODUCTS --------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = Number(searchParams.get("company_id"))

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Verify company exists
    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])
    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Fetch products
    const productsResult = await query(
      `SELECT id, name, description, price, discount_price, company_id, category,
              image_1, image_2, image_3, image_4,
              dimensions, weight, material, color,
              ar_scale, ar_placement, has_ar,
              glb_file, usdz_file, featured, status,
              created_at, updated_at
       FROM products
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    )

    return NextResponse.json(productsResult.rows)
  } catch (error) {
    console.error("[v0] Products GET error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// -------------------- CREATE PRODUCT --------------------
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    const { companyId, ...product } = productData

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Verify company exists
    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])
    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Generate unique 6-digit product ID
    const newProductId = await getUniqueProductId()

    // Insert product
    const insertResult = await query(
      `INSERT INTO products
        (id, name, description, price, discount_price, company_id, category,
         image_1, image_2, image_3, image_4,
         dimensions, weight, material, color,
         ar_scale, ar_placement, has_ar,
         glb_file, usdz_file, featured, status,
         created_at, updated_at)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'Active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        newProductId,
        product.name,
        product.description || null,
        product.price,
        product.discount_price || null,
        companyId,
        product.category || null,
        product.image_1 || null,
        product.image_2 || null,
        product.image_3 || null,
        product.image_4 || null,
        product.dimensions || null,
        product.weight || null,
        product.material || null,
        product.color || null,
        product.ar_scale || 1.0,
        product.ar_placement || "floor",
        product.has_ar || false,
        product.glb_file || null,
        product.usdz_file || null,
        product.featured || false,
      ]
    )

    return NextResponse.json({ success: true, product: insertResult.rows[0] })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

// -------------------- UPDATE PRODUCT --------------------
export async function PUT(request: NextRequest) {
  try {
    const productData = await request.json()
    const { id, companyId, ...product } = productData

    if (!id || !companyId) {
      return NextResponse.json({ error: "Product ID and Company ID are required" }, { status: 400 })
    }

    // Verify company exists
    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])
    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify product exists
    const productResult = await query("SELECT id FROM products WHERE id = $1 AND company_id = $2", [id, companyId])
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product
    const updateResult = await query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, discount_price=$4, category=$5,
           image_1=$6, image_2=$7, image_3=$8, image_4=$9,
           dimensions=$10, weight=$11, material=$12, color=$13,
           ar_scale=$14, ar_placement=$15, has_ar=$16,
           glb_file=$17, usdz_file=$18, featured=$19, status=$20,
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$21 AND company_id=$22
       RETURNING *`,
      [
        product.name,
        product.description || null,
        product.price,
        product.discount_price || null,
        product.category || null,
        product.image_1 || null,
        product.image_2 || null,
        product.image_3 || null,
        product.image_4 || null,
        product.dimensions || null,
        product.weight || null,
        product.material || null,
        product.color || null,
        product.ar_scale || 1.0,
        product.ar_placement || "floor",
        product.has_ar || false,
        product.glb_file || null,
        product.usdz_file || null,
        product.featured || false,
        product.status || "Active",
        id,
        companyId,
      ]
    )

    return NextResponse.json({ success: true, product: updateResult.rows[0] })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// -------------------- DELETE PRODUCT --------------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url) 
    const productId = Number(searchParams.get("product_id"))
    const { company_id } = await request.json()

    if (!productId || !company_id) {
      return NextResponse.json(
        { error: "Product ID and Company ID are required" }, 
        { status: 400 }
      )
    }

    // Verify company exists
    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [company_id])
    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify product exists
    const productResult = await query(
      "SELECT id FROM products WHERE id = $1 AND company_id = $2",
      [productId, company_id]
    )
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await query("DELETE FROM products WHERE id = $1 AND company_id = $2", [
      productId,
      company_id,
    ])

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
// -------------------- GET SINGLE PRODUCT --------------------
export async function GET_SINGLE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id)
    const { searchParams } = new URL(request.url)
    const companyId = Number(searchParams.get("company_id"))

    if (!productId || !companyId) {
      return NextResponse.json(
        { error: "Product ID and Company ID are required" },
        { status: 400 }
      )
    }

    // Verify company exists
    const companyRes = await query("SELECT id FROM companies WHERE id = $1", [companyId])
    if (companyRes.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Fetch the product
    const productRes = await query(
      `SELECT id, name, description, price, discount_price, company_id, category,
              image_1, image_2, image_3, image_4,
              dimensions, weight, material, color,
              ar_scale, ar_placement, has_ar,
              glb_file, usdz_file, featured, status,
              created_at, updated_at
       FROM products
       WHERE id = $1 AND company_id = $2
       LIMIT 1`,
      [productId, companyId]
    )

    if (productRes.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Return single product
    return NextResponse.json({ success: true, product: productRes.rows[0] })
  } catch (error) {
    console.error("[v0] Get single product error:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}




