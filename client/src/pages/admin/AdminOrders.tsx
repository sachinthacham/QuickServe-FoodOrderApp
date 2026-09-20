import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderService } from "@/features/orders/services/orderService";
import type { Order } from "@/features/orders/services/orderService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { ChevronLeft, Package } from "lucide-react";

function AdminOrdersContent() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getAll(token);
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

  const statusClass = (status: string) => {
    if (status === "DELIVERED")
      return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20";
    if (status === "PLACED")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20";
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-red-500 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
        All Orders
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-[2rem] py-16 text-center border-dashed border-2">
          <p className="text-slate-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="py-4 px-6 font-semibold">Order ID</th>
                  <th className="py-4 px-6 font-semibold">Date &amp; Time</th>
                  <th className="py-4 px-6 font-semibold text-center">Items</th>
                  <th className="py-4 px-6 font-semibold text-right">Amount</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(order.orderDateTime).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass(
                          order.status
                        )}`}
                      >
                        <Package className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}
