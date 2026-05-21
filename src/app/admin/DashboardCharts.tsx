/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

const salesData = [
  { month: 'Jan', sales: 120000, orders: 45 },
  { month: 'Feb', sales: 150000, orders: 52 },
  { month: 'Mar', sales: 180000, orders: 61 },
  { month: 'Apr', sales: 220000, orders: 78 },
  { month: 'May', sales: 190000, orders: 65 },
  { month: 'Jun', sales: 250000, orders: 85 },
];

export function DashboardCharts({ productPerformance }: { productPerformance: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-card border border-secondary/30">
        <h3 className="text-lg font-bold text-primary font-heading mb-4">Sales Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 240 / 15%)" />
            <XAxis dataKey="month" stroke="oklch(0.556 0.03 240)" />
            <YAxis stroke="oklch(0.556 0.03 240)" />
            <Tooltip contentStyle={{ background: 'oklch(0.18 0.02 245)', border: '1px solid oklch(0.25 0.01 240 / 15%)', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="sales" stroke="#C9A84C" fill="url(#colorSales)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-xl bg-card border border-secondary/30">
        <h3 className="text-lg font-bold text-primary font-heading mb-4">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={productPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 240 / 15%)" />
            <XAxis dataKey="name" stroke="oklch(0.556 0.03 240)" />
            <YAxis stroke="oklch(0.556 0.03 240)" />
            <Tooltip contentStyle={{ background: 'oklch(0.18 0.02 245)', border: '1px solid oklch(0.25 0.01 240 / 15%)', borderRadius: '12px' }} />
            <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
