/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { getAdminStats } from '@/app/actions/admin';

const salesData = [
  { month: 'Jan', sales: 120000, orders: 45 },
  { month: 'Feb', sales: 150000, orders: 52 },
  { month: 'Mar', sales: 180000, orders: 61 },
  { month: 'Apr', sales: 220000, orders: 78 },
  { month: 'May', sales: 190000, orders: 65 },
  { month: 'Jun', sales: 250000, orders: 85 },
];

const productPerformance = [
  { name: 'Refrigerators', revenue: 420000 },
  { name: 'Washing Machines', revenue: 310000 },
  { name: 'TVs', revenue: 280000 },
  { name: 'Audio Systems', revenue: 150000 },
  { name: 'Air Conditioners', revenue: 85000 },
];

const recentOrders = [
  { id: 'CC-ABC123', customer: 'Maria Santos', total: 65000, status: 'Shipped' },
  { id: 'CC-DEF456', customer: 'Jose Reyes', total: 25000, status: 'Pending' },
  { id: 'CC-GHI789', customer: 'Anna Cruz', total: 95000, status: 'Delivered' },
  { id: 'CC-JKL012', customer: 'Pedro Tan', total: 42000, status: 'Processing' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await getAdminStats();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsConfig = [
    { 
      label: 'Total Revenue', 
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.totalRevenue || 0), 
      change: '+12.5%', 
      icon: DollarSign, 
      color: 'text-green-500' 
    },
    { 
      label: 'Orders', 
      value: stats?.orderCount || 0, 
      change: '+8.2%', 
      icon: ShoppingCart, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Products', 
      value: stats?.productCount || 0, 
      change: '+3.1%', 
      icon: Package, 
      color: 'text-purple-500' 
    },
    { 
      label: 'Customers', 
      value: stats?.customerCount || 0, 
      change: '+15.3%', 
      icon: Users, 
      color: 'text-orange-500' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is your store overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} vs last month
              </span>
            </div>
          );
        })}
      </div>

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

      <div className="p-6 rounded-xl bg-card border border-secondary/30">
        <h3 className="text-lg font-bold text-primary font-heading mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                  <td className="p-4 font-medium text-primary">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 text-muted-foreground">{order.customer}</td>
                  <td className="p-4 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total))}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                      order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

