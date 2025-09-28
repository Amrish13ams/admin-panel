"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { ArrowLeft, Info } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: number
  name: string
  image_1?: string
  category: string
  price: number
}

interface ArRequestFormProps {
  companyId: number
  products: Product[]
}

export function ArRequestForm({ companyId, products }: ArRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [glbFile, setGlbFile] = useState<string>("")
  const [usdzFile, setUsdzFile] = useState<string>("")
  const [arScale, setArScale] = useState<string>("1.0")
  const [arPlacement, setArPlacement] = useState<string>("floor")
  const [notes, setNotes] = useState<string>("")

  const selectedProduct = products.find((p) => p.id.toString() === selectedProductId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/ar-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number.parseInt(selectedProductId),
          companyId: companyId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create AR request")
      }

      // Update product with AR files if provided
      if (glbFile || usdzFile) {
        const updateData: any = {}
        if (glbFile) updateData.glb_file = glbFile
        if (usdzFile) updateData.usdz_file = usdzFile
        if (arScale) updateData.ar_scale = Number.parseFloat(arScale)
        if (arPlacement) updateData.ar_placement = arPlacement

        const updateResponse = await fetch(`/api/products/${selectedProductId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...updateData,
            company_id: companyId,
          }),
        })

        if (!updateResponse.ok) {
          throw new Error("Failed to update product with AR files")
        }
      }

      router.push("/dashboard/ar-requests")
    } catch (error) {
      console.error("Error submitting AR request:", error)
      alert(`Failed to submit AR request: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
          <p className="text-gray-600 mb-4">
            You need to have active products without AR to submit a request. All your products either already have AR or
            are inactive.
          </p>
          <Button asChild>
            <Link href="/dashboard/products">View Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/ar-requests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AR Requests
          </Link>
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Submit a request to add AR visualization to your products. Our team will review and approve your request. You
          can optionally upload 3D model files to speed up the process.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Request Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Select Product *</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product for AR" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {product.category} (${product.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {selectedProduct.image_1 ? (
                        <img
                          src={selectedProduct.image_1 || "/placeholder.svg"}
                          alt={selectedProduct.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                      <p className="text-sm font-medium">${selectedProduct.price}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or notes for the AR implementation..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AR Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ar_scale">AR Scale</Label>
                  <Select value={arScale} onValueChange={setArScale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x (Small)</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.5">1.5x (Large)</SelectItem>
                      <SelectItem value="2.0">2.0x (Extra Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ar_placement">AR Placement</Label>
                  <Select value={arPlacement} onValueChange={setArPlacement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floor">Floor</SelectItem>
                      <SelectItem value="wall">Wall</SelectItem>
                      <SelectItem value="table">Table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D Model Files */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3D Model Files (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GLB File (Android)</Label>
                <FileUpload
                  currentUrl={glbFile}
                  onUpload={setGlbFile}
                  onRemove={() => setGlbFile("")}
                  accept=".glb,model/gltf-binary"
                  folder="ar-models"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">GLB format for Android AR viewers</p>
              </div>

              <div className="space-y-2">
                <Label>USDZ File (iOS)</Label>
                <FileUpload
                  currentUrl={usdzFile}
                  onUpload={setUsdzFile}
                  onRemove={() => setUsdzFile("")}
                  accept=".usdz,model/vnd.usdz+zip"
                  folder="ar-models"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">USDZ format for iOS AR Quick Look</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Uploading 3D models is optional but will speed up the AR implementation process. Our team can create
                  models from your product images if needed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/ar-requests">Cancel</Link>
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !selectedProductId}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? "Submitting..." : "Submit AR Request"}
        </Button>
      </div>
    </form>
  )
}
