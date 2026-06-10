"use client";

import { useEffect, useState } from "react";

import { MapPinned, Truck } from "lucide-react";

const Navbar = () => {
  const [time, setTime] = useState("");
  const [userName, setUserName] = useState("Agent");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-20 bg-[#111111] border-b border-neutral-900 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Delivery Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Welcome back, {userName}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 px-4 py-3 bg-[#0B0B0B]">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-neutral-400">Agent Online</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 px-4 py-3 bg-[#0B0B0B]">
          <MapPinned size={16} className="text-neutral-400" />
          <span className="text-sm text-white">{time || "--:--:--"}</span>
        </div>

        <div className="flex items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-2 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#7F1D1D] flex items-center justify-center text-white font-bold">
            {userName[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <h3 className="text-white font-medium">{userName}</h3>
            <p className="text-neutral-500 text-sm">Delivery Agent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
