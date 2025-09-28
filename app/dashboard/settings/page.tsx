import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlanManagement } from "@/components/settings/plan-management"
import { CompanySettings } from "@/components/settings/company-settings"
import { cookies } from "next/headers"

async function getCompanyFromSession() {
  const cookieStore = cookies()
  const companyData = cookieStore.get("company")

  if (!companyData) {
    return null
  }

  try {
    return JSON.parse(companyData.value)
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const company = await getCompanyFromSession()

  if (!company) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader company={company} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your company profile and subscription plan</p>
          </div>
          <div className="space-y-8">
            <PlanManagement company={company} />
            <CompanySettings company={company} />
          </div>
        </div>
      </main>
    </div>
  )
}
