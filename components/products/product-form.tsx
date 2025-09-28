"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  id?: number
  name: string
  description: string
  price: number
  discount_price?: number
  category: string
  dimensions?: string
  weight?: string
  material?: string
  color?: string
  status: string
  image_1?: string
  image_2?: string
  image_3?: string
  image_4?: string
}

interface ProductFormProps {
  companyId: number
  product?: Product
}

const categories = [
  "Living Room",
  "Bedroom",
  "Dining Room",
  "Kitchen",
  "Office",
  "Outdoor",
  "Storage",
  "Lighting",
  "Decor",
  "Other",
]

export function ProductForm({ companyId, product }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    discount_price: product?.discount_price || undefined,
    category: product?.category || "",
    dimensions: product?.dimensions || "",
    weight: product?.weight || "",
    material: product?.material || "",
    color: product?.color || "",
    status: product?.status || "Active",
    image_1: product?.image_1 || "",
    image_2: product?.image_2 || "",
    image_3: product?.image_3 || "",
    image_4: product?.image_4 || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        ...formData,
        companyId,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
      }

      console.log("[v0] Form submission started", { isEdit: !!product?.id, productData })

      if (product?.id) {
        console.log("[v0] Updating product with ID:", product.id)
        const response = await fetch("/api/products", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
            ...productData,
          }),
        })

        console.log("[v0] Update response status:", response.status)

        if (!response.ok) {
          const error = await response.json()
          console.log("[v0] Update error response:", error)
          throw new Error(error.error || "Failed to update product")
        }

        const result = await response.json()
        console.log("[v0] Update success:", result)
      } else {
        console.log("[v0] Creating new product")
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        console.log("[v0] Create response status:", response.status)

        if (!response.ok) {
          const error = await response.json()
          console.log("[v0] Create error response:", error)
          throw new Error(error.error || "Failed to create product")
        }

        const result = await response.json()
        console.log("[v0] Create success:", result)
      }

      console.log("[v0] Redirecting to products page")
      router.push("/dashboard/products")
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      alert(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (imageKey: keyof Product, url: string) => {
    setFormData((prev) => ({ ...prev, [imageKey]: url }))
  }

  const removeImage = (imageKey: keyof Product) => {
    setFormData((prev) => ({ ...prev, [imageKey]: "" }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_price">Discount Price</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    step="0.01"
                    value={formData.discount_price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount_price: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    placeholder="e.g., 120 x 80 x 75 cm"
                    value={formData.dimensions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 25 kg"
                    value={formData.weight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    placeholder="e.g., Solid Oak Wood"
                    value={formData.material}
                    onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Natural Brown"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images and Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((index) => {
                const imageKey = `image_${index}` as keyof Product
                const imageUrl = formData[imageKey] as string

                return (
                  <div key={index} className="space-y-2">
                    <Label>Image {index}</Label>
                    <FileUpload
                      currentUrl={imageUrl}
                      onUpload={(url) => handleImageUpload(imageKey, url)}
                      onRemove={() => removeImage(imageKey)}
                      accept="image/*"
                      folder="products"
                      className="w-full"
                      companyId={companyId.toString()}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="status">Product Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
          {isLoading ? "Saving..." : product?.id ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
