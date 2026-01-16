import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Edit,
  Send,
  Calendar,
  MapPin,
  LayoutGrid,
  List,
  Ban,
  Trash2,
  Search,
  Filter,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  eventService,
  categoryService,
  ticketTypeService,
  organizerBankService,
} from "../../services/api";
import type { Event } from "../../types";
import EventForm, { type TicketTypeInput } from "../../components/EventForm";
import Pagination from "../../components/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { EVENT_STATUS_BADGE_STYLE } from "@/lib/statusConstant";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrganizerEvents: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [submitDialog, setSubmitDialog] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [editWarningDialog, setEditWarningDialog] = useState<{
    open: boolean;
    event: Event | null;
  }>({ open: false, event: null });
  const [events, setEvents] = useState<Event[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchMyEvents = React.useCallback(async () => {
    try {
      const params: any = {
        page,
        limit: 9,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.categoryId = categoryFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await eventService.getMyEvents(params);
      setEvents(res.data);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    }
  }, [page, search, statusFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchMyEvents();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, categoryFilter, dateFrom, dateTo]);

  const handleEdit = async (event: Event) => {
    try {
      const res = await eventService.getOne(event.id);
      setEditingEvent(res.data);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Không thể lấy thông tin sự kiện");
    }
  };

  const handleSaveEvent = async (
    data: FormData,
    tickets: TicketTypeInput[],
  ) => {
    try {
      let savedEventId;

      // Xử lý thông tin ngân hàng nếu có
      const bankName = data.get("bankName") as string;
      const bankAccount = data.get("bankAccount") as string;

      if (bankName && bankAccount) {
        try {
          const bankRes = await organizerBankService.getAll();
          if (bankRes.data && bankRes.data.length > 0) {
            await organizerBankService.update(bankRes.data[0].id, {
              bankName,
              bankAccount,
            });
          } else {
            await organizerBankService.create({ bankName, bankAccount });
          }
        } catch (bankError) {
          console.error("Lỗi lưu thông tin ngân hàng:", bankError);
          // Không chặn việc lưu sự kiện nếu lỗi ngân hàng
        }
      }

      if (editingEvent) {
        await eventService.update(editingEvent.id, data);
        savedEventId = editingEvent.id;
      } else {
        const res = await eventService.create(data);
        savedEventId = res.data.id;
      }

      // Xử lý vé
      if (savedEventId && tickets.length > 0) {
        const ticketPromises = tickets.map((ticket) => {
          if (ticket.id) {
            return ticketTypeService.update(ticket.id, {
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              initialQuantity: ticket.initialQuantity,
              numPerOrder: ticket.numPerOrder,
              maxPerOrder: ticket.maxPerOrder,
            });
          } else {
            return ticketTypeService.create({
              eventId: savedEventId,
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              initialQuantity: ticket.initialQuantity,
              numPerOrder: ticket.numPerOrder,
              maxPerOrder: ticket.maxPerOrder,
            });
          }
        });
        await Promise.all(ticketPromises);
      }

      setModalOpen(false);
      fetchMyEvents();
      toast.success("Lưu thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleSubmitForApproval = async () => {
    if (!submitDialog.id) return;
    try {
      await eventService.submit(submitDialog.id);
      fetchMyEvents();
      toast.success("Đã gửi yêu cầu duyệt sự kiện!");
      setSubmitDialog({ open: false, id: null });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCancelEvent = async () => {
    if (!cancelDialog.id) return;
    try {
      await eventService.cancel(cancelDialog.id);
      fetchMyEvents();
      toast.success("Đã hủy sự kiện!");
      setCancelDialog({ open: false, id: null });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteDialog.id) return;
    try {
      await eventService.delete(deleteDialog.id);
      fetchMyEvents();
      toast.success("Đã xóa sự kiện!");
      setDeleteDialog({ open: false, id: null });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getLatestApprovalNote = (event: Event) => {
    if (!event.eventApprovals || event.eventApprovals.length === 0) return null;
    return [...event.eventApprovals].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện của tôi</h1>
          <p className="text-slate-500">Quản lý các sự kiện bạn tổ chức</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tên sự kiện..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">
                {EVENT_STATUS_BADGE_STYLE["Draft"].label}
              </SelectItem>
              <SelectItem value="pending">
                {EVENT_STATUS_BADGE_STYLE["Pending"].label}
              </SelectItem>
              <SelectItem value="published">
                {EVENT_STATUS_BADGE_STYLE["Published"].label}
              </SelectItem>
              <SelectItem value="rejected">
                {EVENT_STATUS_BADGE_STYLE["Rejected"].label}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Danh mục" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
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
              <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                className="pl-10"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đến ngày
            </label>
            <div className="relative">
              <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                className="pl-10"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <p className="mb-1 text-2xl font-medium text-slate-500">
            Bạn chưa có sự kiện nào.
          </p>
          <p className="text-sm text-slate-500">
            Hãy tạo sự kiện đầu tiên của bạn ngay bây giờ.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const latestApproval = getLatestApprovalNote(ev);
            return (
              <Card
                key={ev.id}
                className="flex h-full flex-col border-slate-200 transition-all hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <StatusBadge status={ev.status} type="event" />
                    <div className="flex gap-1">
                      {!["Pending", "Cancelled", "Ended"].includes(
                        ev.status,
                      ) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-lime-600"
                          onClick={() => {
                            if (
                              ["Published", "Unpublished"].includes(ev.status)
                            ) {
                              setEditWarningDialog({ open: true, event: ev });
                            } else {
                              handleEdit(ev);
                            }
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      {["Draft", "Rejected"].includes(ev.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-amber-600"
                          onClick={() =>
                            setSubmitDialog({ open: true, id: ev.id })
                          }
                        >
                          <Send size={16} />
                        </Button>
                      )}
                      {ev.status === "Published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() =>
                            setCancelDialog({ open: true, id: ev.id })
                          }
                        >
                          <Ban size={16} />
                        </Button>
                      )}
                      {["Draft", "Rejected"].includes(ev.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: ev.id })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-800">
                    {ev.title}
                  </h3>

                  {/* Approval Notes */}
                  {latestApproval && ev.status === "Rejected" && (
                    <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                      <span className="font-bold">Lý do từ chối:</span>{" "}
                      {latestApproval.note}
                    </div>
                  )}
                  {latestApproval &&
                    ev.status === "Published" &&
                    latestApproval.note && (
                      <div className="mb-3 rounded-lg border border-green-100 bg-green-50 p-3 text-xs text-green-700">
                        <span className="font-bold">Ghi chú:</span>{" "}
                        {latestApproval.note}
                      </div>
                    )}

                  <div className="mt-auto space-y-2 border-t border-slate-50 pt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-lime-500" />
                      <span>
                        {new Date(ev.startTime).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-lime-500" />
                      <span className="truncate">{ev.venueName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Sự kiện</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                        <img
                          src={
                            ev.bannerUrl ||
                            `https://placehold.co/300x300/68A61C/ffffff?text=${encodeURIComponent(
                              ev.title[0],
                            )}`
                          }
                          alt={ev.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-slate-900">
                        {ev.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(ev.startTime).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {ev.venueName}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ev.status} type="event" />
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={["Pending", "Cancelled", "Ended"].includes(
                        ev.status,
                      )}
                      onClick={() => {
                        if (["Published", "Unpublished"].includes(ev.status)) {
                          setEditWarningDialog({ open: true, event: ev });
                        } else {
                          handleEdit(ev);
                        }
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!["Draft", "Rejected"].includes(ev.status)}
                      onClick={() => setSubmitDialog({ open: true, id: ev.id })}
                    >
                      <Send size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={ev.status !== "Published"}
                      onClick={() => setCancelDialog({ open: true, id: ev.id })}
                    >
                      <Ban size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!["Draft", "Rejected"].includes(ev.status)}
                      onClick={() => setDeleteDialog({ open: true, id: ev.id })}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Cập nhật" : "Tạo mới"}</DialogTitle>
          </DialogHeader>
          <EventForm
            onClose={() => setModalOpen(false)}
            onSubmit={handleSaveEvent}
            initialData={editingEvent}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sự kiện</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sự kiện này vĩnh viễn? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit for Approval Dialog */}
      <AlertDialog
        open={submitDialog.open}
        onOpenChange={(open) => setSubmitDialog({ open, id: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi sự kiện để duyệt</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Sự kiện sẽ được gửi đến Admin để xem xét và phê duyệt. Trong
                thời gian chờ duyệt:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Bạn không thể chỉnh sửa thông tin sự kiện</li>
                <li>Sự kiện chưa được hiển thị công khai</li>
                <li>Admin có thể phê duyệt hoặc từ chối với ghi chú cụ thể</li>
              </ul>
              <p className="mt-2 font-medium text-slate-900">
                Bạn có chắc chắn muốn gửi duyệt?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitForApproval}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Gửi duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Event Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, id: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy sự kiện</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-medium text-red-600">
                ⚠️ Hành động này sẽ có những hậu quả sau:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Sự kiện sẽ bị hủy và không thể khôi phục</li>
                <li>Tất cả vé đã bán sẽ được hoàn tiền tự động</li>
                <li>Khách hàng sẽ nhận được thông báo qua email</li>
                <li>Sự kiện sẽ không còn hiển thị công khai</li>
              </ul>
              <p className="mt-2 font-medium text-slate-900">
                Bạn có chắc chắn muốn hủy sự kiện này?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              Có, hủy sự kiện
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Warning Dialog */}
      <AlertDialog
        open={editWarningDialog.open}
        onOpenChange={(open) => setEditWarningDialog({ open, event: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="mb-3 flex items-center justify-center gap-3 text-amber-600">
              <AlertTriangle className="h-10 w-10"></AlertTriangle>
              CẢNH BÁO: Chỉnh sửa sự kiện đã duyệt
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1 text-slate-700">
              <div className="text-md space-y-2">
                <div>
                  Sự kiện sẽ trở về trạng thái <b>CHỜ DUYỆT</b> và cần được
                  duyệt lại.
                </div>
                <div>
                  Trong thời gian đó, sự kiện sẽ không thể truy cập công khai,
                  mọi giao dịch mua vé sẽ tạm dừng. Vé đã bán sẽ chuyển sang
                  trạng thái <b>ĐÃ HỦY</b> nhưng sẽ tự kích hoạt lại nếu sự kiện
                  được duyệt.
                </div>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">
                Bạn có chắc chắn muốn tiếp tục chỉnh sửa?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (editWarningDialog.event) {
                  handleEdit(editWarningDialog.event);
                  setEditWarningDialog({ open: false, event: null });
                }
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Tiếp tục chỉnh sửa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizerEvents;
