"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DeliveryCard from "@/components/delivery/DeliveryCard";
import type {
  DeliveryRecord,
  DeliveryStatus,
} from "@/components/delivery/deliveryData";
import {
  fetchDeliveries,
  updateDeliveryStatus,
  acceptDelivery,
} from "@/lib/api";

const statusOptions: Record<DeliveryStatus, DeliveryStatus[]> = {
  Pending: ["Out for Delivery", "Failed Attempt"],
  "Out for Delivery": ["Delivered", "Failed Attempt"],
  Delivered: [],
  "Failed Attempt": ["Returned"],
  Returned: [],
};

function toTitleCase(s?: string) {
  if (!s) return "";
  return s
    .split(/[- ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, DeliveryStatus>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDeliveries() {
      try {
        const data = await fetchDeliveries();

        if (isMounted) {
          setDeliveries(data);
          setSelectedStatuses(
            Object.fromEntries(
              data.map((item) => [item.id, item.status]),
            ) as Record<string, DeliveryStatus>,
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load deliveries.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDeliveries();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = deliveries.filter((item) => {
    const s = String(item.status || "").toLowerCase();
    return !["completed", "delivered", "returned"].includes(s);
  }).length;

  const completedCount = deliveries.filter((item) => {
    const s = String(item.status || "").toLowerCase();
    return s === "completed" || s === "delivered";
  }).length;

  const handleUpdateStatus = async (id: string) => {
    const current = deliveries.find((item) => item.id === id);
    const nextStatus = selectedStatuses[id];

    if (!current || !nextStatus || nextStatus === current.status) {
      toast.error("Select a valid status change before saving.");
      return;
    }

    try {
      const updatedDelivery = await updateDeliveryStatus(id, nextStatus);

      setDeliveries((prev) =>
        prev.map((item) => (item.id === id ? updatedDelivery : item)),
      );
      setSelectedStatuses((prev) => ({
        ...prev,
        [id]: updatedDelivery.status as DeliveryStatus,
      }));

      toast.success(`${current.customer} updated to ${nextStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to update delivery status.",
      );
    }
  };

  const handleAccept = async (id: string) => {
    const item = deliveries.find((d) => d.id === id);
    if (!item) return;
    try {
      const accepted = await acceptDelivery(id);
      setDeliveries((prev) => prev.map((p) => (p.id === id ? accepted : p)));
      toast.success("Delivery accepted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to accept delivery.",
      );
    }
  };

  const isAssignedToCurrentUser = (delivery: DeliveryRecord) => {
    if (typeof window === "undefined") return false;
    const currentUserId = localStorage.getItem("userId");
    const assigned = delivery.raw?.assignedAgent;
    if (!assigned) return false;
    if (typeof assigned === "string") return String(assigned) === currentUserId;
    if (assigned._id) return String(assigned._id) === currentUserId;
    if (assigned.id) return String(assigned.id) === currentUserId;
    return false;
  };

  const [completionPhotos, setCompletionPhotos] = useState<
    Record<string, string>
  >({});
  const [completionPreviews, setCompletionPreviews] = useState<
    Record<string, string>
  >({});

  const handlePhotoChange = (id: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCompletionPhotos((prev) => ({ ...prev, [id]: reader.result }));
        setCompletionPreviews((prev) => ({ ...prev, [id]: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async (id: string) => {
    const photo = completionPhotos[id];
    if (!photo) {
      toast.error("Please upload a completion photo before marking completed.");
      return;
    }

    try {
      const updated = await updateDeliveryStatus(id, "completed", photo);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      // keep the UI select in sync so it doesn't revert after completion
      setSelectedStatuses((prev) => ({
        ...prev,
        [id]: updated.status as DeliveryStatus,
      }));
      toast.success("Delivery marked completed.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to complete delivery.",
      );
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#A1A1AA]">
            Delivery operations
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">
            Assigned deliveries
          </h1>
          <p className="text-[#D5D5D5] mt-3 max-w-2xl">
            Use the status update panel to move each shipment through the
            premium delivery lifecycle and keep the route book current.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-70">
          <div className="rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-4">
            <p className="text-sm text-[#A1A1AA]">Active</p>
            <p className="text-2xl font-bold text-white mt-2">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-4">
            <p className="text-sm text-[#A1A1AA]">Completed</p>
            <p className="text-2xl font-bold text-white mt-2">
              {completedCount}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-white">
          Loading deliveries from the backend...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#1A1A1A] p-6 text-[#F5D0D0]">
          {error}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {deliveries.map((delivery) => {
            const options =
              statusOptions[delivery.status as unknown as DeliveryStatus] ||
              statusOptions[
                toTitleCase(delivery.status) as unknown as DeliveryStatus
              ] ||
              [];

            const assignedToMe = isAssignedToCurrentUser(delivery);

            return (
              <div
                key={delivery.id}
                className="bg-gradient-to-br from-[#0b0b0b] to-[#0f0f13] border border-[#27272A] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-lg bg-[#1F2937] text-xs text-[#E5E7EB] font-medium">
                        {delivery.orderId || delivery.id}
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {delivery.customer}
                      </h3>
                    </div>

                    <p className="text-sm text-[#9CA3AF] mt-2 max-w-xl">
                      {delivery.address}
                    </p>
                    {/* Show product name if available */}
                    {delivery.raw?.items?.length > 0 && (
                      <p className="text-sm text-[#D1D5DB] mt-2">
                        Product:{" "}
                        {delivery.raw.items[0].product?.name ||
                          delivery.raw.items[0].product}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-[#0B1220] text-xs text-[#C7D2FE] px-3 py-1 rounded-full">
                      {toTitleCase(delivery.status)}
                    </span>
                    <div className="text-sm text-[#9CA3AF] mt-2">
                      ETA: {delivery.eta || "--"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#27272A] bg-[#0E0E10] p-4">
                    <p className="text-sm text-[#A1A1AA]">Priority</p>
                    <p className="text-white font-semibold mt-2">
                      {delivery.priority || "Normal"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#27272A] bg-[#0E0E10] p-4">
                    <p className="text-sm text-[#A1A1AA]">Last updated</p>
                    <p className="text-white font-semibold mt-2">
                      {delivery.lastUpdated || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-[#27272A] bg-[#111111] p-4">
                  <p className="text-sm text-[#A1A1AA]">Status update</p>

                  <div className="mt-3 flex flex-col sm:flex-row gap-3 items-center">
                    <select
                      aria-label="Select delivery status"
                      value={selectedStatuses[delivery.id]}
                      onChange={(event) =>
                        setSelectedStatuses((prev) => ({
                          ...prev,
                          [delivery.id]: event.target.value as DeliveryStatus,
                        }))
                      }
                      className="flex-1 bg-[#0B0B0B] border border-[#27272A] text-white rounded-2xl px-4 py-3 outline-none"
                    >
                      {options && options.length > 0 ? (
                        options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      ) : (
                        <option value={delivery.status}>
                          {delivery.status}
                        </option>
                      )}
                    </select>

                    <div className="flex flex-col gap-3">
                      {!delivery.raw?.assignedAgent && (
                        <button
                          onClick={() => void handleAccept(delivery.id)}
                          className="rounded-full bg-green-500 px-5 py-3 text-white font-semibold shadow hover:brightness-105 transition"
                        >
                          Claim & Accept
                        </button>
                      )}

                      {delivery.raw?.assignedAgent && assignedToMe && (
                        <div className="space-y-3">
                          <label className="block text-sm text-[#A1A1AA]">
                            Upload completion photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handlePhotoChange(
                                delivery.id,
                                event.target.files?.[0],
                              )
                            }
                            className="w-full rounded-2xl border border-[#27272A] bg-[#0B0B0B] px-4 py-3 text-sm text-white"
                          />
                          {completionPreviews[delivery.id] ? (
                            <img
                              src={completionPreviews[delivery.id]}
                              alt="Completion preview"
                              className="h-32 w-full rounded-2xl object-cover"
                            />
                          ) : null}

                          {delivery.status !== "completed" && (
                            <button
                              onClick={() => void handleComplete(delivery.id)}
                              className="rounded-full bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:brightness-105 transition"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}

                      {/* Save button removed to prevent accidental status overrides */}
                    </div>
                  </div>

                  <p className="text-sm text-[#D5D5D5] mt-3">
                    Last sync: {delivery.lastUpdated}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
