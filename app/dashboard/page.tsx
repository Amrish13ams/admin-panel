"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentProducts } from "@/components/dashboard/recent-products"
import { PendingRequests } from "@/components/dashboard/pending-requests"

interface Product {
  id: string
  name: string
  price: number
  status: string
  created_at: string
  image_1?: string
}

interface ArRequest {
  id: string
  status: string
  request_date: string
  products: { name: string }
}

export default function DashboardPage() {
  const { company } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [arRequests, setArRequests] = useState<ArRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!company) {
      router.push("/auth/login")
      return
    }

    loadDashboardData(company.id.toString())
  }, [company, router])

  const loadDashboardData = async (companyId: string) => {
    try {
      const [productsResponse, arRequestsResponse] = await Promise.all([
        fetch(`/api/products?company_id=${companyId}`),
        fetch(`/api/ar-requests?company_id=${companyId}`),
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData || [])
      }

      if (arRequestsResponse.ok) {
        const arRequestsData = await arRequestsResponse.json()
        setArRequests(arRequestsData || [])
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <DashboardStats
            company={company}
            totalProducts={products.length}
            pendingRequests={arRequests.filter((r) => r.status === "pending").length}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentProducts products={products.slice(0, 5)} />
            <PendingRequests requests={arRequests.filter((r) => r.status === "pending").slice(0, 5)} />
          </div>
        </div>
      </main>
    </div>
  )
}
