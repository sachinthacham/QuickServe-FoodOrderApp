import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, MapPin } from "lucide-react";
import { restaurantService } from "@/features/restaurant/services/restaurantService";
import type { Restaurant } from "@/features/restaurant/services/restaurantService";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { toast } from "@/store/useToastStore";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/common/ProtectedRoute";

function FavoritesContent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { restaurantIds, isLoaded, loadFavorites, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    if (token) loadFavorites(token);
  }, [token, loadFavorites]);

  useEffect(() => {
    if (!isLoaded) return;
    const fetchFavoriteRestaurants = async () => {
      try {
        setLoading(true);
        const all = await restaurantService.getAll(token || undefined);
        setRestaurants(all.filter((r) => restaurantIds.has(r.id)));
      } catch (err: any) {
        toast.error(err.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteRestaurants();
  }, [isLoaded, restaurantIds, token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg shadow-red-500/30">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your Favorites
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 pl-12 text-lg font-light">
            Restaurants you've saved for later
          </p>
        </div>

        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-[320px] rounded-[2rem]" />
            ))}
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div className="glass-card py-24 text-center rounded-[2rem] animate-fade-in-up border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Tap the heart icon on any restaurant to save it here for quick access later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all"
            >
              Browse Restaurants
            </Link>
          </div>
        )}

        {!loading && restaurants.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((restaurant, idx) => (
              <div
                key={restaurant.id}
                className="group relative rounded-[2rem] bg-white dark:bg-slate-800 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Link to={`/restaurant/${restaurant.id}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10"></div>
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-slate-800 dark:text-slate-200">4.8</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => token && toggleFavorite(restaurant.id, token)}
                  title="Remove from favorites"
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-red-500 border border-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                <Link to={`/restaurant/${restaurant.id}`} className="block p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-red-500 transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2 px-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
