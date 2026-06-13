"use client";

import { useEffect, useState } from "react";

import DeliveryCard from "@/components/delivery/DeliveryCard";
import StatsCard from "@/components/delivery/StatsCard";
import type { DeliveryRecord } from "@/components/delivery/deliveryData";
import { fetchDashboard } from "@/lib/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<{
    activeDeliveries: number;
    completedDeliveries: number;
    followUps: number;
    avgEta: string;
    routeUpdates: number;
    activeRoutes: DeliveryRecord[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await fetchDashboard();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeRoutesSafe = dashboard?.activeRoutes ?? [];
  const failedRoutes =
    activeRoutesSafe.filter((route) => route.status === "Failed Attempt")
      .length ?? 0;
  const pendingRoutes =
    activeRoutesSafe.filter((route) => route.status === "Pending").length ?? 0;

  return (
    <div className="p-8 space-y-8">
      {isLoading ? (
        <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 text-white">
          Loading delivery dashboard from the backend...
        </div>
      ) : error || !dashboard ? (
        <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 text-red-200">
          {error || "Unable to load dashboard data from the backend."}
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-neutral-400 mt-2 max-w-2xl">
                Monitor delivery routes, track active agents, and keep your
                logistics operations running smoothly with actionable insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatsCard
                title="Active routes"
                value={String(dashboard.activeDeliveries)}
                description="Live deliveries in motion"
                trend="Live"
              />
              <StatsCard
                title="Completed"
                value={String(dashboard.completedDeliveries)}
                description="Orders delivered successfully"
                trend="Synced"
              />
              <StatsCard
                title="Follow-ups"
                value={String(dashboard.followUps)}
                description="Agents need attention"
                trend="Backend"
              />
              <StatsCard
                title="Avg. ETA"
                value={dashboard.avgEta}
                description="Across all active routes"
                trend="Current"
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                    Priority routes
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-white">
                    Assigned deliveries
                  </h2>
                  <p className="text-neutral-400 mt-2 max-w-2xl">
                    Monitor active delivery routes and real-time status updates
                    for optimal fleet performance.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {(dashboard?.activeRoutes ?? []).map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    id={delivery.id}
                    customer={delivery.customer}
                    address={delivery.address}
                    eta={delivery.eta}
                    status={delivery.status}
                    priority={delivery.priority}
                    contact={delivery.contact}
                    location={delivery.location}
                    lastUpdated={delivery.lastUpdated}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-[#1F1F1F] bg-[#111111] p-6 shadow-lg shadow-black/10">
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                  Operational snapshot
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Route health
                </h2>

                <div className="mt-8 space-y-4">
                  <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
                    <p className="text-sm text-neutral-400">
                      Active route count
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {dashboard.activeDeliveries}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
                    <p className="text-sm text-neutral-400">Pending routes</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {pendingRoutes}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-5">
                    <p className="text-sm text-neutral-400">Failed attempts</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {failedRoutes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
