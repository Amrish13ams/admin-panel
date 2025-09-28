import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { uploadToB2 } from "@/lib/backblaze-b2"

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "products"
    const companyId = formData.get("companyId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    const companyResult = await query("SELECT id FROM companies WHERE id = $1", [companyId])

    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const company = companyResult.rows[0]

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "model/gltf-binary", "model/vnd.usdz+zip"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Upload to Backblaze B2
    const downloadUrl = await uploadToB2(file, `${folder}/company-${company.id}`)

    return NextResponse.json({ url: downloadUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
