"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Crown } from "lucide-react";
import { JSX } from "react/jsx-runtime";

const plans = [
  { name: "Starter", price: "$29/mo", details: "Up to 5 users" },
  { name: "Growth", price: "$59/mo", details: "Up to 20 users" },
  { name: "Enterprise", price: "Custom", details: "Unlimited seats" },
];

const notifications = [
  { title: "Route delay alert", message: "Delivery 12 has a 15 min delay." },
  { title: "Stock threshold reached", message: "Packaging Box stock is low." },
  { title: "New agent added", message: "Rahul Sharma joined your fleet." },
];

export default function Topbar(): JSX.Element {
  const [search, setSearch] = useState("");
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  function dispatchSearch(query: string) {
    const event = new CustomEvent("global-search", {
      detail: { query },
    });
    window.dispatchEvent(event);
  }

  return (
    <div className="w-full h-20 bg-[#111111] border-b border-neutral-900 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Welcome back, {userName}</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-3 rounded-2xl w-[320px]">
          <button
            type="button"
            onClick={() => dispatchSearch(search)}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Trigger global search"
          >
            <Search size={18} aria-hidden="true" />
          </button>

          <input
            type="text"
            aria-label="Global search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                dispatchSearch(search);
              }
            }}
            className="bg-transparent outline-none text-white placeholder:text-neutral-500 w-full"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsPlanOpen((current) => !current);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 bg-[#7F1D1D]/20 border border-[#7F1D1D] px-4 py-2 rounded-2xl text-[#DC2626] font-medium"
            aria-expanded={isPlanOpen}
          >
            <Crown size={18} />
            <span>Pro Plan</span>
          </button>

          {isPlanOpen && (
            <div className="absolute right-0 mt-3 w-72 rounded-3xl bg-[#0B0B0B] border border-neutral-800 shadow-xl z-20">
              <div className="p-4 border-b border-neutral-800">
                <p className="text-sm text-neutral-400">Upgrade options</p>
              </div>
              <div className="space-y-3 p-4">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className="rounded-2xl border border-[#1F1F1F] p-3 hover:border-[#7F1D1D] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{plan.name}</p>
                      <span className="text-sm text-[#DC2626]">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      {plan.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => {
              setIsNotifOpen((current) => !current);
              setIsPlanOpen(false);
            }}
            className="w-12 h-12 rounded-2xl bg-[#0B0B0B] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#7F1D1D] hover:text-white transition-all"
            aria-expanded={isNotifOpen}
          >
            <Bell size={20} aria-hidden="true" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-[#0B0B0B] border border-neutral-800 shadow-xl z-20">
              <div className="p-4 border-b border-neutral-800">
                <p className="text-sm text-neutral-400">Notifications</p>
              </div>
              <div className="space-y-3 p-4">
                {notifications.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#1F1F1F] p-3 hover:border-[#7F1D1D] transition-colors"
                  >
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-2 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#7F1D1D] flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h3 className="text-white font-medium">{userName}</h3>
            <p className="text-neutral-500 text-sm">Business Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
