import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  restaurantService,
  
} from "@/features/restaurant/services/restaurantService";
import type {
 
  Restaurant,
} from "@/features/restaurant/services/restaurantService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Plus, Edit, Trash2 } from "lucide-react";

function SellerRestaurantsContent() {
  const { token } = useAuthStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
  });

  useEffect(() => {
    if (!token) return;

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getMyRestaurants(token);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const newRestaurant = await restaurantService.create(formData, token);
      setRestaurants([...restaurants, newRestaurant]);
      setFormData({ name: "", description: "", address: "" });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create restaurant");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingRestaurant) return;

    try {
      const updated = await restaurantService.update(
        editingRestaurant.id,
        formData,
        token
      );
      setRestaurants(
        restaurants.map((r) => (r.id === updated.id ? updated : r))
      );
      setEditingRestaurant(null);
      setFormData({ name: "", description: "", address: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update restaurant");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this restaurant?"))
      return;

    try {
      await restaurantService.delete(id, token);
      setRestaurants(restaurants.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete restaurant");
    }
  };

  const startEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
    });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-gray-600">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Restaurants</h1>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingRestaurant(null);
            setFormData({ name: "", description: "", address: "" });
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showCreateForm ? "Cancel" : "Add Restaurant"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingRestaurant ? "Edit Restaurant" : "Create Restaurant"}
          </h2>
          <form
            onSubmit={editingRestaurant ? handleUpdate : handleCreate}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              {editingRestaurant ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* Restaurants List */}
      {restaurants.length === 0 ? (
        <p className="text-gray-600">
          No restaurants yet. Create your first restaurant!
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-32 overflow-hidden bg-slate-100">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {restaurant.description}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  📍 {restaurant.address}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/seller/restaurants/${restaurant.id}/menu-items`}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-center text-sm hover:bg-blue-600 transition"
                  >
                    Manage Menu
                  </Link>
                  <button
                    onClick={() => startEdit(restaurant)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="px-4 py-2 bg-red-200 rounded hover:bg-red-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerRestaurants() {
  return (
    <ProtectedRoute allowedRoles={["Seller", "Admin"]}>
      <SellerRestaurantsContent />
    </ProtectedRoute>
  );
}
