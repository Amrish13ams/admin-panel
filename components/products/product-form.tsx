"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { uploadToB2, getSignedUrl } from "@/lib/backblaze"

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

  const uploadRef = useRef<Record<string, boolean>>({})
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  // Fetch signed URLs for preview
  useEffect(() => {
    async function fetchUrls() {
      const urls: Record<string, string> = {}
      for (const key of ["image_1","image_2","image_3","image_4"] as (keyof Product)[]) {
        if (formData[key]) {
          try {
            urls[key] = await getSignedUrl(formData[key]!)
          } catch (err) {
            console.error(err)
          }
        }
      }
      setSignedUrls(urls)
    }
    fetchUrls()
  }, [formData.image_1, formData.image_2, formData.image_3, formData.image_4])

  const handleFileSelect = async (imageKey: keyof Product, file: File) => {
    if (uploadRef.current[imageKey]) return
    uploadRef.current[imageKey] = true

    try {
      const fileKey = await uploadToB2(file, "products")
      sessionStorage.setItem(imageKey, JSON.stringify({ fileKey, fileName: file.name }))
      setFormData(prev => ({ ...prev, [imageKey]: fileKey }))
    } catch (err) {
      console.error(err)
      alert("Failed to upload image")
    } finally {
      uploadRef.current[imageKey] = false
    }
  }

  const removeImage = (imageKey: keyof Product) => {
    setFormData(prev => ({ ...prev, [imageKey]: "" }))
    sessionStorage.removeItem(imageKey)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const productData = { ...formData, companyId, price: Number(formData.price), discount_price: formData.discount_price ? Number(formData.discount_price) : null }

      const method = product?.id ? "PUT" : "POST"
      const url = "/api/products"
      const body = product?.id ? { id: product.id, ...productData } : productData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save product")

      // Clear session storage after successful save
      ["image_1","image_2","image_3","image_4"].forEach(key => sessionStorage.removeItem(key))

      router.push("/dashboard/products")
    } catch (err) {
      console.error(err)
      alert(`Error saving product: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
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
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Product Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InputField label="Product Name" value={formData.name} onChange={v => setFormData(prev => ({...prev, name: v}))} />
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(prev => ({...prev, category: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <InputField label="Description" value={formData.description} onChange={v => setFormData(prev => ({...prev, description: v}))} />
              <InputField label="Price" value={formData.price.toString()} onChange={v => setFormData(prev => ({...prev, price: Number(v)}))} />
              <InputField label="Discount Price" value={formData.discount_price?.toString() || ""} onChange={v => setFormData(prev => ({...prev, discount_price: v ? Number(v) : undefined}))} />
            </CardContent>
          </Card>
        </div>

        {/* Images & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(["image_1","image_2","image_3","image_4"] as (keyof Product)[]).map(k => {
                const currentFileName = (() => {
                  const data = sessionStorage.getItem(k)
                  if (data) return JSON.parse(data).fileName
                  return ""
                })()
                return (
                  <div key={k} className="space-y-2">
                    <Label>{k}</Label>
                    <FileUpload
                      currentFileName={currentFileName}
                      onFileSelect={file => handleFileSelect(k, file)}
                      onRemove={() => removeImage(k)}
                      accept="image/*"
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData(prev => ({...prev, status: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : product?.id ? "Update Product" : "Create Product"}</Button>
      </div>
    </form>
  )
}

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
