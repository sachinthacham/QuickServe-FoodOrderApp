import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  restaurantService,
  
} from "@/features/restaurant/services/restaurantService";
import type {
 
  MenuItem,
} from "@/features/restaurant/services/restaurantService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Plus, Edit, Trash2 } from "lucide-react";

function SellerMenuItemsContent() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { token } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (!token || !restaurantId) return;

    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getMenuItems(restaurantId, token);
        setMenuItems(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [token, restaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !restaurantId) return;

    try {
      const newItem = await restaurantService.createMenuItem(
        restaurantId,
        {
          restaurantId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
        },
        token
      );
      setMenuItems([...menuItems, newItem]);
      setFormData({ name: "", description: "", price: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create menu item");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !restaurantId || !editingItem) return;

    try {
      const updated = await restaurantService.updateMenuItem(
        restaurantId,
        editingItem.id,
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
        },
        token
      );
      setMenuItems(menuItems.map((i) => (i.id === updated.id ? updated : i)));
      setEditingItem(null);
      setFormData({ name: "", description: "", price: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to update menu item");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !token ||
      !restaurantId ||
      !confirm("Are you sure you want to delete this item?")
    )
      return;

    try {
      await restaurantService.deleteMenuItem(restaurantId, id, token);
      setMenuItems(menuItems.filter((i) => i.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete menu item");
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-gray-600">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Link
        to="/seller/restaurants"
        className="text-red-500 hover:underline mb-6 inline-block"
      >
        ← Back to Restaurants
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Menu Items</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingItem(null);
            setFormData({ name: "", description: "", price: "" });
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cancel" : "Add Menu Item"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingItem ? "Edit Menu Item" : "Create Menu Item"}
          </h2>
          <form
            onSubmit={editingItem ? handleUpdate : handleCreate}
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
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              {editingItem ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      {menuItems.length === 0 ? (
        <p className="text-gray-600">No menu items yet. Add your first item!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden p-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="w-full h-36 object-cover rounded-lg mb-3"
              />
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-red-500 mb-4">
                ${item.price.toFixed(2)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 bg-red-200 rounded hover:bg-red-300 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerMenuItems() {
  return (
    <ProtectedRoute allowedRoles={["Seller", "Admin"]}>
      <SellerMenuItemsContent />
    </ProtectedRoute>
  );
}
