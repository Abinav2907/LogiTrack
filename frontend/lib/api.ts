import type { DeliveryRecord } from "@/components/delivery/deliveryData";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface DashboardData {
  activeDeliveries: number;
  completedDeliveries: number;
  followUps: number;
  avgEta: string;
  routeUpdates: number;
  activeRoutes: DeliveryRecord[];
}

export interface EarningsResponse {
  highlights: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  incentives: Array<{
    label: string;
    amount: string;
  }>;
}

export interface LocationUpdatePayload {
  deliveryId: string;
  latitude: number;
  longitude: number;
  source: "manual" | "browser";
  displayName: string;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timestamp: string;
}

function getApiBaseUrl() {
  return API_BASE_URL;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  console.log("TOKEN:", token);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,

    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.message ||
        errorBody?.error ||
        `Request failed with status ${response.status}`
    );
  }

  const json = await response.json();

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

/* =========================
   Existing APIs
========================= */

export async function fetchOrders(): Promise<any[]> {
  return apiRequest<any[]>("/api/orders");
}

export async function fetchProducts(): Promise<any[]> {
  return apiRequest<any[]>("/api/customer/products");
}

// Customer-specific endpoints (public-facing)
export async function fetchCustomerOrders(): Promise<any[]> {
  return apiRequest<any[]>("/api/customer/orders");
}

export async function fetchCustomerProducts(): Promise<any[]> {
  return apiRequest<any[]>("/api/customer/products");
}

export async function fetchTrackingByOrderId(orderId: string): Promise<any> {
  return apiRequest<any>(`/api/tracking/order/${orderId}`);
}

export async function fetchDeliveryByOrderId(orderId: string): Promise<any> {
  return apiRequest<any>(`/api/delivery/order/${orderId}`);
}

export async function fetchAnalytics(): Promise<any> {
  return apiRequest<any>("/api/analytics");
}

export async function fetchDashboardStats(): Promise<any> {
  return apiRequest<any>("/api/stats");
}

/* =========================
   Delivery APIs
========================= */

export async function fetchDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>("/api/deliveries/dashboard");
}

export async function fetchDeliveries(): Promise<DeliveryRecord[]> {
  return apiRequest<DeliveryRecord[]>("/api/deliveries");
}

export async function fetchHistory(): Promise<DeliveryRecord[]> {
  return apiRequest<DeliveryRecord[]>("/api/deliveries/history");
}

export async function fetchEarnings(): Promise<EarningsResponse> {
  return apiRequest<EarningsResponse>("/api/deliveries/earnings");
}

export async function updateDeliveryStatus(
  id: string,
  status: string,
): Promise<DeliveryRecord> {
  return apiRequest<DeliveryRecord>(`/api/deliveries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createDelivery(
  payload: Partial<DeliveryRecord>,
): Promise<DeliveryRecord> {
  return apiRequest<DeliveryRecord>("/api/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDelivery(
  id: string,
  payload: Partial<DeliveryRecord>,
): Promise<DeliveryRecord> {
  return apiRequest<DeliveryRecord>(`/api/deliveries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDelivery(id: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/api/deliveries/${id}`, {
    method: "DELETE",
  });
}

export async function saveLocationUpdate(
  payload: LocationUpdatePayload,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>("/api/location-updates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
