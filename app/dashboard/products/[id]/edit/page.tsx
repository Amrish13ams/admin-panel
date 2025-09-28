"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProductForm } from "@/components/products/product-form"

interface EditProductPageProps {
  params: { id: string }
}

interface Product {
  id: number
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

export default function EditProductPage({ params }: EditProductPageProps) {
  const { company, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !company) {
      router.push("/login")
    }
  }, [company, authLoading, router])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!company || !params.id) return

      try {
        const response = await fetch(`/api/products/${params.id}?company_id=${company.id}`)

        if (!response.ok) {
          console.error("Error fetching product")
          router.push("/dashboard/products")
          return
        }

        const productData = await response.json()

        if (!productData) {
          router.push("/dashboard/products")
          return
        }

        setProduct(productData)
      } catch (error) {
        console.error("Error fetching product:", error)
        router.push("/dashboard/products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [company, params.id, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!company || !product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update your product information</p>
          </div>
          <ProductForm companyId={company.id} product={product} />
        </div>
      </main>
    </div>
  )
}
