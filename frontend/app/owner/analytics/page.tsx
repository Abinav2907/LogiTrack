"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnalytics, OwnerAnalyticsData } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<OwnerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const analyticsData = await fetchAnalytics();
        setAnalytics(analyticsData);
      } catch (err: any) {
        setError(err?.message ?? "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const summaryCards = analytics
    ? [
        {
          title: "Total Revenue",
          value: `₹${analytics.totalRevenue.toLocaleString()}`,
        },
        {
          title: "Total Orders",
          value: analytics.totalOrders.toLocaleString(),
        },
        {
          title: "Sales Growth",
          value: `${analytics.salesGrowthPercent.toFixed(2)}%`,
        },
        {
          title: "Low Stock Items",
          value: analytics.lowStockCount.toString(),
        },
      ]
    : [];

  const revenueComparison = analytics
    ? [
        { label: "Previous 30d", value: analytics.prev30Revenue },
        { label: "Last 30d", value: analytics.last30Revenue },
      ]
    : [];

  return (
    <div className="space-y-8 p-8">
      <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Analytics Dashboard
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              Owner analytics using the latest business metrics available from
              the backend.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] px-5 py-4 text-sm text-neutral-300">
            Updated just now
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 text-sm text-primary">
          Loading analytics data...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : !analytics ? (
        <div className="rounded-3xl border border-muted/20 bg-muted/5 p-6 text-sm text-muted-foreground">
          No analytics data available. Please check your owner account or
          backend connection.
        </div>
      ) : null}

      {analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.title} className="border-none shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  30 Day Revenue Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueComparison}>
                      <XAxis
                        dataKey="label"
                        stroke="#6b7280"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `₹${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "#111111",
                          border: "1px solid #2d2d2d",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#ef4444"
                        radius={[12, 12, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-[#0B0B0B] p-4">
                  <p className="text-sm text-muted-foreground">
                    Last 30 days revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    ₹{analytics.last30Revenue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-3xl bg-[#0B0B0B] p-4">
                  <p className="text-sm text-muted-foreground">
                    Previous 30 days revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    ₹{analytics.prev30Revenue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
