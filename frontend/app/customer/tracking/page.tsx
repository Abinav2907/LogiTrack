"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeliveryMap } from "@/components/customer/delivery-map";
import {
  fetchDeliveryByOrderId,
  fetchCustomerOrders as fetchOrders,
  fetchTrackingByOrderId,
} from "@/lib/api";
import { TrackingStep } from "@/lib/mock-data";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

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

type TrackingOrder = {
  id: string;
  customer: string;
  status: string;
  amount: number;
  date: string;
};

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderIdQuery = searchParams.get("orderId");
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);
  const [deliveryRoute, setDeliveryRoute] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const normalizeOrder = (order: any, index: number): TrackingOrder => ({
    id: String(order.id || order._id || order.orderId || `order-${index}`),
    customer:
      order.customer ||
      order.customerName ||
      order.customer_name ||
      "Unknown customer",
    status: order.status || "pending",
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
  });

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      setError(null);

      try {
        const ordersData = await fetchOrders();
        const normalizedOrders = Array.isArray(ordersData)
          ? ordersData.map(normalizeOrder)
          : [];
        setOrders(normalizedOrders);
        const firstActiveOrder = normalizedOrders.find(
          (order) => order.status !== "delivered",
        );
        const selectedFromQuery =
          orderIdQuery &&
          normalizedOrders.some((order) => order.id === orderIdQuery)
            ? orderIdQuery
            : null;
        setSelectedOrderId(
          selectedFromQuery || (firstActiveOrder ? firstActiveOrder.id : null),
        );
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load orders",
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    const loadTracking = async () => {
      if (!selectedOrderId) {
        setTrackingSteps([]);
        setDeliveryRoute(null);
        return;
      }

      setLoadingTracking(true);
      setError(null);

      try {
        const trackingData = await fetchTrackingByOrderId(selectedOrderId);
        setTrackingSteps(trackingData.steps || []);

        try {
          const deliveryData = await fetchDeliveryByOrderId(selectedOrderId);
          setDeliveryRoute(deliveryData);
        } catch (deliveryError) {
          setDeliveryRoute(null);
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load tracking data",
        );
        setTrackingSteps([]);
        setDeliveryRoute(null);
      } finally {
        setLoadingTracking(false);
      }
    };

    loadTracking();
  }, [selectedOrderId, refreshKey]);

  const activeOrders = orders.filter((order) => order.status !== "delivered");
  const selectedOrder =
    activeOrders.find((order) => order.id === selectedOrderId) ||
    activeOrders[0] ||
    null;

  useEffect(() => {
    if (!selectedOrderId && selectedOrder) {
      setSelectedOrderId(selectedOrder.id);
    }
  }, [selectedOrder, selectedOrderId]);

  const refreshTracking = async () => {
    if (selectedOrderId) {
      setRefreshKey((value) => value + 1);
    }
  };

  return (
    <Suspense fallback={<div className="space-y-6" />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Tracking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your orders in real-time with live delivery updates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <h2 className="font-semibold text-foreground">Active Orders</h2>
          {loadingOrders ? (
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  Loading orders...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium text-foreground">
                  Unable to load orders
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : activeOrders.length > 0 ? (
            activeOrders.map((order) => {
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
              const isSelected = order.id === selectedOrder?.id;
              return (
                <Card
                  key={order.id}
                  className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          Order #{order.id}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                      <Badge
                        className={`gap-1.5 ${status.color}`}
                        variant="secondary"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span className="font-semibold">
                        ₹{order.amount.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <p className="mt-3 font-medium text-foreground">
                  All orders delivered
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No active orders to track
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {selectedOrder ? (
            <>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{selectedOrder.id}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={refreshTracking}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="ml-2"
                      onClick={async () => {
                        if (!selectedOrderId) return;
                        setLoadingTracking(true);
                        setError(null);
                        try {
                          const trackingData =
                            await fetchTrackingByOrderId(selectedOrderId);
                          setTrackingSteps(trackingData.steps || []);
                        } catch (err) {
                          // ignore - will show message below
                        }
                        try {
                          const deliveryData =
                            await fetchDeliveryByOrderId(selectedOrderId);
                          setDeliveryRoute(deliveryData);
                        } catch (err) {
                          setDeliveryRoute(null);
                        } finally {
                          setLoadingTracking(false);
                        }
                      }}
                    >
                      Locate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingTracking ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-muted-foreground">
                        Loading tracking details...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-lg font-medium text-foreground">
                        Unable to load tracking details
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {error}
                      </p>
                    </div>
                  ) : trackingSteps.length > 0 ? (
                    <div className="space-y-4">
                      {trackingSteps.map((step, index) => (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                step.status === "completed"
                                  ? "bg-emerald-500 text-white"
                                  : step.status === "in-progress"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {step.status === "completed" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : step.status === "in-progress" ? (
                                <Truck className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            {index < trackingSteps.length - 1 && (
                              <div
                                className={`h-12 w-0.5 ${
                                  step.status === "completed"
                                    ? "bg-emerald-500"
                                    : "bg-muted"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground">
                                {step.title}
                              </p>
                              {step.timestamp && (
                                <span className="text-sm text-muted-foreground">
                                  {step.timestamp}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-lg font-medium text-foreground">
                        No tracking updates available
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tracking information will appear once the order is
                        processed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Live Delivery Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-75 overflow-hidden rounded-b-lg">
                    <DeliveryMap route={deliveryRoute} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="h-4 w-4" />
                  Call Driver
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium text-foreground">
                  Select an active order to track
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an active order from the list on the left.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </Suspense>
  );
}
