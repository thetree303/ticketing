import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Ticket, User, LogOut, ShoppingBag } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { authService } from "@/services/api";
import type { User as UserType } from "@/types";
import { PROFILE_UPDATED_EVENT } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, clearAuth, hasRole } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setCurrentUser(userData);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };
    fetchUserProfile();
    window.addEventListener(PROFILE_UPDATED_EVENT, fetchUserProfile);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, fetchUserProfile);
    };
  }, [token]);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const isDashboard =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/organizer");

  if (isDashboard) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const navLinkClass = (path: string) => `
    relative px-3 py-2 text-sm font-medium transition-colors duration-300
    ${
      location.pathname === path
        ? "text-lime-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-lime-600"
        : "text-slate-600 hover:text-lime-600"
    }
  `;

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header: z-50 để thấp hơn Modal (z-100) */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 py-1 shadow-sm backdrop-blur-md"
            : "bg-transparent py-3"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="group flex items-center justify-center">
              <div>
                <img
                  src="/ticket.png"
                  alt="Ticketest Logo"
                  className="aspect-square w-15 p-2 transition-transform duration-300 group-hover:rotate-20"
                />
              </div>
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
            </Link>

            {/* Nav Links */}
            <nav className="hidden items-center gap-6 rounded-full border border-white/20 bg-white/80 px-6 py-2 shadow-sm backdrop-blur-sm md:flex">
              <Link to="/home" className={navLinkClass("/home")}>
                Trang chủ
              </Link>
              <Link to="/events" className={navLinkClass("/events")}>
                Sự kiện
              </Link>
              {hasRole(["organizer"]) && (
                <Link to="/organizer" className={navLinkClass("/organizer")}>
                  Trang Ban tổ chức
                </Link>
              )}
              {hasRole(["admin"]) && (
                <Link to="/admin" className={navLinkClass("/admin")}>
                  Trang Quản trị viên
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {token ? (
                <div className="group relative">
                  <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:border-lime-300">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt="Avatar"
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="rounded-full bg-lime-100 p-1 text-lime-600">
                        <User size={18} />
                      </div>
                    )}
                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block">
                      {currentUser?.fullName ||
                        currentUser?.username ||
                        "Tài khoản"}
                    </span>
                  </button>
                  <div className="invisible absolute right-0 z-50 mt-2 w-56 origin-top-right transform rounded-xl border border-slate-100 bg-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                    <div className="flex flex-col gap-y-1 p-2">
                      {hasRole(["customer"]) && (
                        <Link
                          to="/tickets"
                          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-lime-600 hover:text-white"
                        >
                          <Ticket size={16} /> Vé của tôi
                        </Link>
                      )}
                      {hasRole(["customer"]) && (
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-lime-600 hover:text-white"
                        >
                          <ShoppingBag size={16} /> Đơn hàng của tôi
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-lime-600 hover:text-white"
                      >
                        <User size={16} /> Hồ sơ cá nhân
                      </Link>

                      <button
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-full bg-white/50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-lime-600"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="transform rounded-full bg-lime-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-lime-200 transition-all hover:-translate-y-0.5 hover:bg-lime-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: pt-20 để đẩy nội dung xuống dưới Header cố định */}
      <main className="flex-grow pt-20">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-12 text-slate-300">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-white">
            <Ticket className="h-6 w-6" />
            <span className="text-xl font-bold">TICKETEST</span>
          </div>
          <p className="mx-auto mb-8 max-w-md text-sm text-slate-400">
            Nền tảng đặt vé sự kiện trực tuyến. <br /> Kết nối đam mê, lan tỏa
            cảm xúc.
          </p>
          <div className="border-t border-slate-800 pt-8 text-xs text-slate-500">
            Copyright © {new Date().getFullYear()} TICKETEST
          </div>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default Layout;
