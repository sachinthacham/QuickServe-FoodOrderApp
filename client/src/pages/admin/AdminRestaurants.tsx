import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { restaurantService } from "@/features/restaurant/services/restaurantService";
import type { Restaurant } from "@/features/restaurant/services/restaurantService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { ChevronLeft } from "lucide-react";

function AdminRestaurantsContent() {
  const { token } = useAuthStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getAll(token || undefined);
        setRestaurants(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [token]);

  return (
    <div className="container mx-auto px-6 py-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-red-500 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
        All Restaurants
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <div className="glass-card rounded-[2rem] py-16 text-center border-dashed border-2">
          <p className="text-slate-500 font-medium">No restaurants found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-6 font-semibold">Address</th>
                  <th className="py-4 px-6 font-semibold text-center">
                    Menu Items
                  </th>
                  <th className="py-4 px-6 font-semibold text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {restaurant.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                      {restaurant.address}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400">
                      {restaurant.menuItems?.length ?? 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        to={`/restaurant/${restaurant.id}`}
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                      >
                        Open
                      </Link>
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

export default function AdminRestaurants() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminRestaurantsContent />
    </ProtectedRoute>
  );
}
