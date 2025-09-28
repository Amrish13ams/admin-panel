"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArRequestForm } from "@/components/ar-requests/ar-request-form"

interface Product {
  id: number
  name: string
  image_1?: string
  category: string
  price: number
}

export default function NewArRequestPage() {
  const { company } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!company) {
      router.push("/auth/login")
      return
    }

    loadProducts()
  }, [company, router])

  const loadProducts = async () => {
    if (!company) return

    try {
      const supabase = createClient()

      // Get products that don't have AR yet
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, image_1, category, price")
        .eq("company_id", company.id)
        .eq("has_ar", false)
        .eq("status", "Active")
        .order("name")

      setProducts(productsData || [])
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request AR Feature</h1>
            <p className="text-gray-600">Submit a request to add AR visualization to your products</p>
          </div>
          <ArRequestForm companyId={company.id} products={products} />
        </div>
      </main>
    </div>
  )
}
