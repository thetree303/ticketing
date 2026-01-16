import React, { useEffect, useState } from "react";
import { DollarSign, Ticket } from "lucide-react";
import { statsService } from "../../services/api";
import { StatCard } from "../../components/dashboard/StatCard";
import { RevenueBarChart } from "../../components/dashboard/RevenueBarChart";
import { TopEventsList } from "../../components/dashboard/TopEventsList";
import { NextEventCard } from "../../components/dashboard/NextEventCard";
import { EventPerformanceTable } from "../../components/dashboard/EventPerformanceTable";
import { LoyalCustomersLeaderboard } from "../../components/dashboard/LoyalCustomersLeaderboard";
import { EventComparisonChart } from "../../components/dashboard/EventComparisonChart";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/ui/export-button";
import {
  type LoyalCustomer,
  type EventComparison,
  type EventPerformance,
} from "../../types";

interface OrganizerStats {
  totalRevenue: number;
  totalTicketsSold: number;
  todayTicketsSold: number;
  totalEvents: number;
}

const OrganizerOverview: React.FC = () => {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>(
    [],
  );
  const [loyalCustomers, setLoyalCustomers] = useState<LoyalCustomer[]>([]);
  const [comparisonData, setComparisonData] = useState<EventComparison[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          statsRes,
          chartRes,
          topEventsRes,
          nextEventRes,
          performanceRes,
          loyalCustomersRes,
          comparisonRes,
        ] = await Promise.all([
          statsService.getOrganizerStats(),
          statsService.getOrganizerRevenueChart(),
          statsService.getOrganizerTopEvents(5).catch(() => []),
          statsService.getOrganizerNextEvent().catch(() => null),
          statsService.getOrganizerEventPerformance().catch(() => []),
          statsService.getOrganizerLoyalCustomers(5).catch(() => []),
          statsService.getOrganizerEventComparison().catch(() => []),
        ]);

        setStats(statsRes);
        setChartData(chartRes);
        setTopEvents(topEventsRes);
        setNextEvent(nextEventRes);
        setEventPerformance(performanceRes);
        setLoyalCustomers(loyalCustomersRes);
        setComparisonData(comparisonRes);
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
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-slate-500">Hiệu suất bán vé và doanh thu</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <Skeleton className="h-[400px] w-full" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>

        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-slate-500">Hiệu suất bán vé và doanh thu</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton
            data={topEvents.map((event) => ({
              "Tên sự kiện": event.name,
              "Vé đã bán": event.ticketsSold,
              "Doanh thu": event.revenue,
              "Doanh thu thực": event.netRevenue,
            }))}
            filename="su-kien-hang-dau"
            sheetName="TopEvents"
            size="sm"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Doanh thu thực nhận"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend="+12%"
          trendUp={true}
          description="Sau khi trừ phí"
        />

        <StatCard
          title="Vé đã bán hôm nay"
          value={(stats?.todayTicketsSold || 0).toLocaleString()}
          icon={Ticket}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          description={`Tổng: ${stats?.totalTicketsSold || 0} vé`}
        />

        <NextEventCard event={nextEvent} />
      </div>

      {/* Revenue Chart */}
      <RevenueBarChart data={chartData} title="Doanh thu 7 ngày gần nhất" />

      {/* Event Performance Table */}
      <EventPerformanceTable events={eventPerformance} />

      {/* Event Comparison Chart */}
      <EventComparisonChart events={comparisonData} />

      {/* Top Events and Loyal Customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopEventsList data={topEvents} />
        <LoyalCustomersLeaderboard data={loyalCustomers} />
      </div>
    </div>
  );
};

export default OrganizerOverview;
