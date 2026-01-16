import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, CreditCard, Search } from "lucide-react";
import { orderService } from "../../services/api";
import type { CustomerOrder, PaginationMeta } from "../../types";
import Pagination from "../../components/Pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sortBy: "createdAt",
        sortOrder: "DESC",
      });
      // Kiểm tra cấu trúc response trả về từ backend
      const data = response?.data ? response.data : [];
      setOrders(data);
      setMeta(response?.meta || null);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Đơn hàng của tôi
          </h1>
          <p className="mt-2 text-slate-500">
            Quản lý lịch sử mua vé và trạng thái đơn hàng
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1 lg:max-w-md">
            <Search
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Tìm theo mã đơn, tên sự kiện..."
              className="border-slate-200 bg-white pl-10 shadow-sm focus-visible:ring-lime-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-slate-200 bg-white shadow-sm lg:w-[200px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Paid">Đã thanh toán</SelectItem>
              <SelectItem value="Pending">Chờ thanh toán</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-slate-200 bg-white shadow-sm lg:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / trang</SelectItem>
              <SelectItem value="10">10 / trang</SelectItem>
              <SelectItem value="20">20 / trang</SelectItem>
              <SelectItem value="50">50 / trang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-lime-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 text-slate-300" size={64} />
            <p className="text-lg font-medium text-slate-600">
              Bạn chưa có đơn hàng nào
            </p>
            <Link
              to="/events"
              className="mt-4 inline-block font-semibold text-lime-600 hover:underline"
            >
              Đặt vé ngay &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="rounded-xl transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-sm text-slate-500">
                          #{order.id}
                        </span>
                        <StatusBadge status={order.status} type="order" />
                        <span className="text-xs text-slate-400">
                          • {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-slate-900">
                        {order.eventTitle || "Sự kiện không còn tồn tại"}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <CreditCard size={16} className="text-lime-600" />
                          {Number(order.totalAmount).toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- PHÂN TRANG Ở CUỐI --- */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
