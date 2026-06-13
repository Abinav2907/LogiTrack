"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchOrders } from "@/lib/api";
import { Search, Eye, Package, Truck, CheckCircle } from "lucide-react";

type CustomerOrder = {
  id: string;
  customer: string;
  product: string;
  status: string;
  amount: number;
  date: string;
  items?: Array<{ product: string; quantity: number; price: number }>;
};

const statusConfig = {
  delivered: {
    label: "Delivered",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    color: "bg-blue-500/10 text-blue-600",
    icon: Truck,
  },
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-600",
    icon: Package,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const normalizeOrder = (order: any, index: number): CustomerOrder => {
    const productName = order.items?.[0]?.product || "N/A";
    const rawStatus = String(order.status || "pending").toLowerCase();
    const normalizedStatus =
      rawStatus === "completed" ? "delivered" : rawStatus;
    return {
      id: String(order.id || order._id || order.orderId || `order-${index}`),
      customer: order.customerName || order.customer || "Unknown customer",
      product: productName,
      status: normalizedStatus,
      amount:
        typeof order.amount === "number"
          ? order.amount
          : typeof order.totalPrice === "number"
            ? order.totalPrice
            : 0,
      date:
        order.date ||
        order.createdAt ||
        order.updatedAt ||
        new Date().toISOString(),
      items: order.items,
    };
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const ordersData = await fetchOrders(searchQuery || undefined);
        const normalizedOrders = Array.isArray(ordersData)
          ? ordersData.map(normalizeOrder)
          : [];
        setOrders(normalizedOrders);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load orders",
        );
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(() => {
      void loadOrders();
    }, 200);

    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      String(order.id).toLowerCase().includes(query) ||
      String(order.customer).toLowerCase().includes(query) ||
      String(order.product).toLowerCase().includes(query);
    return matchesSearch; // status filtering removed, keep all orders matching search
  });

  const orderStats = {
    total: orders.length,
    delivered: orders.filter(
      (o) => String(o.status).toLowerCase() === "delivered",
    ).length,
    shipped: orders.filter((o) => String(o.status).toLowerCase() === "shipped")
      .length,
    pending: orders.filter((o) => String(o.status).toLowerCase() === "pending")
      .length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your orders in one place
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderStats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderStats.shipped}</p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Orders</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">
                Unable to load orders
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => {
                    const status = statusConfig[
                      order.status as keyof typeof statusConfig
                    ] || {
                      label:
                        order.status?.charAt(0).toUpperCase() +
                          order.status?.slice(1) || "Unknown",
                      color: "bg-slate-100 text-slate-700",
                      icon: Package,
                    };
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={order.id || `order-${index}`}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`gap-1.5 ${status.color}`}
                            variant="secondary"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{order.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() =>
                              router.push(
                                `/customer/tracking?orderId=${order.id}`,
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium text-foreground">
                    No orders found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
