"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/mock-data";
import { fetchProducts, API_BASE_URL } from "@/lib/api";
import { Search, Filter, Heart } from "lucide-react";

type NormalizedProduct = Product;

type OrderMessage = {
  type: "success" | "error";
  text: string;
};

const categories = ["All", "Audio", "Accessories", "Wearables", "Storage"];

export default function ProductsPage() {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<OrderMessage | null>(null);
  const [orderingProductId, setOrderingProductId] = useState<string | null>(null);
  const router = useRouter();

  const normalizeProduct = (
    product: any,
    index: number,
  ): NormalizedProduct => ({
    id: String(product.id || product._id || `product-${index}`),
    name: product.name || "Unnamed product",
    price:
      typeof product.price === "number"
        ? product.price
        : Number(product.price) || 0,
    image:
      product.image ||
      (Array.isArray(product.images) && product.images[0]) ||
      "/placeholder.png",
    category: product.category || "General",
  });

  const handleOrderNow = async (product: NormalizedProduct) => {
    setOrderMessage(null);
    setOrderingProductId(product.id);

    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("userId")
        : null;

    if (!userId) {
      setOrderMessage({
        type: "error",
        text: "Please sign in before placing an order.",
      });
      setOrderingProductId(null);
      return;
    }

    const orderPayload = {
      userId,
      items: [
        {
          productId: product.id,
          quantity: 1,
        },
      ],
    };

    console.log("=== FRONTEND: PLACING ORDER ===");
    console.log("Product selected:", product.id, "Name:", product.name);
    console.log("Customer (userId):", userId);
    console.log("Sending payload:", JSON.stringify(orderPayload));

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
        },
        body: JSON.stringify(orderPayload),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        throw new Error(responseText || "Failed to place order.");
      }

      setOrderMessage({
        type: "success",
        text: "Order placed successfully. Redirecting...",
      });

      setTimeout(() => {
        router.push("/customer/orders");
      }, 800);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      console.error("Order error:", errorMessage);
      setOrderMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setOrderingProductId(null);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const productsData = await fetchProducts();
        const normalizedProducts = Array.isArray(productsData)
          ? productsData.map(normalizeProduct)
          : [];
        setProducts(normalizedProducts);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load products",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our collection of premium electronics and accessories
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-8"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orderMessage && (
        <div className="col-span-full text-sm">
          <p
            className={
              orderMessage.type === "success"
                ? "text-emerald-300"
                : "text-red-300"
            }
          >
            {orderMessage.text}
          </p>
        </div>
      )}
      {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium text-foreground">
              Unable to load products
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-none shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    aria-label="Add product to favorites"
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Heart className="h-4 w-4 text-foreground" />
                  </button>
                  <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                    {product.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Premium quality product
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xl font-bold text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleOrderNow(product)}
                      disabled={orderingProductId === product.id}
                    >
                      {orderingProductId === product.id ? "Ordering..." : "Order Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-foreground">
              No products found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
