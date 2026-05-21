/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminStats, getAdminOrders, getDashboardCharts } from '@/app/actions/admin';
import { DashboardCharts } from './DashboardCharts';

const statusStyles: Record<string, string> = {
  delivered: 'bg-green-500/10 text-green-500',
  shipped: 'bg-primary/10 text-primary',
  processing: 'bg-yellow-500/10 text-yellow-500',
  pending: 'bg-blue-500/10 text-blue-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

export default async function AdminDashboardPage() {
  const [statsResult, ordersResult, chartsResult] = await Promise.all([
    getAdminStats(),
    getAdminOrders(4),
    getDashboardCharts(),
  ]);

  const stats = statsResult && statsResult.success && statsResult.data ? statsResult.data : null;
  const recentOrders = ordersResult && ordersResult.success && ordersResult.data ? ordersResult.data as any[] : [];
  const charts = chartsResult && chartsResult.success && chartsResult.data ? chartsResult.data : { salesData: [], productPerformance: [] };

  const statsConfig = [
    {
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.totalRevenue || 0),
      color: 'text-green-500'
    },
    {
      label: 'Orders',
      value: stats?.orderCount || 0,
      color: 'text-blue-500'
    },
    {
      label: 'Products',
      value: stats?.productCount || 0,
      color: 'text-purple-500'
    },
    {
      label: 'Customers',
      value: stats?.customerCount || 0,
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
        {statsConfig.map((stat) => (
        <div key={stat.label} className="p-4 rounded-xl bg-card border border-secondary/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stat.value}</p>
        </div>
      ))}
      </div>

      <DashboardCharts salesData={charts.salesData} productPerformance={charts.productPerformance} />

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
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                  <td className="p-4 font-medium text-primary">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 text-muted-foreground">{order.customer}</td>
                  <td className="p-4 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total))}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status] || 'bg-blue-500/10 text-blue-500'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
