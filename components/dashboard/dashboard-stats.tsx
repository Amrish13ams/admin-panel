import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface DashboardStatsProps {
  company: {
    plan: string
    product_limit: number
    current_product_count: number
  }
  totalProducts: number
  pendingRequests: number
}

export function DashboardStats({ company, totalProducts, pendingRequests }: DashboardStatsProps) {
  const usagePercentage = (totalProducts / company.product_limit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = totalProducts >= company.product_limit

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {company.product_limit - totalProducts} remaining
          </p>
        </CardContent>
      </Card>

      <Card className={isNearLimit ? "border-orange-200" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plan Usage</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usagePercentage.toFixed(0)}%</div>
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant={company.plan === "Premium" ? "default" : "secondary"}>{company.plan}</Badge>
            <p className="text-xs text-muted-foreground">
              {totalProducts}/{company.product_limit}
            </p>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          {isNearLimit && (
            <p className="text-xs text-orange-600 mt-1">
              <Link href="/dashboard/settings" className="underline">
                {isAtLimit ? "Upgrade to add more" : "Consider upgrading"}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending AR Requests</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Active</div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </CardContent>
      </Card>
    </div>
  )
}
