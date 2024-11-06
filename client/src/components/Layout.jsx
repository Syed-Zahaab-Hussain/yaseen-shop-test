import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Package,
  ShoppingCart,
  Receipt,
  Barcode,
  Shield,
  BookOpen,
  Users,
  Grid,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/api";
import useAuth from "@/lib/useAuth";
import { ScrollArea } from "./ui/scroll-area";
import EditUserDialog from "./EditUserDialog";

const Layout = () => {
  const { pathname } = useLocation();
  const { clearState, user, isDrawerOpen, setIsDrawerOpen } = useAuth();
  // Add state for dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Close drawer on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const drawer = document.getElementById("sidebar-drawer");
      const menuButton = document.getElementById("menu-button");

      if (
        drawer &&
        !drawer.contains(event.target) &&
        menuButton &&
        !menuButton.contains(event.target) &&
        window.innerWidth < 1024 &&
        isDrawerOpen
      ) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Close drawer on route change for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsDrawerOpen(false);
    }
  }, [pathname, setIsDrawerOpen]);

  const menuItems = [
    { title: "Home", link: "/home", icon: Home },
    { title: "Products", link: "/products", icon: Package },
    { title: "Purchases", link: "/purchases", icon: ShoppingCart },
    { title: "Sales", link: "/sales", icon: Receipt },
    { title: "Barcode Scanner", link: "/barcode-scanner", icon: Barcode },
    { title: "Claim Warranties", link: "/claim-warranties", icon: Shield },
    { title: "Ledger", link: "/ledger", icon: BookOpen },
    { title: "Suppliers", link: "/suppliers", icon: Users },
    { title: "Category", link: "/category", icon: Grid },
  ];

  // Static routes
  const staticTitles = {
    "/login": "Login",
    "/register": "Register",
  };

  // Dynamic route patterns and their titles
  const dynamicRoutes = [
    { pattern: /^\/purchase\/[^/]+$/, title: "Purchase Details" },
    { pattern: /^\/sale\/[^/]+$/, title: "Sale Details" },
    { pattern: /^\/ledger\/[^/]+$/, title: "Ledger Details" },
    { pattern: /^\/receipt\/[^/]+$/, title: "Receipt" },
  ];

  const handleLogout = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      setIsDrawerOpen(false);
      clearState();
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

  // Get current title checking static, dynamic, and menu routes
  const getCurrentTitle = () => {
    // Check menu items first
    const menuItem = menuItems.find((item) => item.link === pathname);
    if (menuItem) return menuItem.title;

    // Check static routes
    if (pathname in staticTitles) return staticTitles[pathname];

    // Check dynamic routes
    const dynamicRoute = dynamicRoutes.find((route) =>
      route.pattern.test(pathname)
    );
    if (dynamicRoute) return dynamicRoute.title;

    return "Page Not Found";
  };

  const currentTitle = getCurrentTitle();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay for mobile - Only show when logged in */}
      {isDrawerOpen && user && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      {/* Drawer - Only show when logged in */}
      {user && (
        <div
          id="sidebar-drawer"
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-blue-500 text-white shadow-xl",
            "transform transition-transform duration-300 ease-in-out lg:transform-none",
            isDrawerOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-4 border-b border-blue-400">
              <h2 className="text-xl font-bold">
                Retail Management
                <span className="block text-sm font-normal">System</span>
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-white hover:text-gray-300 lg:hidden"
              >
                <X size={24} />
              </button>
            </div>
            <ScrollArea>
              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      to={item.link}
                      className={cn(
                        "flex items-center gap-3 py-2 px-4 hover:bg-blue-600 transition-colors",
                        pathname === item.link && "bg-blue-600"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
            {/* Company Info */}
            <div className="p-4 bg-white/10 m-4 rounded-lg text-center">
              <h2 className="text-xl font-bold mb-2">ZIFTEK</h2>
              <p className="text-sm">Email: info@ziftek.com</p>
              <p className="text-sm">+92314 1014266</p>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {user && (
              <Button
                id="menu-button"
                variant="ghost"
                size="icon"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </Button>
            )}
            <h1 className="text-xl font-semibold truncate">{currentTitle}</h1>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.image} alt={user?.username} />
                    <AvatarFallback>
                      {user?.username.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                {/* // In the DropdownMenuContent, replace the existing items with: */}
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <span className="font-medium">{user?.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => handleLogout.mutate()}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Login
            </Link>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
      {/* // Add the EditUserDialog component before the closing div of the Layout */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
};

export default Layout;
