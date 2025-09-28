interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  accountId: string
}

interface B2UploadUrlResponse {
  bucketId: string
  uploadUrl: string
  authorizationToken: string
}

interface B2UploadResponse {
  fileId: string
  fileName: string
  accountId: string
  bucketId: string
  contentLength: number
  contentSha1: string
  contentType: string
  fileInfo: Record<string, string>
}

class BackblazeB2Client {
  private keyId: string
  private applicationKey: string
  private authToken: string | null = null
  private apiUrl: string | null = null
  private downloadUrl: string | null = null
  private accountId: string | null = null

  constructor(keyId: string, applicationKey: string) {
    this.keyId = keyId
    this.applicationKey = applicationKey
  }

  private async authorize(): Promise<void> {
    const credentials = btoa(`${this.keyId}:${this.applicationKey}`)

    console.log("[v0] B2 Authorization - Key ID:", this.keyId?.substring(0, 10) + "...")
    console.log("[v0] B2 Authorization - Credentials length:", credentials.length)

    const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    console.log("[v0] B2 Authorization - Response status:", response.status)
    console.log("[v0] B2 Authorization - Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const responseText = await response.text()
      console.log("[v0] B2 Authorization - Error response:", responseText)
      let errorText = ""
      try {
        const errorData = JSON.parse(responseText)
        errorText = JSON.stringify(errorData)
      } catch (parseError) {
        console.log("[v0] B2 Authorization - JSON parse error:", parseError)
        errorText = responseText || "No response text"
      }
      throw new Error(`B2 authorization failed: ${response.statusText} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log("[v0] B2 Authorization - Success response length:", responseText.length)

    try {
      const data: B2AuthResponse = JSON.parse(responseText)
      this.authToken = data.authorizationToken
      this.apiUrl = data.apiUrl
      this.downloadUrl = data.downloadUrl
      this.accountId = data.accountId
      console.log("[v0] B2 Authorization - Success, API URL:", data.apiUrl)
    } catch (parseError) {
      console.log("[v0] B2 Authorization - Success response parse error:", parseError)
      console.log("[v0] B2 Authorization - Raw response:", responseText.substring(0, 100))
      throw new Error(`B2 authorization response parsing failed: ${parseError}`)
    }
  }

  private async getUploadUrl(bucketName: string): Promise<B2UploadUrlResponse> {
    if (!this.authToken || !this.apiUrl) {
      await this.authorize()
    }

    console.log("[v0] B2 Get Upload URL - Using bucket name directly:", bucketName)
    console.log("[v0] B2 Get Upload URL - Auth token exists:", !!this.authToken)
    console.log("[v0] B2 Get Upload URL - API URL:", this.apiUrl)

    // For restricted application keys, we can't list all buckets
    // Instead, we need to get the bucket ID by trying to get upload URL directly
    // or use a known bucket ID. For now, let's try to get upload URL with bucket name

    // First, try to list buckets with the specific bucket name filter
    let bucketId: string

    try {
      const bucketsResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.accountId,
          bucketName: bucketName, // Add specific bucket name to avoid unauthorized error
        }),
      })

      console.log("[v0] B2 List Buckets - Response status:", bucketsResponse.status)

      if (!bucketsResponse.ok) {
        const errorText = await bucketsResponse.text()
        console.log("[v0] B2 List Buckets - Error response:", errorText)

        // For furniar-assets bucket, we'll use a fallback approach
        if (bucketName === "furniar-assets") {
          console.log("[v0] B2 - Using fallback approach for restricted key")
          // Try to get upload URL directly without bucket listing
          // This will fail if we don't have the bucket ID, but let's try with a common pattern
          throw new Error("Bucket listing failed, need to implement direct bucket ID approach")
        }

        throw new Error(`Failed to list buckets: ${bucketsResponse.statusText} - ${errorText}`)
      }

      const bucketsData = await bucketsResponse.json()
      const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)

      if (!bucket) {
        throw new Error(`Bucket ${bucketName} not found`)
      }

      bucketId = bucket.bucketId
    } catch (error) {
      console.log("[v0] B2 - Bucket listing failed, trying alternative approach:", error)

      // This is a common scenario when the application key is restricted to specific buckets
      if (bucketName === "furniar-assets") {
        // We need to find another way to get the bucket ID
        // Let's try a different approach - check if we can get it from the auth response
        throw new Error(
          "Unable to access bucket with restricted application key. Please ensure the application key has access to the 'furniar-assets' bucket or provide the bucket ID directly.",
        )
      }

      throw error
    }

    const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: this.authToken!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: bucketId,
      }),
    })

    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text()
      console.log("[v0] B2 Get Upload URL - Error response:", errorText)
      throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText} - ${errorText}`)
    }

    return uploadUrlResponse.json()
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileData: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string> {
    const uploadUrlData = await this.getUploadUrl(bucketName)

    const crypto = await import("crypto")
    const sha1 = crypto.createHash("sha1").update(fileData).digest("hex")

    const response = await fetch(uploadUrlData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(fileName),
        "Content-Type": contentType,
        "Content-Length": fileData.length.toString(),
        "X-Bz-Content-Sha1": sha1,
      },
      body: fileData,
    })

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`)
    }

    const uploadResponse: B2UploadResponse = await response.json()

    return `${this.downloadUrl}/file/${bucketName}/${fileName}`
  }
}

let b2Client: BackblazeB2Client | null = null

export function getB2Client(): BackblazeB2Client {
  if (!b2Client) {
    const keyId = process.env.B2_KEY_ID
    const applicationKey = process.env.B2_APPLICATION_KEY

    console.log("[v0] B2 Client - Key ID exists:", !!keyId)
    console.log("[v0] B2 Client - Application Key exists:", !!applicationKey)
    console.log("[v0] B2 Client - Key ID length:", keyId?.length || 0)
    console.log("[v0] B2 Client - App Key length:", applicationKey?.length || 0)

    if (!keyId || !applicationKey) {
      throw new Error("Backblaze B2 credentials not configured")
    }

    b2Client = new BackblazeB2Client(keyId, applicationKey)
  }

  return b2Client
}

export async function uploadToB2(file: File, folder = "products"): Promise<string> {
  const client = getB2Client()
  const bucketName = "furniar-assets"

  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split(".").pop()
  const fileName = `${folder}/${timestamp}-${randomString}.${extension}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const downloadUrl = await client.uploadFile(bucketName, fileName, buffer, file.type)

  return downloadUrl
}
