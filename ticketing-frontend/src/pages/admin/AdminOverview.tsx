import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  Ticket,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { statsService, eventService } from "../../services/api";
import { StatCard } from "../../components/dashboard/StatCard";
import { RevenueAreaChart } from "../../components/dashboard/RevenueAreaChart";
import { OrderStatusChart } from "../../components/dashboard/OrderStatusChart";
import { RecentTransactions } from "../../components/dashboard/RecentTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoyalCustomersLeaderboard } from "@/components/dashboard/LoyalCustomersLeaderboard";
import { TopEventsList } from "@/components/dashboard/TopEventsList";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  activeEvents: number;
  revenueGrowth?: number;
}

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [pendingEventsCount, setPendingEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [loyalCustomers, setLoyalCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          statsRes,
          revenueRes,
          orderStatusRes,
          transactionsRes,
          pendingRes,
          topEventsRes,
          loyalCustomersRes,
        ] = await Promise.all([
          statsService.getAdminStats(),
          statsService.getAdminRevenueChart().catch(() => []),
          statsService.getAdminOrderStatusStats().catch(() => []),
          statsService.getRecentTransactions(5).catch(() => []),
          eventService
            .getAllForAdmin({ status: "Pending", limit: 1 })
            .catch(() => ({ meta: { totalItems: 0 } })),
          statsService.getTopEvents(5).catch(() => []), // <--- Gọi API Top Events
          statsService.getLoyalCustomers(5).catch(() => []), // <--- Gọi API Loyal Customers
        ]);

        setStats(statsRes);
        setRevenueData(revenueRes);
        setOrderStatusData(orderStatusRes);
        setRecentTransactions(transactionsRes);
        setPendingEventsCount(pendingRes?.meta?.totalItems || 0);
        setTopEvents(topEventsRes); // <--- Set State
        setLoyalCustomers(loyalCustomersRes); // <--- Set State
      } catch (e) {
        console.error("Lỗi tải dữ liệu:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-500">
            Xem nhanh các chỉ số chính của hệ thống
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>

        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-500">
            Xem nhanh các chỉ số chính của hệ thống
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Sự kiện chờ duyệt"
          value={pendingEventsCount}
          icon={CheckCircle2}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          description={
            pendingEventsCount > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full border-0 bg-amber-400/20 text-black hover:bg-amber-400/30"
                onClick={() => navigate("/admin/events?status=Pending")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Duyệt ngay
              </Button>
            ) : (
              <div className="text-xs font-medium text-green-600">
                Tuyệt vời! Bạn không có sự kiện nào chờ duyệt
              </div>
            )
          }
        />

        <StatCard
          title="Tổng Doanh thu"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend={
            stats?.revenueGrowth
              ? `${stats.revenueGrowth > 0 ? "+" : ""}${
                  stats.revenueGrowth
                }% so với tháng trước`
              : "+12% so với tháng trước"
          }
          trendUp={(stats?.revenueGrowth || 12) > 0}
        />

        <StatCard
          title="Tổng Người dùng"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={Users}
          iconColor="text-lime-600"
          iconBgColor="bg-lime-50"
          description={`Đang hoạt động: ${stats?.totalUsers || 0} người dùng`}
        />

        <StatCard
          title="Sự kiện đang hoạt động"
          value={(stats?.activeEvents || 0).toLocaleString()}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          description={`Tổng: ${stats?.totalEvents || 0} sự kiện`}
        />

        <StatCard
          title="Tổng vé đã bán"
          value={(stats?.totalTicketsSold || 0).toLocaleString()}
          icon={Ticket}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueAreaChart
            data={revenueData}
            title="Doanh thu hệ thống trong 30 ngày qua"
          />
        </div>

        <div className="lg:col-span-1">
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopEventsList data={topEvents} />
        <LoyalCustomersLeaderboard data={loyalCustomers} />
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
};

export default AdminOverview;
