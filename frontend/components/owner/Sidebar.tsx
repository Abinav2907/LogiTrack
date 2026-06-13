"use client";

import Link from "next/link";

import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/lib/logout";
import { AccountDeletionDialog } from "@/components/common/account-deletion-dialog";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
} from "lucide-react";
const links = [
  {
    name: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/owner/products",
    icon: Package,
  },
  {
    name: "Inventory",
    href: "/owner/inventory",
    icon: Boxes,
  },
  {
    name: "Orders",
    href: "/owner/orders",
    icon: ShoppingCart,
  },
  {
    name: "Delivery",
    href: "/owner/delivery",
    icon: Truck,
  },
  {
    name: "Analytics",
    href: "/owner/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <div className="w-72 min-h-screen bg-black border-r border-[#1f1f1f] p-6">
      <h1 className="text-4xl font-bold text-white mb-2">
        Logi<span className="text-red-600">Track</span>
      </h1>

      <p className="text-gray-500 mb-10">Business Dashboard</p>

      <div className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                active
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-[#111111] hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span className="text-lg">{link.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 space-y-3">
        <AccountDeletionDialog
          roleLabel="Business Owner"
          buttonClassName="w-full justify-start border-[#7F1D1D]/50 bg-[#7F1D1D]/10 text-[#FCA5A5] hover:bg-[#7F1D1D]/20 hover:text-white"
        />
        <button
          onClick={logout}
          className="w-full mt-0 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
