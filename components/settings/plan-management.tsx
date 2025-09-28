"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Crown, Package, Zap, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Company {
  id: number
  shop_name: string
  plan: string
  product_limit: number
  current_product_count: number
  join_date: string
}

interface PlanManagementProps {
  company: Company
}

const plans = {
  Trial: {
    name: "Trial",
    price: 0,
    productLimit: 10,
    features: ["Up to 10 products", "Basic AR requests", "Email support"],
    icon: Package,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  Basic: {
    name: "Basic",
    price: 29,
    productLimit: 25,
    features: ["Up to 25 products", "Priority AR requests", "Email support", "Basic analytics"],
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  Premium: {
    name: "Premium",
    price: 79,
    productLimit: 100,
    features: [
      "Up to 100 products",
      "Fast-track AR requests",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    icon: Crown,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  Enterprise: {
    name: "Enterprise",
    price: 199,
    productLimit: 500,
    features: [
      "Up to 500 products",
      "Instant AR processing",
      "Dedicated support",
      "Full analytics suite",
      "White-label solution",
      "API access",
    ],
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
}

export function PlanManagement({ company }: PlanManagementProps) {
  const currentPlan = plans[company.plan as keyof typeof plans] || plans.Trial
  const usagePercentage = (company.current_product_count / company.product_limit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = company.current_product_count >= company.product_limit

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg ${currentPlan.bgColor} flex items-center justify-center`}>
                <currentPlan.icon className={`h-6 w-6 ${currentPlan.color}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <Badge variant={company.plan === "Trial" ? "secondary" : "default"}>{company.plan}</Badge>
                </div>
                <p className="text-gray-600">{currentPlan.price === 0 ? "Free" : `$${currentPlan.price}/month`}</p>
              </div>
            </div>
            {company.plan !== "Enterprise" && (
              <Button className="bg-emerald-600 hover:bg-emerald-700">Upgrade Plan</Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Product Usage</span>
                <span className="text-sm text-gray-600">
                  {company.current_product_count} / {company.product_limit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>

            {isNearLimit && (
              <Alert className={isAtLimit ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}>
                <AlertTriangle className={`h-4 w-4 ${isAtLimit ? "text-red-600" : "text-orange-600"}`} />
                <AlertDescription className={isAtLimit ? "text-red-800" : "text-orange-800"}>
                  {isAtLimit
                    ? "You've reached your product limit. Upgrade your plan to add more products."
                    : "You're approaching your product limit. Consider upgrading your plan."}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <h4 className="font-medium mb-2">Plan Features</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Account Info</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Member since: {new Date(company.join_date).toLocaleDateString()}</p>
                  <p>Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p>Status: Active</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrentPlan = key === company.plan
              const PlanIcon = plan.icon

              return (
                <div
                  key={key}
                  className={`border rounded-lg p-4 ${
                    isCurrentPlan ? "border-emerald-200 bg-emerald-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center mx-auto`}>
                      <PlanIcon className={`h-5 w-5 ${plan.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-2xl font-bold">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                        {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Up to {plan.productLimit} products</p>
                    </div>
                    <ul className="space-y-1 text-xs text-left">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrentPlan ? "secondary" : "outline"}
                      size="sm"
                      className="w-full"
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "Current Plan" : "Select Plan"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
