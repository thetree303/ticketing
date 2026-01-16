import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import { eventService, categoryService } from "../../services/api";
import type { AdminEvent, PaginatedResponse, EventStatus } from "../../types";
import Pagination from "../../components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { EVENT_STATUS_BADGE_STYLE } from "@/lib/statusConstant";

const AdminEvents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<AdminEvent> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    const paramStatus = searchParams.get("status");
    console.log("Param status:", paramStatus);
    if (paramStatus) {
      const normalizedStatus =
        paramStatus.charAt(0).toUpperCase() +
        paramStatus.slice(1).toLowerCase();
      if (
        normalizedStatus === "Pending" ||
        normalizedStatus === "Published" ||
        normalizedStatus === "Rejected" ||
        normalizedStatus === "Draft"
      ) {
        setStatus(normalizedStatus);
      }
    } else {
      setStatus("all");
    }
  }, [searchParams]);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    try {
      const statusParam =
        status === "all" ? undefined : (status as EventStatus);
      const categoryParam =
        categoryFilter === "all" ? undefined : Number(categoryFilter);
      const res = await eventService.getAllForAdmin({
        page,
        limit: 10,
        search,
        categoryId: categoryParam,
        startDate: undefined,
        status: statusParam,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, categoryFilter, dateFrom, dateTo]);

  const openActionModal = (type: "approve" | "reject", id: number) => {
    setActionType(type);
    setSelectedEventId(id);
    setActionNote("");
    setIsActionOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedEventId || !actionType) return;
    try {
      if (actionType === "approve") {
        await eventService.approve(selectedEventId, actionNote);
      } else {
        if (!actionNote.trim()) {
          alert("Vui lòng nhập lý do từ chối!");
          return;
        }
        await eventService.reject(selectedEventId, actionNote);
      }
      setIsActionOpen(false);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý sự kiện</h1>
        <p className="text-slate-500">
          Duyệt và kiểm soát các sự kiện trên hệ thống
        </p>
      </div>

      {/* Filter Bar - enhanced */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm sự kiện..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(EVENT_STATUS_BADGE_STYLE).map(
                  ([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <CalendarIcon size={16} className="text-slate-500" />
            <span className="text-sm text-slate-600">Từ ngày:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-[160px]"
            />
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <span className="text-sm text-slate-600">Đến ngày:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-[160px]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              className="text-slate-600"
            >
              Xóa bộ lọc ngày
            </Button>
          )}
        </div>
      </div>

      {/* Table - giống UserManagement */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>ID</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Nhà tổ chức</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="text-slate-500">Đang tải...</div>
                </TableCell>
              </TableRow>
            ) : data && data.data.length > 0 ? (
              data.data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono font-medium">
                    {event.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                        <img
                          src={
                            event.bannerUrl ||
                            `https://placehold.co/300x300/68A61C/ffffff?text=${encodeURIComponent(
                              event.title[0],
                            )}`
                          }
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="line-clamp-1 font-semibold text-slate-900">
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {event.venueName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {event.organizerName || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {new Date(event.startTime).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {new Date(event.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={event.status as EventStatus}
                      type="event"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to={`/events/${event.id}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      {event.status === "Pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionModal("approve", event.id)}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionModal("reject", event.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <div className="text-slate-500">Không có sự kiện nào</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row">
            <div className="text-sm text-slate-500">
              Hiển thị{" "}
              <strong>
                {(data.meta.currentPage - 1) * data.meta.itemsPerPage + 1}-
                {Math.min(
                  data.meta.currentPage * data.meta.itemsPerPage,
                  data.meta.totalItems,
                )}
              </strong>{" "}
              trên <strong>{data.meta.totalItems}</strong> sự kiện
            </div>
            <Pagination
              currentPage={page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Phê duyệt sự kiện"
                : "Từ chối sự kiện"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Sự kiện sẽ được công khai cho người dùng."
                : "Sự kiện sẽ bị trả về và yêu cầu chỉnh sửa."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder={
                actionType === "approve"
                  ? "Ghi chú (tùy chọn)..."
                  : "Lý do từ chối (bắt buộc)..."
              }
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleActionSubmit}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
