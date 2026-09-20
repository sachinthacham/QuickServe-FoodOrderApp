import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/common/Footer";
import Header from "@/components/Home/Header";
import {
  restaurantService,

} from "@/features/restaurant/services/restaurantService";
import type{

  Restaurant,
} from "@/features/restaurant/services/restaurantService";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart } from "lucide-react";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { token, isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite, loadFavorites } = useFavoritesStore();

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

  useEffect(() => {
    if (token) {
      loadFavorites(token);
    }
  }, [token, loadFavorites]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
    );
  }, [restaurants, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Header />

      <main id="restaurants" className="container mx-auto px-6 py-20 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured <span className="text-gradient">Restaurants</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Hand-picked culinary experiences just for you
            </p>
          </div>

          <div className="w-full md:w-80 mt-6 md:mt-0 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="pl-11 rounded-full h-12"
            />
          </div>
        </div>

        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(n => (
              <Skeleton key={n} className="h-[400px] rounded-[2rem]" />
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card border-red-200 dark:border-red-900/50 p-6 rounded-2xl flex items-center gap-4 text-red-600 animate-shake">
            <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-lg">Error loading restaurants</h3>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="glass-card py-24 text-center rounded-[2rem] animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No restaurants found</h3>
            <p className="text-slate-500 dark:text-slate-400">We couldn't find any partners in your area yet.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && filteredRestaurants.length === 0 && (
          <div className="glass-card py-24 text-center rounded-[2rem] animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No matches for "{search}"</h3>
            <p className="text-slate-500 dark:text-slate-400">Try a different search term.</p>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant, idx) => (
              <Link
                key={restaurant.id}
                to={`/restaurant/${restaurant.id}`}
                className="group relative block rounded-[2rem] bg-white dark:bg-slate-800 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
              >
                {/* Image / Cover placeholder */}
                <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10"></div>
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Favorite toggle */}
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (token) toggleFavorite(restaurant.id, token);
                      }}
                      title={isFavorite(restaurant.id) ? "Remove from favorites" : "Add to favorites"}
                      className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all duration-300 ${
                        isFavorite(restaurant.id)
                          ? "bg-red-500 border-red-500 text-white opacity-100"
                          : "bg-white/20 border-white/30 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-red-500 hover:border-red-500"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(restaurant.id) ? "fill-current" : ""}`} />
                    </button>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span className="text-slate-800 dark:text-slate-200">4.8</span>
                  </div>
                </div>

                <div className="p-6 relative">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-red-500 transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 py-2 px-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      {restaurant.menuItems.length} items
                    </div>
                    <span className="text-red-500 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Menu <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
