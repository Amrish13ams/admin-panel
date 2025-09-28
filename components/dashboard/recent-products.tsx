import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"
import Link from "next/link"

interface Product {
  id: number
  name: string
  price: number
  category: string
  status: string
  has_ar: boolean
  created_at: string
}

interface RecentProductsProps {
  products: Product[]
}

export function RecentProducts({ products }: RecentProductsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Products</CardTitle>
        <Button asChild size="sm">
          <Link href="/dashboard/products">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No products yet. Add your first product to get started.
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">${product.price}</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    {product.has_ar && (
                      <Badge variant="secondary" className="text-xs">
                        AR Ready
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
