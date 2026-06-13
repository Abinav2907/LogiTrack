"use client";

import { useEffect, useState } from "react";

import StatsCard from "@/components/delivery/StatsCard";
import StatusBadge from "@/components/delivery/StatusBadge";
import type { DeliveryRecord } from "@/components/delivery/deliveryData";
import { fetchHistory } from "@/lib/api";

export default function HistoryPage() {
  const [history, setHistory] = useState<DeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const data = await fetchHistory();

        if (isMounted) {
          setHistory(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load delivery history.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = history.filter(
    (item) => item.status === "completed" || item.status === "delivered",
  ).length;
  const returnCount = history.filter(
    (item) => item.status === "returned",
  ).length;

  return (
    <div className="p-4 md:p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#A1A1AA]">
          Delivery record
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">
          Completed deliveries history
        </h1>
        <p className="text-[#D5D5D5] mt-3 max-w-2xl">
          Review the delivery lifecycle with premium visibility into delivery
          completion, returns, and route outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatsCard
          title="Completed"
          value={String(completedCount)}
          description="Successful handoffs"
        />

        <StatsCard
          title="Returned"
          value={String(returnCount)}
          description="Customer or route returns"
        />

        <StatsCard
          title="Average resolution"
          value="1.4 days"
          description="Time to close delivery outcomes"
        />
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-white">
          Loading delivery history from the backend...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-[#F5D0D0]">
          {error}
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#27272A] rounded-2xl mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="text-left p-4 text-[#A1A1AA]">Delivery ID</th>
                  <th className="text-left p-4 text-[#A1A1AA]">Customer</th>
                  <th className="text-left p-4 text-[#A1A1AA]">City</th>
                  <th className="text-left p-4 text-[#A1A1AA]">ETA</th>
                  <th className="text-left p-4 text-[#A1A1AA]">Status</th>
                  <th className="text-left p-4 text-[#A1A1AA]">Last sync</th>
                </tr>
              </thead>

              <tbody>
                {history.map((delivery) => (
                  <tr key={delivery.id} className="border-t border-[#27272A]">
                    <td className="p-4 text-white">{delivery.id}</td>
                    <td className="p-4 text-white">{delivery.customer}</td>
                    <td className="p-4 text-[#D5D5D5]">{delivery.city}</td>
                    <td className="p-4 text-[#D5D5D5]">
                      {delivery.eta || "--"}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={delivery.status} />
                    </td>
                    <td className="p-4 text-[#D5D5D5]">
                      {delivery.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
