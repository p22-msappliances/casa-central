/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminStats, getAdminOrders } from '@/app/actions/admin';
import { DashboardCharts } from './DashboardCharts';

const productPerformance = [
  { name: 'Refrigerators', revenue: 420000 },
  { name: 'Washing Machines', revenue: 310000 },
  { name: 'TVs', revenue: 280000 },
  { name: 'Audio Systems', revenue: 150000 },
  { name: 'Air Conditioners', revenue: 85000 },
];

export default async function AdminDashboardPage() {
  const [statsResult, ordersResult] = await Promise.all([
    getAdminStats(),
    getAdminOrders(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const recentOrders = ordersResult.success ? (ordersResult.data as any[]).slice(0, 4) : [];

  const statsConfig = [
    {
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.totalRevenue || 0),
      change: '+12.5%',
      icon: 'DollarSign',
      color: 'text-green-500'
    },
    {
      label: 'Orders',
      value: stats?.orderCount || 0,
      change: '+8.2%',
      icon: 'ShoppingCart',
      color: 'text-blue-500'
    },
    {
      label: 'Products',
      value: stats?.productCount || 0,
      change: '+3.1%',
      icon: 'Package',
      color: 'text-purple-500'
    },
    {
      label: 'Customers',
      value: stats?.customerCount || 0,
      change: '+15.3%',
      icon: 'Users',
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
          const IconName = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} vs last month
              </span>
            </div>
          );
        })}
      </div>

      <DashboardCharts productPerformance={productPerformance} />

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
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                      order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>{order.status}</span>
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
