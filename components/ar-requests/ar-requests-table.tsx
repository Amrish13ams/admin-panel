"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Plus, Eye, Clock, CheckCircle, XCircle, Cable as Cube } from "lucide-react"
import Link from "next/link"

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

interface ArRequestsTableProps {
  requests: ArRequest[]
  companyId: number
}

export function ArRequestsTable({ requests, companyId }: ArRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRequests = requests.filter((request) =>
    request.products.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Pending
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Approved
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AR Requests</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/ar-requests/new">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <Cube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? "No AR requests found matching your search." : "No AR requests yet."}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard/ar-requests/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Request
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Response Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {request.products.image_1 ? (
                          <img
                            src={request.products.image_1 || "/placeholder.svg"}
                            alt={request.products.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{request.products.name}</p>
                        <p className="text-sm text-gray-500">ID: {request.products.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.products.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${request.products.price}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(request.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {request.approved_date
                      ? new Date(request.approved_date).toLocaleDateString()
                      : request.rejected_date
                        ? new Date(request.rejected_date).toLocaleDateString()
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {request.admin_notes && (
                          <DropdownMenuItem
                            onClick={() => alert(`Admin Notes: ${request.admin_notes}`)}
                            className="text-blue-600"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Notes
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
