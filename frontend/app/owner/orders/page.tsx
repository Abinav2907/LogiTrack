"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Clock, CheckCircle, Truck } from "lucide-react";
import { fetchOwnerOrders } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
}

interface OrderItem {
  product?: Product;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const ordersData = await fetchOwnerOrders();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err: any) {
        setError(err?.message ?? "Unable to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const totalOrders = orders.length;
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;
  const inDeliveryCount = orders.filter(
    (order) => order.status === "processing" || order.status === "shipped",
  ).length;

  function getStatusClasses(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "processing":
        return "bg-blue-500/20 text-blue-400";
      case "shipped":
        return "bg-purple-500/20 text-purple-400";
      case "delivered":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-4xl font-bold text-white">Orders Management</h1>

        <p className="text-gray-400 mt-2">
          Manage customer orders and delivery flow
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Orders</p>

              <h2 className="text-3xl font-bold mt-2">{totalOrders}</h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#7F1D1D]/20 border border-[#7F1D1D] flex items-center justify-center">
              <ShoppingCart className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Pending</p>

              <h2 className="text-3xl font-bold mt-2">{pendingCount}</h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
              <Clock className="text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Delivered</p>

              <h2 className="text-3xl font-bold mt-2">{deliveredCount}</h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500 flex items-center justify-center">
              <CheckCircle className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">In Delivery</p>

              <h2 className="text-3xl font-bold mt-2">{inDeliveryCount}</h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500 flex items-center justify-center">
              <Truck className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-400">Loading orders...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {/* Orders Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#1F1F1F] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Recent Orders</h2>

            <p className="text-gray-400 text-sm mt-1">
              Latest customer transactions
            </p>
          </div>

          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-[#7F1D1D] hover:bg-[#991B1B] transition-all"
          >
            Export
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-[#181818]">
            <tr className="text-left text-gray-400 text-sm">
              <th className="p-5">Order ID</th>
              <th className="p-5">Customer</th>
              <th className="p-5">Product</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Payment</th>
              <th className="p-5">Status</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order._id}
                className="border-t border-[#1F1F1F] hover:bg-[#151515] transition-all"
              >
                <td className="p-5 font-medium">{order.orderId}</td>

                <td className="p-5">{order.customerName}</td>

                <td className="p-5 text-gray-300">
                  {order.items[0]?.product?.name ?? "Unknown product"}
                </td>

                <td className="p-5">₹{order.totalPrice}</td>

                <td className="p-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "delivered"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {order.status === "delivered" ? "Paid" : "Pending"}
                  </span>
                </td>

                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </td>

                <td className="p-5">
                  <button className="px-4 py-2 rounded-xl border border-[#7F1D1D] hover:bg-[#7F1D1D] transition-all">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}