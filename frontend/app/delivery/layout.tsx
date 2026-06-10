import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_30%)]" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="relative p-6">{children}</main>
      </div>
    </div>
  );
}
