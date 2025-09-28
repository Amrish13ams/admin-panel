import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Package, Crown } from "lucide-react"

export function DemoLoginInfo() {
  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-emerald-200 bg-emerald-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-800">
          <Building2 className="h-5 w-5" />
          Demo Company Login
        </CardTitle>
        <CardDescription className="text-emerald-600">Use these credentials to test the admin panel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <User className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Username</p>
              <p className="text-sm text-gray-600 font-mono">demo</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Crown className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600 font-mono">demo123</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-700">Company:</span>
            <span className="font-medium">Demo Furniture Co</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-emerald-700">Plan:</span>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Premium
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-emerald-700">Product Limit:</span>
            <span className="font-medium">50 products</span>
          </div>
        </div>

        <div className="text-xs text-emerald-600 text-center pt-2 border-t border-emerald-200">
          <Package className="h-3 w-3 inline mr-1" />
          Includes 4 sample products and 1 AR request
        </div>
      </CardContent>
    </Card>
  )
}
