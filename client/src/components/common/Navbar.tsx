import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ShoppingCart, LogOut, User, Sun, Moon } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { cart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = useMemo(() => {
    const baseLinks = [
      { name: "Home", href: "/" },
    ];

    if (!isAuthenticated) {
      return [...baseLinks, { name: "Sign In", href: "/signin" }];
    }

    const roleLinks: { [key: string]: { name: string; href: string }[] } = {
      Buyer: [
        { name: "Favorites", href: "/favorites" },
        { name: "My Orders", href: "/my-orders" },
      ],
      Seller: [
        { name: "Dashboard", href: "/seller/dashboard" },
        { name: "Restaurants", href: "/seller/restaurants" },
        { name: "Orders", href: "/seller/orders" },
      ],
      DeliveryBoy: [
        { name: "Deliveries", href: "/delivery/orders" },
      ],
      Admin: [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Users", href: "/admin/users" },
        { name: "Orders", href: "/admin/orders" },
      ],
    };

    return [...baseLinks, ...(roleLinks[user?.role || "Buyer"] || [])];
  }, [isAuthenticated, user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="w-full max-w-7xl glass rounded-full px-6 py-3 flex justify-between items-center pointer-events-auto transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 hover:scale-105 transition-transform flex items-center gap-2">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v5h-2zm0 6h2v2h-2z"/></svg>
          <span className="hidden sm:inline">Foodie</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
            >
              {link.name}
            </Link>
          ))}

          {/* Cart Icon - Only show for Buyers */}
          {isAuthenticated && user?.role === "Buyer" && (
            <Link to="/cart" className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 ml-2">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 text-slate-700 dark:text-slate-200 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 ml-1"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              <Link to="/profile" className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                <div className="bg-red-500 text-white p-1 rounded-full">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {user?.firstName}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full font-bold">
                  {user?.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="ml-4 px-6 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          {isAuthenticated && user?.role === "Buyer" && (
            <Link to="/cart" className="relative p-2 text-slate-700 dark:text-slate-200">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 text-slate-700 dark:text-slate-200"
          >
            {theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="rounded-full p-2 hover:bg-slate-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l border-white/20">
              <div className="flex justify-between items-center mb-8 mt-4">
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Menu</div>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="rounded-full">
                    <X className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
              </div>
              <ScrollArea className="h-[calc(100vh-100px)]">
                <ul className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="block px-4 py-3 text-lg font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  {isAuthenticated && (
                    <>
                      <li className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                        <Link to="/profile" className="block bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-4 rounded-xl mb-4 transition-colors">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             <User className="w-4 h-4 text-red-500" />
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-sm text-red-500 font-semibold mt-1">
                            {user?.role}
                          </div>
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 px-4 py-3 rounded-xl transition-colors font-bold"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
