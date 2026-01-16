import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  ChartLine,
  CalendarRange,
  Tickets,
  ShoppingCart,
  Plus,
  ScanLine,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types";
import { authService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  role: "admin" | "organizer";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token, clearAuth } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const getMenuItems = (): MenuItem[] => {
    if (role === "admin") {
      return [
        {
          label: "Tổng quan",
          path: "/admin/overview",
          icon: (
            <ChartLine
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Quản lý sự kiện",
          path: "/admin/events",
          icon: (
            <CalendarRange
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Quản lý người dùng",
          path: "/admin/users",
          icon: (
            <Users
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Quản lý vé",
          path: "/admin/tickets",
          icon: (
            <Tickets
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Quản lý đơn hàng",
          path: "/admin/orders",
          icon: (
            <ShoppingCart
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
      ];
    } else {
      // organizer
      return [
        {
          label: "Tổng quan",
          path: "/organizer/overview",
          icon: (
            <ChartLine
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Sự kiện của tôi",
          path: "/organizer/events",
          icon: (
            <CalendarRange
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Tạo sự kiện",
          path: "/organizer/create-event",
          icon: (
            <Plus
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
        {
          label: "Check-in",
          path: "/organizer/checkin",
          icon: (
            <ScanLine
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            />
          ),
        },
      ];
    }
  };

  const menuItems = getMenuItems();
  const title = role === "admin" ? "Admin" : "Organizer";

  const shortenRole = (role: string) => {
    switch (role) {
      case "Admin":
        return "Ad";
      case "Organizer":
        return "Org";
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const fetchUserProfile = React.useCallback(async () => {
    if (token) {
      try {
        const userData = await authService.getProfile();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <div>
            <img
              src="/ticket.png"
              alt="Ticketest Logo"
              className="aspect-square w-10 transition-transform duration-300 group-hover:rotate-12"
            />
          </div>
          <div className="flex items-baseline">
            <div
              className={`} text-2xl font-bold tracking-tight text-black transition-colors`}
            >
              TICKE
            </div>
            <div
              className={`} text-2xl font-black tracking-tight text-lime-600 transition-colors`}
            >
              TEST
            </div>
          </div>

          <div className="mt-1 rounded-md bg-lime-50 px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-lime-700 uppercase">
            {title}
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out will-change-[width]",
          // Mobile
          "md:hidden",
          isMobileMenuOpen ? "left-0" : "-left-full",
          "w-64",
          // Desktop
          "md:left-0 md:flex",
          isCollapsed ? "md:w-20" : "md:w-60",
        )}
      >
        <div className="relative flex flex-col items-center gap-2 border-b border-slate-100 p-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isCollapsed ? "justify-center" : "",
            )}
          >
            <div>
              <img
                src="/ticket.png"
                alt="Ticketest Logo"
                className="aspect-square w-10 min-w-10 transition-transform duration-300 group-hover:rotate-12"
              />
            </div>
            {!isCollapsed && (
              <div className="flex items-baseline">
                <div
                  className={`} text-2xl font-bold tracking-tight text-black transition-colors`}
                >
                  TICKE
                </div>
                <div
                  className={`} text-2xl font-black tracking-tight text-lime-600 transition-colors`}
                >
                  TEST
                </div>
              </div>
            )}
          </Link>

          {!isCollapsed ? (
            <div className="mt-1 rounded-md bg-lime-50 px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-lime-700 uppercase">
              {title} Dashboard
            </div>
          ) : (
            <div className="mt-1 rounded-md bg-lime-50 px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-lime-700 uppercase">
              {shortenRole(title)}
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-8 -right-3 hidden rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm hover:bg-slate-50 md:block"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-lime-600 text-white shadow-md shadow-lime-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-lime-600",
                  isCollapsed && "md:justify-center",
                )}
              >
                <div className="shrink-0">{item.icon}</div>
                <span
                  className={cn(
                    "whitespace-nowrap",
                    isCollapsed && "md:hidden",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {}

        <Link
          to="/profile"
          className={
            "flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm transition-all " +
            (isCollapsed ? "mx-auto max-w-fit" : "mx-4")
          }
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="rounded-full bg-lime-100 p-3 text-lime-600">
              <User size={10} />
            </div>
          )}
          {!isCollapsed && (
            <span className="mr-2 truncate text-sm font-medium text-slate-700 sm:block">
              {currentUser?.fullName || currentUser?.username || "Tài khoản"}
            </span>
          )}
        </Link>

        <div className="border-t border-slate-100 p-3">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-red-600 hover:bg-red-50 hover:text-red-700",
              isCollapsed ? "justify-center px-0" : "justify-start",
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <LogOut size={18} className={cn(isCollapsed ? "mr-0" : "mr-2")} />
            {!isCollapsed && "Đăng xuất"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-x-hidden p-4 transition-[margin-left] duration-300 ease-in-out will-change-[margin-left] contain-paint md:p-8",
          "pt-20 md:pt-8",
          isCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
