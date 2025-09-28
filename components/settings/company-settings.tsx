"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Save } from "lucide-react"

interface Company {
  id: number
  shop_name: string
  subdomain: string
  description?: string
  logo?: string
  phone?: string
  whatsapp?: string
  website?: string
  email: string
}

interface CompanySettingsProps {
  company: Company
}

export function CompanySettings({ company }: CompanySettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    shop_name: company.shop_name || "",
    description: company.description || "",
    logo: company.logo || "",
    phone: company.phone || "",
    whatsapp: company.whatsapp || "",
    website: company.website || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update company settings")
      }

      router.refresh()
      alert("Company settings updated successfully!")
    } catch (error) {
      console.error("Error updating company:", error)
      alert("Failed to update company settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Company Name *</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shop_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex">
                    <Input id="subdomain" value={company.subdomain} disabled className="rounded-r-none" />
                    <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-600">
                      .furniar.in
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Contact support to change your subdomain</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Tell customers about your company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={company.email} disabled />
                <p className="text-xs text-gray-500">Contact support to change your email address</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <FileUpload
                  currentUrl={formData.logo}
                  onUpload={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                  accept="image/*"
                  folder="logos"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Recommended: 200x200px, PNG or JPG</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="text-center">
                  {formData.logo ? (
                    <img
                      src={formData.logo || "/placeholder.svg"}
                      alt="Company logo"
                      className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Logo</span>
                    </div>
                  )}
                  <p className="font-medium text-sm">{formData.shop_name || "Company Name"}</p>
                  <p className="text-xs text-gray-600">{company.subdomain}.furniar.in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
