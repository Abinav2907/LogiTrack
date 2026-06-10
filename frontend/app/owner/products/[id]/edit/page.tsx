"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!id) return;
    (async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

const res = await fetch(`http://localhost:5000/api/products/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message ?? "Failed to load");

        const p = json.data;
        setName(p.name ?? "");
        setSku(p.sku ?? "");
        setPrice(p.price != null ? String(p.price) : "");
        setStock(Number(p.stock) || 0);
        setImage(Array.isArray(p.images) && p.images.length ? p.images[0] : "");
      } catch (err: any) {
        setError(err?.message ?? "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function statusFromStock(value: number) {
    if (value <= 0) return "Out of Stock";
    if (value <= 5) return "Low Stock";
    return "In Stock";
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: Number(String(price).replace(/[^0-9.]/g, "")) || 0,
      stock,
      images: [image.trim()],
      status: statusFromStock(stock),
    };

    try {
      const token = localStorage.getItem("token");

const res = await fetch(`http://localhost:5000/api/products/${id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message ?? "Update failed");

      router.push("/owner/products");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-white">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-white">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Edit Product</h1>

      <div className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />
        <input
          type="text"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#7F1D1D] rounded-2xl text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-neutral-800 rounded-2xl text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}