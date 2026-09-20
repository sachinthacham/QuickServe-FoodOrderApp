import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  restaurantService,
} from "@/features/restaurant/services/restaurantService";
import type {
  Restaurant,
} from "@/features/restaurant/services/restaurantService";
import { orderService } from "@/features/orders/services/orderService";
import type { Order } from "@/features/orders/services/orderService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { TrendingUp, Users, Store, DollarSign, Package, Clock, CheckCircle, ChevronRight, Activity, Eye, ShieldAlert, LayoutDashboard, ArrowRight } from "lucide-react";

function AdminDashboardContent() {
  const { token } = useAuthStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantsData, ordersData] = await Promise.all([
          restaurantService.getAll(token),
          orderService.getAll(token),
        ]);
        setRestaurants(restaurantsData);
        setOrders(ordersData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 dark:bg-red-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-down">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-500/10 text-red-500 p-2 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <p className="text-red-500 font-bold tracking-wider uppercase text-sm">Administrator Panel</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Platform Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light max-w-2xl">
              Monitor key metrics, manage operations, and oversee platform health in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Online</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 glass-card border-red-500/20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl flex items-start gap-4 text-red-600 animate-shake shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400 text-lg">System Alert</h3>
              <p className="text-sm font-medium mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Total Restaurants */}
          <div className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Restaurants</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{restaurants.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Store className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-green-500 gap-1 relative z-10">
              <TrendingUp className="w-4 h-4" /> <span>Active Partners</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Orders</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{orders.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Package className="w-6 h-6" />
              </div>
            </div>
             <div className="mt-4 flex items-center text-sm font-medium text-blue-500 gap-1 relative z-10">
              <Activity className="w-4 h-4" /> <span>All-time metrics</span>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Processing</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {orders.filter((o) => o.status !== "DELIVERED").length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-yellow-500 gap-1 relative z-10">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> <span>Needs attention</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="glass-card bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-lg hover:shadow-xl transition-shadow group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Delivered Revenue</p>
                <h3 className="text-4xl font-black text-white tracking-tight">
                  <span className="text-green-400">$</span>{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
             <div className="mt-4 flex items-center text-sm font-medium text-green-400 gap-1 relative z-10">
              <CheckCircle className="w-4 h-4" /> <span>Successfully Completed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content Area: Recent Orders */}
          <div className="xl:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-red-500" /> Recent Operations
              </h2>
              <Link to="/admin/orders" className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="glass-card rounded-[2rem] py-16 text-center border-dashed border-2">
                <p className="text-slate-500 font-medium">No order activity detected yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                        <th className="py-4 px-6 font-semibold">Order ID</th>
                        <th className="py-4 px-6 font-semibold">Date & Time</th>
                        <th className="py-4 px-6 font-semibold text-right">Amount</th>
                        <th className="py-4 px-6 font-semibold text-center">Status</th>
                        <th className="py-4 px-6 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-900 dark:text-white block">#{order.id.slice(0, 8)}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                            {new Date(order.orderDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-bold text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                                  : order.status === "PLACED"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                              }`}
                            >
                              {order.status === "DELIVERED" && <CheckCircle className="w-3 h-3" />}
                              {order.status === "PLACED" && <Clock className="w-3 h-3" />}
                              {(order.status !== "DELIVERED" && order.status !== "PLACED") && <Package className="w-3 h-3" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-block" title="View Order">
                               <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Quick Actions */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-red-500" /> Management
            </h2>
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-3">
              <Link
                to="/admin/restaurants"
                className="group flex flex-col p-5 bg-orange-50 hover:bg-orange-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 hover:border-orange-200 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Partner Restaurants</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">Approve, edit, or remove restaurant listings.</p>
              </Link>

              <Link
                to="/admin/users"
                className="group flex flex-col p-5 bg-purple-50 hover:bg-purple-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 hover:border-purple-200 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">User Accounts</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">Manage customers, sellers, and delivery staff.</p>
              </Link>
              
              <Link
                to="/admin/orders"
                className="group flex flex-col p-5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">All Orders</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">Global view of all platform transactions.</p>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
