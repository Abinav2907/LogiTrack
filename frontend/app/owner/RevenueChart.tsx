"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4780 },
  { month: "May", revenue: 5890 },
  { month: "Jun", revenue: 6390 },
  { month: "Jul", revenue: 7490 },
];

export default function RevenueChart() {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Revenue Overview</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#222222" strokeDasharray="3 3" />

            <XAxis dataKey="month" stroke="#888888" />

            <YAxis stroke="#888888" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #7F1D1D",
                borderRadius: "12px",
                color: "white",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#991B1B"
              strokeWidth={4}
              dot={{
                r: 5,
                fill: "#991B1B",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
