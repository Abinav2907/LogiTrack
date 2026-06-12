"use client";

import DashboardCard from "@/components/owner/DashboardCard";
import DeliveryMap from "@/components/owner/DeliveryMap";
import AgentCard from "@/components/owner/AgentCard";
import {
  DollarSign,
  ShoppingCart,
  Package,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchOwnerProducts,
  fetchOwnerOrders,
  fetchAnalytics,
  fetchOwnerInventory,
  fetchOwnerDeliveries,
  fetchOwnerDeliveryAgents,
} from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  minStock?: number;
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
  status: string;
  createdAt?: string;
}

interface InventoryProduct {
  _id: string;
  name: string;
  category?: string;
  stock: number;
  minStock: number;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  salesGrowthPercent: number;
  lowStockCount: number;
  last30Revenue: number;
  prev30Revenue: number;
}

interface DeliveryAgent {
  _id: string;
  name: string;
  contact: string;
  isAvailable: boolean;
  vehicle?: string;
}

interface Tracking {
  status: string;
  location?: string;
  message?: string;
  timestamp?: string;
}

interface Delivery {
  _id: string;
  order: Order;
  agent?: DeliveryAgent | null;
  status:
    | "pending"
    | "assigned"
    | "in_transit"
    | "delivered"
    | "failed"
    | string;
  tracking: Tracking[];
  estimatedDelivery?: string;
}

export default function OwnerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        const products = await fetchOwnerProducts();
        const businessOrders = await fetchOwnerOrders();
        const inventoryData = await fetchOwnerInventory();
        const analyticsData = await fetchAnalytics();
        const deliveriesData = await fetchOwnerDeliveries();
        const deliveryAgentsData = await fetchOwnerDeliveryAgents();

        setProducts(Array.isArray(products) ? products : []);
        setOrders(Array.isArray(businessOrders) ? businessOrders : []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
        setAnalytics(analyticsData ?? null);
        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
        setDeliveryAgents(Array.isArray(deliveryAgentsData) ? deliveryAgentsData : []);

      } catch (err: any) {
        setError(err?.message ?? "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Safe derived stats
  const totalProducts = products.length;
  const totalOrders = analytics?.totalOrders ?? orders.length;
  const revenue = analytics?.totalRevenue ?? 0;
  const lowStockCount =
    analytics?.lowStockCount ??
    inventory.filter((p) => p.stock <= p.minStock).length;
  const activeDeliveries = deliveries.length;
  const deliveredOrders = orders.filter(
    (o) => (o.status ?? "").toLowerCase() === "delivered",
  ).length;

  // Recent orders: take first 4 (backend should ideally return newest first)
  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);

  // Top products by stock (descending)
  const topProducts = useMemo(
    () =>
      [...products].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0)).slice(0, 5),
    [products],
  );

  // Low stock items (stock < minStock) from inventory endpoint
  const lowStockItems = useMemo(
    () => inventory.filter((p) => p.stock < p.minStock),
    [inventory],
  );

  // Agents derived from backend delivery agent list plus any delivery-assigned agents
  const uniqueAgents = useMemo(() => {
    const map = new Map<string, DeliveryAgent>();
    deliveryAgents.forEach((agent) => map.set(agent._id, agent));
    deliveries.forEach((d) => {
      if (d.agent && d.agent._id && !map.has(d.agent._id)) {
        map.set(d.agent._id, d.agent);
      }
    });
    return Array.from(map.values());
  }, [deliveryAgents, deliveries]);

  // For UI parity: create delivery-related quick access values (keeps layout unchanged)
  const driversOnline = uniqueAgents.length;

  return (
    <div className="p-8 space-y-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Dashboard Overview
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              Track shipments, monitor driver performance, and keep your
              logistics operations running smoothly with actionable insights.
            </p>
          </div>
          <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-5 shadow-lg shadow-black/10">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
              Live performance
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-500/20 to-cyan-500/10 text-emerald-300">
                <Sparkles size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {activeDeliveries}
                </p>
                <p className="text-sm text-neutral-400">
                  deliveries tracked this week
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Revenue"
            value={`$${Number(revenue).toLocaleString()}`}
            change="+12.5%"
            icon={<DollarSign size={24} />}
          />

          <DashboardCard
            title="Orders"
            value={String(totalOrders)}
            change="+8.2%"
            icon={<ShoppingCart size={24} />}
          />

          <DashboardCard
            title="Products"
            value={String(totalProducts)}
            change="+4.1%"
            icon={<Package size={24} />}
          />

          <DashboardCard
            title="On-time Rate"
            value={`${analytics ? Math.max(0, Math.round(((analytics.last30Revenue - analytics.prev30Revenue) / Math.max(1, analytics.prev30Revenue)) * 100)) : 92}%`}
            change="+3.8%"
            icon={<ShieldCheck size={24} />}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                Today's priorities
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Better routing, faster deliveries
              </h2>
              <p className="text-neutral-400 mt-2 max-w-2xl">
                Review the latest route updates and team performance to reduce
                delays across the fleet.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
              Review route plans
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
              <p className="text-sm text-neutral-400">Average ETA</p>
              <p className="mt-3 text-3xl font-semibold text-white">28m</p>
              <p className="mt-2 text-sm text-neutral-500">
                Across active routes
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
              <p className="text-sm text-neutral-400">Fleet efficiency</p>
              <p className="mt-3 text-3xl font-semibold text-white">94%</p>
              <p className="mt-2 text-sm text-neutral-500">
                Optimised route performance
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
              <p className="text-sm text-neutral-400">Alerts resolved</p>
              <p className="mt-3 text-3xl font-semibold text-white">18</p>
              <p className="mt-2 text-sm text-neutral-500">
                In the last 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
          <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          <p className="text-neutral-400 mt-2">
            One-click commands to keep your operations moving.
          </p>

          <div className="mt-6 space-y-4">
            {[
              {
                title: "Dispatch new route",
                description: "Create a route and assign a driver in seconds.",
              },
              {
                title: "Notify active drivers",
                description:
                  "Send instant updates to every driver on the road.",
              },
              {
                title: "Inventory sweep",
                description: "Review low-stock items across warehouses.",
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                className="w-full rounded-3xl border border-neutral-800 bg-[#0B0B0B] px-5 py-4 text-left transition hover:border-red-600"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <DeliveryMap agents={uniqueAgents} />

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Active Fleet</h2>
                <p className="text-neutral-500 mt-2">
                  Current route statuses and driver performance.
                </p>
              </div>
              <span className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300">
                {driversOnline} drivers online
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {uniqueAgents.length > 0 ? (
                uniqueAgents.map((agent) => {
                  const agentDeliveries = deliveries.filter(
                    (d) => d.agent?._id === agent._id,
                  ).length;
                  const agentStatus = agent.isAvailable
                    ? "Available"
                    : "Active";
                  return (
                    <div
                      key={agent._id}
                      className="flex items-center justify-between rounded-3xl border border-neutral-800 bg-[#0B0B0B] px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-white">{agent.name}</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {agentDeliveries} deliveries assigned
                        </p>
                      </div>
                      <span
                        className={`rounded-2xl px-3 py-2 text-sm font-medium ${agentStatus === "Active" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}
                      >
                        {agentStatus}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full rounded-3xl border border-[#1F1F1F] p-8 text-gray-400">
                  No drivers online
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
            <h2 className="text-2xl font-bold text-white">Shipment Pulse</h2>
            <p className="text-neutral-500 mt-2">
              Recent operational updates for your logistics network.
            </p>

            <div className="mt-6 space-y-4">
              {/* Use recent orders to populate pulse (keeps visual structure identical) */}
              {recentOrders.length > 0 ? (
                recentOrders.map((o) => (
                  <div
                    key={o._id}
                    className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">{o.orderId}</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {o.customerName} · ₹
                          {Number(o.totalPrice).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#7F1D1D]/20 px-3 py-1 text-xs text-red-300">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-6">
                  No recent orders
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-neutral-900 bg-[#111111] p-6 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
              <p className="text-neutral-500 mt-2">
                Today’s most important shipments and order status.
              </p>
            </div>
            <a
              href="/owner/orders"
              className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              View all
            </a>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">{order.orderId}</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {order.customerName} ·{" "}
                      {order.items[0]?.product?.name ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <span>₹{Number(order.totalPrice).toLocaleString()}</span>
                    <span className="rounded-full bg-[#7F1D1D]/20 px-3 py-1 text-red-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-6">
                No recent orders
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-900 bg-[#111111] p-6 shadow-lg shadow-black/10">
          <h2 className="text-2xl font-bold text-white">Low Stock Alerts</h2>
          <p className="text-neutral-500 mt-2">
            Keep an eye on inventory that needs restocking soon.
          </p>

          <div className="mt-6 space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((p) => (
                <div
                  key={p._id}
                  className="rounded-3xl border border-[#7F1D1D] bg-[#0B0B0B] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold">{p.name}</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Running low — reorder soon.
                      </p>
                    </div>
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm text-red-300">
                      Critical
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-6">
                No low stock items
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
