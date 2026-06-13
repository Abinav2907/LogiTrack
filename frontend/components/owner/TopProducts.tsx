import { PackageCheck } from "lucide-react";

const products = [
  {
    name: "Wireless Scanner",
    sales: "1,248 sold",
    revenue: "₹12,400",
  },
  {
    name: "Packaging Boxes",
    sales: "982 sold",
    revenue: "₹8,920",
  },
  {
    name: "Barcode Labels",
    sales: "742 sold",
    revenue: "₹5,610",
  },
];

export default function TopProducts() {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#7F1D1D]/20 border border-[#7F1D1D] p-3 rounded-2xl">
          <PackageCheck className="text-red-500" size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Top Products</h2>

          <p className="text-gray-400 text-sm">
            Best performing inventory items
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-black border border-[#222] rounded-2xl p-5 hover:border-[#7F1D1D] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold">
                  {product.name}
                </h3>

                <p className="text-gray-400 text-sm mt-1">{product.sales}</p>
              </div>

              <div className="text-right">
                <p className="text-green-400 font-bold text-lg">
                  {product.revenue}
                </p>

                <p className="text-gray-500 text-xs">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
