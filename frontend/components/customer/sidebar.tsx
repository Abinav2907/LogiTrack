"use client"
import { useLogout } from "@/lib/logout"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  BarChart3,
  Truck
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/customer", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/customer/products", icon: Package, label: "Products" },
  { href: "/customer/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/customer/tracking", icon: MapPin, label: "Tracking" },
  { href: "/customer/analytics", icon: BarChart3, label: "Analytics" },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const { logout } = useLogout()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Truck className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">LogiTrack</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
  <button
    onClick={logout}
    className="w-full rounded-xl bg-red-600 py-3 text-white font-medium hover:bg-red-700 transition"
  >
    Logout
  </button>

  <p className="text-xs text-sidebar-foreground/50">
    LogiTrack v1.0
  </p>
</div>
    </aside>
  )
}
