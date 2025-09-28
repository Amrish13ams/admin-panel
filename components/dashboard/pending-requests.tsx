import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface ArRequest {
  id: number
  status: string
  request_date: string
  products: {
    name: string
  }
}

interface PendingRequestsProps {
  requests: ArRequest[]
}

export function PendingRequests({ requests }: PendingRequestsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending AR Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pending AR requests.</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{request.products.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Requested {new Date(request.request_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
