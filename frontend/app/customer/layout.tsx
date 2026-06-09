import { Suspense } from "react"
import { CustomerSidebar } from "@/components/customer/sidebar"
import { CustomerHeader } from "@/components/customer/header"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <CustomerSidebar />
      <div className="ml-56 flex flex-1 flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
