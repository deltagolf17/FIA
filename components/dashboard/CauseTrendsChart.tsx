"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface TrendData {
  month: string;
  NATURAL: number;
  ACCIDENTAL: number;
  INCENDIARY: number;
  UNDETERMINED: number;
}

export function CauseTrendsChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="ACCIDENTAL"   fill="#2563eb" radius={[3,3,0,0]} />
        <Bar dataKey="INCENDIARY"   fill="#ea580c" radius={[3,3,0,0]} />
        <Bar dataKey="NATURAL"      fill="#16a34a" radius={[3,3,0,0]} />
        <Bar dataKey="UNDETERMINED" fill="#eab308" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
