"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import { fetchOwnerProducts, deleteOwnerProduct } from "@/lib/api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1580894908361-967195033215";

interface ApiProduct {
  _id: string;
  name: string;
  sku?: string;
  price?: number | string;
  stock?: number;
  images?: string[];
}

interface ProductView {
  _id: string;
  name: string;
  sku?: string;
  price: string;
  stock: number;
  status: string;
  image: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const products = await fetchOwnerProducts();

        const mapped: ProductView[] = (products as ApiProduct[]).map((p) => {
          const stock =
            typeof p.stock === "number" ? p.stock : Number(p.stock) || 0;
          const status =
            stock <= 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock";
          const rawPrice = p.price ?? 0;
          const priceString =
            typeof rawPrice === "number" ? `₹${rawPrice}` : String(rawPrice);
          const image =
            Array.isArray(p.images) && p.images.length
              ? p.images[0]
              : DEFAULT_IMAGE;

          return {
            _id: p._id,
            name: p.name,
            sku: p.sku,
            price: priceString,
            stock,
            status,
            image,
          };
        });

        setItems(mapped);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    load();

    function onGlobalSearch(e: Event) {
      // @ts-ignore
      const q = e?.detail?.query ?? "";
      setQuery(q);
    }

    window.addEventListener("global-search", onGlobalSearch as EventListener);
    return () =>
      window.removeEventListener(
        "global-search",
        onGlobalSearch as EventListener,
      );
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((p) =>
        `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, items],
  );

  async function handleDelete(id: string) {
    const updated = items.filter((p) => p._id !== id);
    // optimistic update
    setItems(updated);

    try {
      await deleteOwnerProduct(id);
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete product");
      // keep optimistic change; if you prefer to revert on failure, implement revert logic here
    }
  }

  function handleEdit(id: string) {
    router.push(`/owner/products/${id}/edit`);
  }

  function handleAdd() {
    router.push("/owner/products/add");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-white">Product Catalogue</h1>

          <p className="text-gray-400 mt-2">
            Manage logistics inventory products
          </p>
        </div>

        <button onClick={handleAdd} className="bg-red-600 px-5 py-3 rounded-xl">
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
          size={20}
          aria-hidden="true"
        />

        <input
          type="text"
          aria-label="Search products"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-14 pr-4 py-4 text-white outline-none focus:border-[#7F1D1D]"
        />
      </div>

      {/* status messages */}
      {loading && <p className="text-gray-400">Loading products...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <div
            key={product._id}
            className="bg-[#111111] border border-[#1F1F1F] rounded-3xl overflow-hidden hover:border-[#7F1D1D] transition-all duration-300"
          >
            {/* Image */}
            <div className="h-52 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {product.name}
                </h2>

                <p className="text-gray-500 mt-1">{product.sku}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Price</p>

                  <h3 className="text-2xl font-bold text-white">
                    {product.price}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Stock</p>

                  <h3 className="text-2xl font-bold text-white">
                    {product.stock}
                  </h3>
                </div>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    product.status === "Low Stock"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleEdit(product._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] transition-all duration-300 py-3 rounded-2xl text-white"
                >
                  <Pencil size={18} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 py-3 rounded-2xl text-red-400"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
