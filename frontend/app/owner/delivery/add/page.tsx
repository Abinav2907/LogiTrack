"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOwnerDeliveryAgent } from "@/lib/api";

export default function AddAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !contact.trim()) {
      setError("Please provide both agent name and contact information.");
      return;
    }

    try {
      await createOwnerDeliveryAgent({
        name: name.trim(),
        contact: contact.trim(),
        vehicle: vehicle.trim(),
        isAvailable: status === "Active",
      });

      router.push("/owner/delivery");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while adding the agent.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Add Agent</h1>

      <div className="space-y-4 max-w-md">
        {error && <p className="text-red-400">{error}</p>}

        <input
          type="text"
          placeholder="Agent name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Contact email or phone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Vehicle details (optional)"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl pl-4 pr-4 py-3 text-white outline-none"
        />

        <label className="sr-only" htmlFor="agent-status">
          Agent status
        </label>
        <select
          id="agent-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl px-4 py-3 text-white outline-none"
        >
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#7F1D1D] rounded-2xl text-white"
          >
            Save
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
