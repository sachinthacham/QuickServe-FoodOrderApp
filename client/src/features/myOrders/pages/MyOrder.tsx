import { useEffect, useState } from "react";
import { orderService } from "@/features/orders/services/orderService";
import type { Order } from "@/features/orders/services/orderService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import OrderTracking from "@/components/orders/OrderTracking";
import { ShoppingBag, PackageSearch, Clock, Receipt, CheckCircle, Package } from "lucide-react";

function MyOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders(token);
        setOrders(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PLACED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
      case "PREPARING":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20";
      case "READY":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20";
      case "PICKED_UP":
      case "ON_THE_WAY":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20";
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-12 flex justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-red-500 animate-spin"></div>
           <p className="text-slate-500 font-medium tracking-wide animate-pulse">Retrieving your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 overflow-hidden">
      
      {/* Immersive Header */}
      <div className="relative h-[250px] w-full overflow-hidden mb-12">
          <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555507036-ab1d4075cbf9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full z-10">
            <div className="max-w-4xl mx-auto px-6 pb-10 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-3">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                 </div>
                 <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                    My Orders
                 </h1>
              </div>
              <p className="text-slate-300 font-light max-w-xl text-lg ml-16 drop-shadow-sm">
                Track your active orders and review your past culinary adventures.
              </p>
            </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-20 -mt-8">
        {error && (
          <div className="mb-8 p-4 glass-card border-red-500/20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl flex items-start gap-4 text-red-600 animate-shake shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
            <PackageSearch className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
            <div>
               <h3 className="font-bold text-red-700 dark:text-red-400 text-lg">Unable to fetch orders</h3>
               <p className="text-sm font-medium mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="glass-card rounded-[2rem] p-16 text-center animate-fade-in-up border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-slate-700 text-slate-400">
               <Receipt className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Past Orders Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Looks like you haven't ordered anything yet. When you do, your tracking and history will appear here.
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow animate-fade-in-up group overflow-hidden relative"
                style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}
              >
                {/* Decorative highlight on active orders */}
                {order.status !== "DELIVERED" && (
                   <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20 transition-colors"></div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                        Order <span className="text-slate-400 font-light">#{order.id.slice(0, 8)}</span>
                      </h3>
                       <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                         {order.status === "DELIVERED" && <CheckCircle className="w-3 h-3" />}
                         {order.status === "PLACED" && <Clock className="w-3 h-3" />}
                         {(order.status !== "DELIVERED" && order.status !== "PLACED") && <Package className="w-3 h-3" />}
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                       <Clock className="w-4 h-4" />
                       {new Date(order.orderDateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Order Tracking Timeline */}
                <div className="mb-6 relative z-10">
                   <OrderTracking order={order} />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 relative z-10 mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Order Items</h4>
                  <ul className="text-sm font-medium space-y-3">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between items-center group/item">
                        <span className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span>
                            <span className="font-bold text-slate-900 dark:text-white inline-block w-6">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white ml-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-end pt-5 border-t border-slate-100 dark:border-slate-800 relative z-10">
                   <div>
                      <span className="block text-sm text-slate-500 font-medium mb-1">Total Amount Paid</span>
                      <p className="font-extrabold text-2xl text-slate-900 dark:text-white">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                   </div>
                   <div className="text-slate-400 font-medium text-sm flex items-center gap-1">
                      <Receipt className="w-4 h-4" /> Receipt Saved
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrders() {
  return (
    <ProtectedRoute>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}
