"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/lib/logout";

export function CustomerHeader() {
  const { logout } = useLogout();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <div className="w-full h-20 bg-[#111111] border-b border-neutral-900 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Welcome back, {userName}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-3 rounded-2xl w-[320px]">
          <button
            type="button"
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Search products"
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <Input
            placeholder="Search products..."
            className="bg-transparent outline-none text-white placeholder:text-neutral-500 w-full"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative w-12 h-12 rounded-2xl bg-[#0B0B0B] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#7F1D1D] hover:text-white transition-all"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-2 rounded-2xl hover:bg-[#1A1A1A]"
            >
              <div className="w-10 h-10 rounded-full bg-[#7F1D1D] flex items-center justify-center text-white font-bold">
                {userName[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-white font-medium">{userName}</h3>
                <p className="text-neutral-500 text-sm">Customer</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
