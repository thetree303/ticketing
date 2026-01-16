import { useState, useEffect } from "react";
import { Search, Filter, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { orderService } from "@/services/api";
import type { AdminOrder, PaginatedResponse } from "@/types";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";
import { OrderDetailSheet } from "@/components/admin/OrderDetailSheet";

const AdminOrders = () => {
  const [orders, setOrders] = useState<PaginatedResponse<AdminOrder> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, statusFilter, dateFrom, dateTo]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await orderService.getAllForAdmin(params);
      setOrders(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetails = async (order: AdminOrder) => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(order.id);

      // Transform the data to match OrderDetailSheet interface
      const transformedOrder = {
        id: response.id,
        orderCode: response.id.toString(),
        customerName: order.customerName || "N/A",
        customerEmail: order.customerEmail || "N/A",
        customerPhone: response.purchaserPhone || "",
        eventName: order.eventTitle || "N/A",
        totalAmount: Number(order.totalAmount),
        platformFee: Number(response.platformFee || 0),
        netAmount:
          Number(order.totalAmount) - Number(response.platformFee || 0),
        status: order.status,
        paymentMethod: "VNPAY",
        createdAt: order.createdAt,
        tickets:
          response.tickets?.map((ticket: any) => ({
            id: ticket.id,
            ticketTypeName: ticket.ticketType?.name || "N/A",
            qrCode: ticket.qrCode,
            seatNumber: ticket.seatNumber,
            price: Number(ticket.price),
          })) || [],
        paymentHistory:
          response.transactions?.map((tx: any) => ({
            transactionId: tx.transactionId || tx.id,
            amount: Number(tx.amount),
            status: tx.status,
            timestamp: tx.createdAt,
            bankCode: tx.bankCode,
          })) || [],
      };

      setSelectedOrder(transformedOrder);
      setIsSheetOpen(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin chi tiết",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-slate-500">
            Quản lý tất cả đơn hàng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, email người dùng..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ thanh toán</SelectItem>
              <SelectItem value="Paid">Đã thanh toán</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
              <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-end gap-4 md:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Từ ngày
            </label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                className="pl-10"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đến ngày
            </label>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                className="pl-10"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <Button variant="outline" onClick={handleClearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Mã đơn</TableHead>
              <TableHead>Người mua</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-lime-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-slate-500"
                >
                  Không tìm thấy đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              orders?.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {order.customerName || "N/A"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.customerEmail || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {order.eventTitle || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {formatCurrency(Number(order.totalAmount))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} type="order" />
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="gap-2 hover:bg-lime-50 hover:text-lime-600"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {orders && orders.meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 md:flex-row">
            <div className="text-sm text-slate-500">
              Hiển thị{" "}
              <strong>
                {(orders.meta.currentPage - 1) * orders.meta.itemsPerPage + 1}-
                {Math.min(
                  orders.meta.currentPage * orders.meta.itemsPerPage,
                  orders.meta.totalItems,
                )}
              </strong>{" "}
              trên <strong>{orders.meta.totalItems}</strong> đơn hàng
            </div>
            <Pagination
              currentPage={page}
              totalPages={orders.meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
};

export default AdminOrders;
