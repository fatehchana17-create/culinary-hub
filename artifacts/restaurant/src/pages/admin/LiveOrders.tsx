import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  useListOrders, 
  useUpdateOrderStatus, 
  UpdateOrderStatusRequestStatus,
  getListOrdersQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, "warning" | "default" | "secondary" | "success" | "outline" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  preparing: "secondary",
  ready: "success",
  delivered: "outline",
  cancelled: "destructive",
};

export default function LiveOrders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  
  // Auto-refresh every 10 seconds handled by query options
  const { data, isLoading } = useListOrders(
    { status: filter, limit: 50 },
    { query: { refetchInterval: 10000 } }
  );

  const { mutate: updateStatus } = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      }
    }
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Live Orders</h1>
          <p className="text-muted-foreground">Monitor and manage incoming orders in real-time.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button 
          variant={filter === undefined ? "default" : "outline"} 
          onClick={() => setFilter(undefined)}
          className="rounded-full"
        >
          All
        </Button>
        {Object.keys(UpdateOrderStatusRequestStatus).map(status => (
          <Button 
            key={status}
            variant={filter === status ? "default" : "outline"} 
            onClick={() => setFilter(status)}
            className="rounded-full capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">Loading orders...</div>
        ) : !data?.orders.length ? (
          <div className="col-span-full bg-card rounded-2xl p-12 text-center border border-border/50">
            <h3 className="text-xl font-bold mb-2">No active orders</h3>
            <p className="text-muted-foreground">Waiting for new customers...</p>
          </div>
        ) : (
          data.orders.map(order => (
            <Card key={order.id} className="p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-border/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">Order #{order.id}</span>
                    <Badge variant={statusColors[order.status] || "default"} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl text-primary">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex-1 mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Item Details</h4>
                <div className="bg-muted/30 rounded-xl p-4 text-sm font-medium">
                  {/* Assuming itemDetails is JSON displaying basically */}
                  <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                    {JSON.stringify(order.itemDetails, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {order.status === "pending" && (
                  <Button onClick={() => updateStatus({ id: order.id, data: { status: "confirmed" } })}>
                    Confirm Order
                  </Button>
                )}
                {order.status === "confirmed" && (
                  <Button onClick={() => updateStatus({ id: order.id, data: { status: "preparing" } })}>
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button variant="whatsapp" onClick={() => updateStatus({ id: order.id, data: { status: "ready" } })}>
                    Mark as Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button variant="outline" onClick={() => updateStatus({ id: order.id, data: { status: "delivered" } })}>
                    Delivered
                  </Button>
                )}
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => updateStatus({ id: order.id, data: { status: "cancelled" } })}>
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
