import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { restaurantService } from "@/features/restaurant/services/restaurantService";
import type { Restaurant } from "@/features/restaurant/services/restaurantService";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { toast } from "@/store/useToastStore";
import { ArrowLeft, Star, Clock, MapPin, Info, Plus, Minus, Heart, Search } from "lucide-react";
import Header from "@/components/Home/Header";
import Footer from "@/components/common/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import ReviewSection from "@/features/reviews/components/ReviewSection";

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    cart,
    setRestaurant: setCartRestaurant,
    loadCart,
  } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite, loadFavorites } = useFavoritesStore();

  // Load cart when component mounts or token changes
  useEffect(() => {
    if (token) {
      loadCart(token);
      loadFavorites(token);
    }
  }, [token, loadCart, loadFavorites]);

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getById(id, token || undefined);
        setRestaurant(data);
        setCartRestaurant(data.id); // Set restaurant in cart store
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, token]);

  const filteredMenuItems = useMemo(() => {
    if (!restaurant) return [];
    const query = menuSearch.trim().toLowerCase();
    const priceCeiling = maxPrice ? parseFloat(maxPrice) : null;
    return restaurant.menuItems.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      const matchesPrice = priceCeiling === null || item.price <= priceCeiling;
      return matchesQuery && matchesPrice;
    });
  }, [restaurant, menuSearch, maxPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-[400px] w-full rounded-none" />
        <div className="container mx-auto px-6 py-12 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6">
        <div className="glass-card border-red-200 dark:border-red-900/50 p-10 rounded-[2rem] text-center max-w-md">
          <h3 className="font-bold text-lg text-red-600 mb-2">Restaurant not found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || "This restaurant may have been removed."}</p>
          <Link to="/" className="inline-block bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-600 transition-colors">
            ← Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 relative pb-20 mt-16 lg:mt-0">
        {/* Hero Section */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          </div>
          
          <div className="absolute top-6 left-6 z-20">
            <Link to="/" className="inline-flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          {isAuthenticated && (
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => token && toggleFavorite(restaurant.id, token)}
                title={isFavorite(restaurant.id) ? "Remove from favorites" : "Add to favorites"}
                className={`inline-flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border transition-all duration-300 group ${
                  isFavorite(restaurant.id)
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-red-500 hover:border-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 group-hover:fill-current ${isFavorite(restaurant.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full">
            <div className="container mx-auto px-6 pb-12 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> 4.9
                    </span>
                    <span className="px-3 py-1 glass text-white text-xs font-semibold rounded-full flex items-center gap-1 border-white/20">
                      <Clock className="w-3 h-3" /> 25-35 min
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-lg text-slate-300 font-light max-w-2xl line-clamp-2">
                    {restaurant.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 -mt-8 relative z-20 flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-12">
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card dark:bg-slate-900/80 p-5 rounded-2xl flex items-start gap-4 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Location</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">{restaurant.address}</p>
                </div>
              </div>
              <div className="glass-card dark:bg-slate-900/80 p-5 rounded-2xl flex items-start gap-4 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Restaurant Info</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">Minimum order: $15 • Delivery fee: $2.99</p>
                </div>
              </div>
            </div>

            {/* Menu Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Menu</h2>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                  {restaurant.menuItems.length} items
                </span>
              </div>

              {restaurant.menuItems.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      placeholder="Search dishes..."
                      className="pl-11 rounded-full"
                    />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max price"
                    className="sm:w-40 rounded-full"
                  />
                </div>
              )}

              {restaurant.menuItems.length === 0 ? (
                <div className="glass-card py-16 text-center rounded-[2rem]">
                  <p className="text-slate-500 font-medium">No menu items available at the moment.</p>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="glass-card py-16 text-center rounded-[2rem]">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No dishes match your filters.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredMenuItems.map((item, idx) => {
                    const cartItem = cart.find(
                      (i) => i._id === item.id || i.id === item.id
                    );

                    return (
                      <div
                        key={item.id}
                        className="group relative bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl dark:shadow-none dark:border border-slate-100 dark:border-slate-800 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up flex flex-col justify-between"
                        style={{ animationDelay: `${0.3 + (idx * 0.05)}s` }}
                      >
                        <div className="flex gap-4 mb-4">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-red-500 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-light">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">
                            ${item.price.toFixed(2)}
                          </span>

                          {!cartItem ? (
                            <button
                              className="bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn active:scale-95"
                              disabled={!token}
                              onClick={async () => {
                                if (!token) return;
                                setCartRestaurant(restaurant.id);
                                try {
                                  await addToCart(
                                    {
                                      _id: item.id,
                                      name: item.name,
                                      price: item.price,
                                      image: item.imageUrl,
                                    },
                                    restaurant.id,
                                    token
                                  );
                                  toast.success(`${item.name} added to cart`);
                                } catch (err: any) {
                                  toast.error(err.message || "Failed to add item to cart");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                              <button
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-700 dark:text-white hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500 dark:hover:text-white transition-colors shadow-sm disabled:opacity-50"
                                disabled={!token}
                                onClick={async () => {
                                  if (!token) return;
                                  try {
                                    await decreaseQuantity(cartItem.id, token);
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to update quantity");
                                  }
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                                {cartItem.quantity}
                              </span>
                              <button
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-700 dark:text-white hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500 dark:hover:text-white transition-colors shadow-sm disabled:opacity-50"
                                disabled={!token}
                                onClick={async () => {
                                  if (!token) return;
                                  try {
                                    await increaseQuantity(cartItem.id, token);
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to update quantity");
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Reviews Section */}
            <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
              <ReviewSection restaurantId={restaurant.id} />
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
