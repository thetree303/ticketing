import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  MapPinned,
  Search,
  Eye,
  User,
  Mail,
  Phone,
  CreditCard,
  Hash,
  Armchair,
  FileDown,
  EyeOff,
  CalendarCheck,
} from "lucide-react";
import { ticketService } from "../../services/api";
import type { PaginationMeta } from "../../types";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { pdf } from "@react-pdf/renderer";
import TicketPDF from "../../components/TicketPDF";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { type TicketStatus, type OrderStatus } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Interface ---
interface TicketDetail {
  id: number;
  uniqueCode: string;
  status: TicketStatus;
  seatNumber?: string;
  purchasedAt: string;
  ticketType: {
    name: string;
    price: string | number;
  };
  event: {
    title: string;
    startTime: string;
    venueName?: string;
    venueAddress?: string;
    bannerUrl?: string;
  };
  order: {
    id: number;
    status: OrderStatus;
  };
  purchaser: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  qrCodeUrl?: string;
}

// --- Component con: QRCodeDisplay (Để tạo QR code client-side) ---
const QRCodeDisplay: React.FC<{
  text: string;
  size?: number;
  isRevealed: boolean;
}> = ({ text, size = 160, isRevealed }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, {
        width: size * 2,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [text, size]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl bg-white p-3 shadow-md">
      {qrDataUrl ? (
        <>
          <img
            src={qrDataUrl}
            alt="QR"
            style={{ width: size, height: size }}
            className={`object-contain transition-all duration-500 ${
              isRevealed ? "blur-0 opacity-100" : "opacity-30 blur-md"
            }`}
          />
          {!isRevealed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <EyeOff size={size / 5} className="mb-2" />
            </div>
          )}
        </>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-lg bg-slate-100"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

// --- Component con: TicketItem (Để quản lý state ẩn/hiện từng vé) ---
const TicketItem: React.FC<{
  ticket: TicketDetail;
  onOpenDetail: (ticket: TicketDetail) => void;
}> = ({ ticket, onOpenDetail }) => {
  const [isRevealed, setIsRevealed] = useState(false); // State ẩn/hiện mã

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex flex-col lg:flex-row">
        {/* QR Section - Có tính năng Click để hiện */}
        <div
          onClick={() => setIsRevealed(!isRevealed)}
          className="flex cursor-pointer flex-col items-center justify-center border-r border-slate-200 bg-linear-to-br from-lime-50 to-purple-50 p-6 transition-colors select-none hover:bg-lime-100/50 lg:w-72"
          title="Nhấn để hiện/ẩn mã QR"
        >
          <QRCodeDisplay
            text={ticket.uniqueCode}
            size={160}
            isRevealed={isRevealed}
          />
          <div className="text-center">
            <p className="mb-1 text-xs text-slate-500">Mã vé</p>
            <p className="h-6 font-mono text-sm font-bold tracking-wider text-lime-600">
              {isRevealed ? ticket.uniqueCode : "••••••••••••"}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="mb-1 line-clamp-1 text-xl font-bold text-slate-900">
                {ticket.event.title}
              </h3>
              <p className="mb-4 text-sm text-slate-500">
                {`Hạng vé: ${ticket.ticketType.name}`}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="mb-2 text-2xl font-bold text-lime-600">
                {Number(ticket.ticketType.price).toLocaleString("vi-VN")} đ
              </p>
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <StatusBadge status={ticket.status} type="ticket" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-6 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-50">
                <Calendar size={18} className="text-lime-600" />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-500">Thời gian</p>
                <p className="text-sm font-semibold">
                  {new Date(ticket.event.startTime).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {ticket.event.venueName ? (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-slate-500">Địa điểm</p>
                  <p className="text-sm font-semibold">
                    {ticket.event.venueName}
                  </p>
                </div>
              </div>
            ) : (
              <div></div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <User size={18} className="text-green-600" />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-500">Người mua</p>
                <p className="text-sm font-semibold">
                  {ticket.purchaser.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                <CalendarCheck size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-500">Ngày mua</p>
                <p className="text-sm font-semibold">
                  {new Date(ticket.purchasedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenDetail(ticket)}
              className="border-lime-200 bg-lime-50 text-lime-700 hover:bg-lime-100"
            >
              <Eye size={16} className="mr-2" /> Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component Chính: MyTickets ---
const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // State cho Modal chi tiết
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isModalCodeRevealed, setIsModalCodeRevealed] = useState(false); // State ẩn/hiện mã trong Modal

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("purchasedAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getMyTickets({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });

      const data = Array.isArray(response?.data) ? response.data : [];
      setTickets(data);
      setMeta(response?.meta ?? null);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPage(1);
  };

  const handleOpenDetail = (ticket: TicketDetail) => {
    setSelectedTicket(ticket);
    setIsModalCodeRevealed(false); // Reset trạng thái ẩn mã khi mở modal mới
    setIsModalOpen(true);
  };

  const handleExportPDF = async () => {
    if (!selectedTicket) return;
    setIsExporting(true);

    try {
      // Generate QR code from uniqueCode
      const qrCodeDataUrl = await QRCode.toDataURL(selectedTicket.uniqueCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const blob = await pdf(
        <TicketPDF ticket={selectedTicket} qrCodeDataUrl={qrCodeDataUrl} />,
      ).toBlob();
      saveAs(blob, `ticket-${selectedTicket.uniqueCode}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      alert("Không thể xuất PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Vé của tôi</h1>
          <p className="mt-2 text-slate-500">
            Quản lý và theo dõi các vé sự kiện bạn đã mua
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Tìm mã vé, tên sự kiện..."
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
            <SelectTrigger className="w-full border-slate-200 bg-white shadow-sm lg:w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Active">Có hiệu lực</SelectItem>
              <SelectItem value="Used">Đã sử dụng</SelectItem>
              <SelectItem value="Expired">Hết hạn</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
              <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}_${sortOrder}`}
            onValueChange={(value) => {
              const [k, v] = value.split("_");
              setSortBy(k);
              setSortOrder((v as "ASC" | "DESC") || "DESC");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-slate-200 bg-white shadow-sm lg:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchasedAt_DESC">Mua gần đây</SelectItem>
              <SelectItem value="purchasedAt_ASC">Mua lâu nhất</SelectItem>
              <SelectItem value="eventStartTime_ASC">
                Sự kiện mới nhất
              </SelectItem>
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
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-lime-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Ticket className="mx-auto mb-4 text-slate-300" size={64} />
            <p className="mb-2 text-lg font-medium text-slate-600">
              {searchTerm || statusFilter
                ? "Không tìm thấy vé nào phù hợp"
                : "Bạn chưa có vé nào"}
            </p>
            {searchTerm || statusFilter ? (
              <Button
                variant="link"
                onClick={clearFilters}
                className="text-lime-600 hover:text-lime-800"
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button asChild className="mt-4 bg-lime-600 hover:bg-lime-700">
                <Link to="/events">Khám phá sự kiện ngay</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}

        {/* Pagination Bottom */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* --- MODAL CHI TIẾT VÉ --- */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Chi tiết vé điện tử"
        >
          {selectedTicket && (
            <div className="space-y-6">
              <div className="rounded-xl bg-white p-2">
                {/* Header Modal - CÓ TÍNH NĂNG ẨN/HIỆN QR */}
                <div className="mb-6 flex items-center gap-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div
                    onClick={() => setIsModalCodeRevealed(!isModalCodeRevealed)}
                    className="cursor-pointer"
                    title="Nhấn để hiện/ẩn mã QR"
                  >
                    <QRCodeDisplay
                      text={selectedTicket.uniqueCode}
                      size={120}
                      isRevealed={isModalCodeRevealed}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {selectedTicket.event.title}
                    </h3>
                    <div
                      onClick={() =>
                        setIsModalCodeRevealed(!isModalCodeRevealed)
                      }
                      className="mt-1 inline-block cursor-pointer"
                    >
                      <p className="font-mono text-sm font-bold text-lime-600">
                        {isModalCodeRevealed
                          ? selectedTicket.uniqueCode
                          : "••••••••••••"}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <StatusBadge
                        status={selectedTicket.status}
                        type="ticket"
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin vé */}
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                    <Ticket size={16} /> Thông tin vé
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Loại vé</p>
                      <p className="text-sm font-semibold">
                        {selectedTicket.ticketType.name}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Tổng giá</p>
                      <p className="text-sm font-semibold text-lime-600">
                        {parseFloat(
                          selectedTicket.ticketType.price.toString(),
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </p>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-50 pt-2">
                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Số lượng vé
                        </p>
                        <p className="text-sm text-slate-600">1 vé</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-slate-500">Đơn giá</p>
                        <p className="text-sm text-slate-600">
                          {parseFloat(
                            selectedTicket.ticketType.price.toString(),
                          ).toLocaleString("vi-VN")}{" "}
                          đ/vé
                        </p>
                      </div>
                    </div>

                    {selectedTicket.seatNumber && (
                      <div className="col-span-2 flex items-center gap-2 border-t border-slate-50 pt-2">
                        <Armchair size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Vị trí ghế:{" "}
                          <strong className="text-slate-900">
                            {selectedTicket.seatNumber}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin sự kiện */}
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                    <Calendar size={16} /> Thông tin sự kiện
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="mt-0.5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Thời gian bắt đầu
                        </p>
                        <p className="text-md font-bold">
                          {new Date(
                            selectedTicket.event.startTime,
                          ).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(
                            selectedTicket.event.startTime,
                          ).toLocaleDateString("vi-VN", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {(selectedTicket.event.venueName ||
                      selectedTicket.event.venueAddress) && (
                      <div className="flex items-start gap-3">
                        <MapPinned
                          size={18}
                          className="mt-0.5 text-slate-400"
                        />
                        <div>
                          <p className="text-xs text-slate-500">
                            Địa điểm tổ chức
                          </p>
                          <p className="text-md font-bold">
                            {selectedTicket.event.venueName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {selectedTicket.event.venueAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin đơn hàng & Người mua */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                    <User size={16} /> Thông tin đơn hàng
                  </h4>
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
                      <div>
                        <p className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                          <Hash size={12} /> Mã đơn hàng
                        </p>
                        <Link
                          to="/orders"
                          className="font-mono text-sm text-lime-600 hover:underline"
                        >
                          #{selectedTicket.order.id}
                        </Link>
                      </div>
                      <div>
                        <p className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                          <CreditCard size={12} /> Ngày mua
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(
                            selectedTicket.purchasedAt,
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="flex grid grid-cols-2 items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <User size={14} /> Họ tên:
                        </span>
                        <span className="text-sm font-semibold">
                          {selectedTicket.purchaser.fullName}
                        </span>
                      </div>
                      <div className="flex grid grid-cols-2 items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail size={14} /> Email:
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedTicket.purchaser.email}
                        </span>
                      </div>
                      <div className="flex grid grid-cols-2 items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <Phone size={14} /> SĐT:
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedTicket.purchaser.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Đóng
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <FileDown size={16} />
                      Xuất PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyTickets;
