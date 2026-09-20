import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Commonlayout";
import Home from "../pages/HomePage";
import CartPage from "@/features/cart/pages/CartPage";
import SignUp from "@/features/auth/pages/SignUp";
import SignIn from "@/features/auth/pages/SignIn";
import PlaceOrder from "@/features/orders/pages/PlaceOrder";
import OrderSuccess from "@/features/orders/pages/OrderSuccess";
import MyOrders from "@/features/myOrders/pages/MyOrder";
import RestaurantDetailPage from "../pages/RestaurantDetailPage";
import UserProfilePage from "@/features/users/pages/UserProfilePage";
import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import About from "../pages/AboutPage";
import Contact from "../pages/Contactpage";
import NotFound from "../pages/NotFound";

// Seller pages
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerRestaurants from "../pages/seller/SellerRestaurants";
import SellerMenuItems from "../pages/seller/SellerMenuItems";
import SellerOrders from "../pages/seller/SellerOrders";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminRestaurants from "../pages/admin/AdminRestaurants";

// Delivery pages
import DeliveryOrders from "../pages/delivery/DeliveryOrders";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public routes
      { path: "/", element: <Home /> },
      { path: "/signin", element: <SignIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/restaurant/:id", element: <RestaurantDetailPage /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },

      // Buyer routes
      { path: "/cart", element: <CartPage /> },
      { path: "/order", element: <PlaceOrder /> },
      { path: "/order-success", element: <OrderSuccess /> },
      { path: "/my-orders", element: <MyOrders /> },
      { path: "/profile", element: <UserProfilePage /> },
      { path: "/favorites", element: <FavoritesPage /> },

      // Seller routes
      { path: "/seller/dashboard", element: <SellerDashboard /> },
      { path: "/seller/restaurants", element: <SellerRestaurants /> },
      {
        path: "/seller/restaurants/:restaurantId/menu-items",
        element: <SellerMenuItems />,
      },
      { path: "/seller/orders", element: <SellerOrders /> },

      // Admin routes
      { path: "/admin/dashboard", element: <AdminDashboard /> },
      { path: "/admin/users", element: <AdminUsers /> },
      { path: "/admin/orders", element: <AdminOrders /> },
      { path: "/admin/restaurants", element: <AdminRestaurants /> },

      // Delivery routes
      { path: "/delivery/orders", element: <DeliveryOrders /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
