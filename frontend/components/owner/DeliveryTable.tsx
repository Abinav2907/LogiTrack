"use client";

interface Tracking {
  status: string;
  location?: string;
  message?: string;
  timestamp: string;
}

interface OrderItem {
  product?: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
}

interface DeliveryAgent {
  _id: string;
  name: string;
  contact: string;
  isAvailable: boolean;
  vehicle: string;
}

interface Delivery {
  _id: string;
  order?: Order;
  // some endpoints return flattened records with top-level orderId/customer fields
  orderId?: string;
  customer?: string;
  agent?: DeliveryAgent;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "failed";
  tracking: Tracking[];
  estimatedDelivery?: string;
}

interface DeliveryTableProps {
  deliveries: Delivery[];
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "text-green-400";
    case "in_transit":
      return "text-blue-400";
    case "assigned":
      return "text-yellow-400";
    case "pending":
      return "text-orange-400";
    case "failed":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export default function DeliveryTable({ deliveries }: DeliveryTableProps) {
  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Delivery Orders</h2>

      <div className="space-y-4">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => {
            const orderObj = delivery.order ?? {
              orderId: delivery.orderId ?? delivery.id ?? "",
              customerName: delivery.customer ?? "",
            };
            return (
              <div
                key={String(
                  delivery._id ??
                    delivery.id ??
                    orderObj.orderId ??
                    `${Math.random()}`,
                )}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F]"
              >
                <div>
                  <h3 className="text-white font-semibold">
                    {orderObj.orderId}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {orderObj.customerName}
                  </p>
                </div>

                <div className="text-gray-300">
                  {delivery.agent?.name || "Unassigned"}
                </div>

                <div
                  className={`text-sm capitalize ${getStatusColor(delivery.status)}`}
                >
                  {delivery.status === "in_transit"
                    ? "In Transit"
                    : delivery.status.charAt(0).toUpperCase() +
                      delivery.status.slice(1)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-center py-8">
            No deliveries available
          </div>
        )}
      </div>
    </div>
  );
}
