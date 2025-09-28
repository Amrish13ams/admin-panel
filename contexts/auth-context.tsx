"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Company {
  id: number
  shop_name: string
  subdomain: string
  description: string
  logo: string
  phone: string
  whatsapp: string
  website: string
  status: string
  plan: string
  email: string
  product_limit: number
  current_product_count: number
  username: string
}

interface AuthContextType {
  company: Company | null
  setCompany: (company: Company | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompanyState] = useState<Company | null>(null)

  // Try to load company data from multiple storage sources
  useEffect(() => {
    const loadCompanyData = () => {
      try {
        // Try localStorage first
        const localStorageData = localStorage.getItem("company")
        if (localStorageData) {
          const parsed = JSON.parse(localStorageData)
          console.log("[v0] Loaded company from localStorage:", parsed.shop_name)
          setCompanyState(parsed)
          return
        }
      } catch (error) {
        console.log("[v0] localStorage failed:", error)
      }

      try {
        // Fallback to sessionStorage
        const sessionStorageData = sessionStorage.getItem("company")
        if (sessionStorageData) {
          const parsed = JSON.parse(sessionStorageData)
          console.log("[v0] Loaded company from sessionStorage:", parsed.shop_name)
          setCompanyState(parsed)
          return
        }
      } catch (error) {
        console.log("[v0] sessionStorage failed:", error)
      }

      console.log("[v0] No company data found in storage")
    }

    loadCompanyData()
  }, [])

  const setCompany = (newCompany: Company | null) => {
    setCompanyState(newCompany)

    if (newCompany) {
      const companyJson = JSON.stringify(newCompany)

      // Try to store in multiple places
      try {
        localStorage.setItem("company", companyJson)
        console.log("[v0] Stored company in localStorage")
      } catch (error) {
        console.log("[v0] localStorage storage failed:", error)
      }

      try {
        sessionStorage.setItem("company", companyJson)
        console.log("[v0] Stored company in sessionStorage")
      } catch (error) {
        console.log("[v0] sessionStorage storage failed:", error)
      }
    } else {
      // Clear storage on logout
      try {
        localStorage.removeItem("company")
        sessionStorage.removeItem("company")
      } catch (error) {
        console.log("[v0] Storage cleanup failed:", error)
      }
    }
  }

  const logout = () => {
    setCompany(null)
  }

  return <AuthContext.Provider value={{ company, setCompany, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
