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
import { ticketService, eventService } from "@/services/api";
import type { AdminTicket, PaginatedResponse, AdminEvent } from "@/types";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";
import { TicketDetailSheet } from "@/components/admin/TicketDetailSheet";

const AdminTickets = () => {
  const [tickets, setTickets] = useState<PaginatedResponse<AdminTicket> | null>(
    null,
  );
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [page, limit, search, statusFilter, eventFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAllForAdmin({
        page: 1,
        limit: 100,
        status: "Published",
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (eventFilter !== "all") params.eventId = eventFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await ticketService.getAllForAdmin(params);
      setTickets(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách vé",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setEventFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleViewDetails = (ticket: AdminTicket) => {
    // Transform the ticket data to match TicketDetailSheet interface
    const transformedTicket = {
      id: ticket.id,
      ticketTypeName: ticket.ticketTypeName || "N/A",
      price: Number(ticket.price || 0),
      seatNumber: ticket.seatNumber,
      customerName: ticket.customerName || "N/A",
      customerEmail: ticket.customerEmail || "N/A",
      eventName: ticket.eventTitle || "N/A",
      eventDate: (ticket as any).eventDate || new Date().toISOString(),
      venueName: (ticket as any).venueName || "N/A",
      venueAddress: (ticket as any).venueAddress || "N/A",
      orderCode: (ticket as any).orderId?.toString() || "N/A",
      purchaseDate: (ticket as any).purchasedAt || "N/A",
      status: ticket.status,
      checkinTime: (ticket as any).checkinTime || undefined,
    };

    setSelectedTicket(transformedTicket);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý vé</h1>
          <p className="mt-1 text-slate-500">
            Quản lý tất cả vé trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo ID, mã vé, tên sự kiện..."
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
              <SelectItem value="Active">Hợp lệ</SelectItem>
              <SelectItem value="Used">Đã sử dụng</SelectItem>
              <SelectItem value="Expired">Hết hạn</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={eventFilter}
            onValueChange={(val) => {
              setEventFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Sự kiện" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sự kiện</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
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
              <TableHead>ID</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Loại vé</TableHead>
              <TableHead>Người mua</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày mua</TableHead>
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
            ) : tickets?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-slate-500"
                >
                  Không tìm thấy vé nào.
                </TableCell>
              </TableRow>
            ) : (
              tickets?.data.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono font-medium">
                    {ticket.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {ticket.eventTitle || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {ticket.ticketTypeName || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {ticket.customerName || "N/A"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {ticket.customerEmail || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date((ticket as any).purchasedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(ticket)}
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
        {tickets && tickets.meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 md:flex-row">
            <div className="text-sm text-slate-500">
              Hiển thị{" "}
              <strong>
                {(tickets.meta.currentPage - 1) * tickets.meta.itemsPerPage + 1}
                -
                {Math.min(
                  tickets.meta.currentPage * tickets.meta.itemsPerPage,
                  tickets.meta.totalItems,
                )}
              </strong>{" "}
              trên <strong>{tickets.meta.totalItems}</strong> vé
            </div>
            <Pagination
              currentPage={page}
              totalPages={tickets.meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <TicketDetailSheet
        ticket={selectedTicket}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
};

export default AdminTickets;
