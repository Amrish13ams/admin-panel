"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArRequestsTable } from "@/components/ar-requests/ar-requests-table"

interface ArRequest {
  id: number
  status: string
  request_date: string
  approved_date?: string
  rejected_date?: string
  admin_notes?: string
  products: {
    id: number
    name: string
    image_1?: string
    category: string
    price: number
  }
}

export default function ArRequestsPage() {
  const { company } = useAuth()
  const [arRequests, setArRequests] = useState<ArRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!company) {
      router.push("/auth/login")
      return
    }

    loadArRequests()
  }, [company, router])

  const loadArRequests = async () => {
    if (!company) return

    try {
      const response = await fetch(`/api/ar-requests?company_id=${company.id}`)

      if (response.ok) {
        const arRequestsData = await response.json()
        setArRequests(arRequestsData || [])
      }
    } catch (error) {
      console.error("Error loading AR requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading AR requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AR Requests</h1>
            <p className="text-gray-600">Track your Augmented Reality feature requests</p>
          </div>
          <ArRequestsTable requests={arRequests} companyId={company.id} />
        </div>
      </main>
    </div>
  )
}
