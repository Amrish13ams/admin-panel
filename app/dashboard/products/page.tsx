"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context" // Using auth context instead of localStorage
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProductsTable } from "@/components/products/products-table"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: string
  name: string
  price: number
  status: string
  created_at: string
  image_1?: string
}

interface PageProps {
  searchParams?: { error?: string }
}

export default function ProductsPage({ searchParams }: PageProps) {
  const { company } = useAuth() // Using auth context
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!company) {
      router.push("/auth/login")
      return
    }

    loadProducts(company.id.toString()) // Using company from context
  }, [company, router])

  const loadProducts = async (companyId: string) => {
    try {
      const response = await fetch(`/api/products?company_id=${companyId}`)

      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData || [])
      }
    } catch (error) {
      console.log("[v0] Error loading products:", error)
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

  const isAtLimit = company.current_product_count >= company.product_limit
  const isNearLimit = company.current_product_count / company.product_limit >= 0.8

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">
                Manage your product catalog ({company.current_product_count}/{company.product_limit} used)
              </p>
            </div>
            <Button
              asChild={!isAtLimit}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isAtLimit}
              title={isAtLimit ? "Product limit reached. Upgrade your plan to add more products." : ""}
            >
              {isAtLimit ? (
                <span className="cursor-not-allowed">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </span>
              ) : (
                <Link href="/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              )}
            </Button>
          </div>

          {searchParams?.error === "limit_reached" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You've reached your product limit of {company.product_limit} products.{" "}
                <Link href="/dashboard/settings" className="underline font-medium">
                  Upgrade your plan
                </Link>{" "}
                to add more products.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isAtLimit && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You're approaching your product limit ({company.current_product_count}/{company.product_limit}).{" "}
                <Link href="/dashboard/settings" className="underline font-medium">
                  Consider upgrading your plan
                </Link>{" "}
                to add more products.
              </AlertDescription>
            </Alert>
          )}

          <ProductsTable products={products || []} companyId={company.id} />
        </div>
      </main>
    </div>
  )
}
