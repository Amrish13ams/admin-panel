// Simple authentication utilities for the admin panel

export interface Company {
  id: string
  shop_name: string
  subdomain: string
  email: string
  username: string
  plan: string
  product_limit: number
  product_count: number
  status: string
  logo_url?: string
  created_at: string
}

export function getStoredCompany(): Company | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("company")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearStoredCompany(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("company")
  }
}

export function isAuthenticated(): boolean {
  return getStoredCompany() !== null
}
