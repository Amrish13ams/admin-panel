"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Cable as Cube } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface Product {
  id: number
  name: string
  description: string
  price: number
  discount_price?: number
  category: string
  status: string
  has_ar: boolean
  image_1?: string
  created_at: string
}

interface ProductsTableProps {
  products: Product[]
  companyId: number
}

export function ProductsTable({ products, companyId }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [productList, setProductList] = useState(products)
  const router = useRouter()
  const isMobile = useIsMobile()

  const filteredProducts = productList.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setIsDeleting(productId)

    try {
      const response = await fetch(`/api/products?product_id=${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      })

      if (!response.ok) throw new Error("Failed to delete product")

      // Remove deleted product from local state for instant UI update
      setProductList(prev => prev.filter(p => p.id !== productId))

      // Optionally refresh router to sync server state
      router.refresh()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRequestAR = async (productId: number) => {
    try {
      const response = await fetch("/api/ar-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, companyId }),
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "Failed to create AR request")

      // Update local product list instantly
      setProductList(prev =>
        prev.map(p => (p.id === productId ? { ...p, has_ar: true } : p))
      )

      alert("AR request submitted successfully!")
    } catch (error) {
      console.error("Error requesting AR:", error)
      alert(`Failed to submit AR request: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Catalog</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? "No products found matching your search." : "No products yet. Add your first product!"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AR Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">${product.price}</span>
                      {product.discount_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">${product.discount_price}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "Active" ? "default" : "secondary"}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.has_ar ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        AR Ready
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestAR(product.id)}
                        className="text-xs"
                      >
                        <Cube className="h-3 w-3 mr-1" />
                        Request AR
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-2 bg-transparent"
                      >
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button> 
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
