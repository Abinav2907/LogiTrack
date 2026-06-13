"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountDeletionDialog } from "@/components/common/account-deletion-dialog";
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
    <div className="w-full bg-[#111111] border-b border-neutral-900 px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Welcome back, {userName}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-2xl bg-[#0B0B0B] border border-neutral-800 text-neutral-400 hover:bg-[#7F1D1D] hover:text-white"
              aria-label="Show notifications"
            >
              <Bell size={20} aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>New order update</DropdownMenuItem>
            <DropdownMenuItem>New product added</DropdownMenuItem>
            <DropdownMenuItem>System alert</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex min-w-0 items-center gap-3 bg-[#0B0B0B] border border-neutral-800 px-4 py-2 rounded-2xl hover:bg-[#1A1A1A]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7F1D1D] text-sm font-bold text-white">
                {userName[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 overflow-hidden">
                <h3 className="truncate text-sm font-medium text-white">
                  {userName}
                </h3>
                <p className="truncate text-xs text-neutral-500">Customer</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <AccountDeletionDialog roleLabel="Customer" triggerMode="menuItem" />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
