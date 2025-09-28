"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProductForm } from "@/components/products/product-form"
import { useAuth } from "@/contexts/auth-context" // Using auth context instead of localStorage

export default function NewProductPage() {
  const { company } = useAuth() // Getting company from auth context
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!company) {
      router.push("/auth/login")
      return
    }

    // Check if company has reached product limit
    if (company.current_product_count >= company.product_limit) {
      router.push("/dashboard/products?error=limit_reached")
      return
    }

    setLoading(false) // Set loading false when company is available
  }, [company, router]) // Added company to dependency array

  if (loading || !company) {
    // Check both loading and company
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product for your catalog</p>
          </div>
          <ProductForm companyId={company.id} />
        </div>
      </main>
    </div>
  )
}
