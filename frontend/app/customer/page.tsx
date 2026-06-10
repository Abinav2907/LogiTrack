import { StatsOverview } from "@/components/customer/stats-overview";
import { FeaturedProducts } from "@/components/customer/featured-products";
import { RecentOrders } from "@/components/customer/recent-orders";
import { OrderTracking } from "@/components/customer/order-tracking";
import { DeliveryMap } from "@/components/customer/delivery-map";

export default function CustomerDashboard() {
  return (
    <div className="p-8 space-y-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Customer Dashboard
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              Browse products, track orders, and manage your deliveries with our
              premium customer portal.
            </p>
          </div>
        </div>

        <StatsOverview />
      </section>

      <section className="space-y-6">
        <FeaturedProducts />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrders />
          <OrderTracking />
        </div>

        <DeliveryMap />
      </section>
    </div>
  );
}
