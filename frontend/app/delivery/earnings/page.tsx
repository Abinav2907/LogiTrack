"use client";

import { useEffect, useState } from "react";

import StatsCard from "@/components/delivery/StatsCard";
import type { EarningsResponse } from "@/lib/api";
import { fetchEarnings } from "@/lib/api";

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEarnings() {
      try {
        const data = await fetchEarnings();

        if (isMounted) {
          setEarnings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load earnings data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEarnings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#A1A1AA]">
          Earnings tracker
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">
          Revenue performance dashboard
        </h1>
        <p className="text-[#D5D5D5] mt-3 max-w-2xl">
          Track payout momentum, premium route bonuses, and conversion-rich
          delivery performance in one premium earnings workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-white">
          Loading earnings data from the backend...
        </div>
      ) : error || !earnings ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-[#F5D0D0]">
          {error || "Unable to load earnings data from the backend."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {earnings.highlights.map((item) => (
              <StatsCard
                key={item.title}
                title={item.title}
                value={item.value}
                description={item.description}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#27272A] p-5">
              <p className="text-sm text-[#A1A1AA]">Performance pulse</p>
              <h2 className="text-xl font-semibold text-white mt-1">
                Backend insights
              </h2>

              <div className="mt-5 rounded-xl border border-[#27272A] bg-[#111111] p-4">
                <p className="text-sm text-[#D5D5D5]">
                  {earnings.highlights.length} live earnings metrics are
                  currently sourced from the backend.
                </p>
                <p className="text-sm text-[#D5D5D5] mt-3">
                  {earnings.incentives.length > 0
                    ? `${earnings.incentives.length} incentives are available from the latest backend state.`
                    : "No bonus incentives are available right now."}
                </p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl border border-[#27272A] p-5">
              <p className="text-sm text-[#A1A1AA]">Incentives</p>
              <h2 className="text-xl font-semibold text-white mt-1">
                Bonus tracker
              </h2>

              <div className="mt-5 space-y-3">
                {earnings.incentives.length === 0 ? (
                  <div className="rounded-xl border border-[#27272A] bg-[#111111] px-4 py-3 text-sm text-[#D5D5D5]">
                    No bonus incentives are currently available from the
                    backend.
                  </div>
                ) : (
                  earnings.incentives.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-4 py-3"
                    >
                      <span className="text-sm text-[#D5D5D5]">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-[#F5D0D0]">
                        {item.amount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
