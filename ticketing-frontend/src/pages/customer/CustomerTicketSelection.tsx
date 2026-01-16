import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  ShoppingCart,
  Map as MapIcon,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { eventService, orderService } from "../../services/api";
import type { Event } from "../../types";
import { Button } from "@/components/ui/button";
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
import type { TicketType } from "../../types";

const TicketSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const res = await eventService.getOne(parseInt(id));
          setEvent(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
        alert("Không tìm thấy sự kiện hoặc sự kiện đã kết thúc.");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleQuantityChange = (ticketTypeId: number, delta: number) => {
    setSelectedTickets((prev) => {
      // 1. Kiểm tra xem có đang chọn vé khác không
      const activeTicketIdStr = Object.keys(prev)[0];
      if (activeTicketIdStr && parseInt(activeTicketIdStr) !== ticketTypeId) {
        return prev;
      }
      // 2. Tính toán
      const current = prev[ticketTypeId] || 0;
      const newValue = Math.max(0, current + delta);

      // 3. Validate
      const ticketType = event?.ticketTypes.find((t) => t.id === ticketTypeId);
      if (ticketType) {
        const available = ticketType.initialQuantity - ticketType.soldQuantity;
        const maxLimit = ticketType.maxPerOrder || 10;
        if (delta > 0) {
          if (newValue > available) return prev;
          if (newValue > maxLimit) return prev;
        }
      }

      if (newValue === 0) return {};
      return { [ticketTypeId]: newValue };
    });
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return Object.entries(selectedTickets).reduce(
      (sum, [ticketTypeId, qty]) => {
        const ticketType = event.ticketTypes.find(
          (t: TicketType) => t.id === parseInt(ticketTypeId),
        );
        return (
          sum + (ticketType ? parseFloat(ticketType.price.toString()) * qty : 0)
        );
      },
      0,
    );
  };

  // Hàm xử lý giữ vé trước khi chuyển trang
  const handleProceedToCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục!");
      navigate("/login", { state: { from: `/events/${id}/book` } });
      return;
    }

    if (Object.keys(selectedTickets).length === 0) {
      alert("Vui lòng chọn vé!");
      return;
    }

    // Validate Min Per Order
    for (const [typeIdStr, qty] of Object.entries(selectedTickets)) {
      const typeId = parseInt(typeIdStr);
      const ticketType = event?.ticketTypes.find((t) => t.id === typeId);
      if (ticketType) {
        const numPerOrder = ticketType.numPerOrder || 1;
        if (qty < numPerOrder) {
          alert(
            `Loại vé "${ticketType.name}" yêu cầu mua bội số của ${numPerOrder} vé mỗi đơn hàng.`,
          );
          return;
        }
      }
    }

    setShowConfirmDialog(true);
  };

  const performCheckout = async () => {
    // --- BẮT ĐẦU GIỮ VÉ (CALL API) ---
    setIsReserving(true);
    try {
      const items = Object.entries(selectedTickets).map(
        ([ticketTypeId, quantity]) => ({
          ticketTypeId: parseInt(ticketTypeId),
          quantity: quantity as number,
        }),
      );

      // Gọi API Create Order -> Backend sẽ trừ kho và set trạng thái Reserved/Pending
      if (!event) throw new Error("Sự kiện không tồn tại");
      const res = await orderService.createOrder(event.id, items);
      const orderId = res.id;

      // Chuyển sang Checkout kèm orderId
      navigate("/checkout", {
        state: {
          event,
          selectedTickets,
          orderId,
          reservedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Không thể giữ vé lúc này.";
      alert(`Lỗi giữ vé: ${msg}`);
      // Nếu lỗi (ví dụ hết vé), ở lại trang này để khách chọn lại
    } finally {
      setIsReserving(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-lime-600"></div>
      </div>
    );
  if (!event) return null;

  const hasSelection = Object.keys(selectedTickets).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      {/* ... (Phần giao diện bên trên giữ nguyên) ... */}

      <div className="mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/events/${event.id}`)}
          className="mb-2 pl-0 hover:bg-transparent hover:text-lime-600"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại
        </Button>

        <div>
          <div className="mb-8 flex flex-col items-center justify-center gap-x-4 gap-y-2 md:flex-row md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Chọn hạng vé
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* ... (Giữ nguyên danh sách vé) ... */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MapIcon size={32} />
              </div>
              <h3 className="font-semibold text-slate-700">Sơ đồ ghế ngồi</h3>
              <p className="text-sm text-slate-500">
                Tính năng chọn ghế trên sơ đồ đang được phát triển.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {event.ticketTypes?.map((ticketType) => {
                  const available =
                    ticketType.initialQuantity - ticketType.soldQuantity;
                  const selected = selectedTickets[ticketType.id] || 0;
                  const maxLimit = ticketType.maxPerOrder;
                  const numPerOrder = ticketType.numPerOrder;
                  const isSelected = selected > 0;
                  const isBlocked = hasSelection && !isSelected;
                  const isAddDisabled =
                    selected >= available || selected >= maxLimit || isBlocked;

                  return (
                    <div
                      key={ticketType.id}
                      className={`relative rounded-xl border p-4 transition-all duration-300 ${
                        isSelected
                          ? "border-lime-500 bg-lime-50/50 shadow-sm ring-1 ring-lime-500"
                          : "border-slate-200"
                      } ${
                        isBlocked
                          ? "bg-slate-50 opacity-50 grayscale-[0.5]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`font-bold ${
                                isSelected ? "text-lime-700" : "text-slate-800"
                              }`}
                            >
                              {ticketType.name}
                            </h4>
                            {isSelected && (
                              <CheckCircle2
                                size={16}
                                className="text-lime-600"
                              />
                            )}
                          </div>
                          <p className="mt-1 font-bold text-lime-600">
                            {parseFloat(
                              ticketType.price.toString(),
                            ).toLocaleString()}{" "}
                            đ
                          </p>
                          {ticketType.description && (
                            <p className="mt-2 text-xs text-slate-500">
                              {ticketType.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span>
                              Còn lại:{" "}
                              <span className="font-medium text-slate-700">
                                {available}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {available > 0 ? (
                            <div
                              className={`flex items-center gap-3 rounded-lg border p-1 shadow-sm transition-colors ${
                                isSelected
                                  ? "border-lime-200 bg-white"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    ticketType.id,
                                    -numPerOrder,
                                  )
                                }
                                style={{
                                  cursor:
                                    selected === 0 ? "not-allowed" : "pointer",
                                }}
                                disabled={selected === 0}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-30"
                              >
                                <Minus size={16} />
                              </button>
                              <span
                                className={`w-8 text-center font-bold ${
                                  isSelected
                                    ? "text-lime-700"
                                    : "text-slate-800"
                                }`}
                              >
                                {selected}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    ticketType.id,
                                    numPerOrder,
                                  )
                                }
                                disabled={isAddDisabled}
                                style={{
                                  cursor: isAddDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors ${
                                  isAddDisabled
                                    ? "bg-slate-300"
                                    : "bg-lime-600 hover:bg-lime-700"
                                }`}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                              Hết vé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột Phải: Cart Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-lime-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                Thông tin đặt vé
              </h3>
              <div className="mb-4 border-b border-slate-100 pb-4">
                <h4 className="line-clamp-1 font-semibold text-slate-700">
                  {event.title}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(event.startTime).toLocaleString("vi-VN")}
                </p>
              </div>
              {hasSelection &&
                Object.entries(selectedTickets).map(([id, qty]) => {
                  const t = event.ticketTypes.find(
                    (type) => type.id === Number(id),
                  );
                  if (!t) return null;
                  return (
                    <div
                      key={id}
                      className="mb-6 max-h-[200px] space-y-2 overflow-y-auto border-b border-slate-100 pb-4"
                    >
                      <div className="flex justify-between rounded-lg border border-lime-100 bg-lime-50 p-2 text-sm">
                        <span className="font-medium text-lime-900">
                          {t.name} (x{qty})
                        </span>
                        <span className="font-bold text-lime-700">
                          {(Number(t.price) * qty).toLocaleString()} đ
                        </span>
                      </div>
                    </div>
                  );
                })}

              <div className="mb-6 flex items-center justify-between">
                <span className="font-bold text-slate-800">Tổng tạm tính</span>
                <span className="text-2xl font-bold text-lime-600">
                  {calculateTotal().toLocaleString()} đ
                </span>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                disabled={!hasSelection || isReserving} // Disable khi đang gọi API
                className="h-12 w-full bg-lime-600 text-base font-semibold shadow-lg shadow-lime-200 hover:bg-lime-700"
              >
                {isReserving ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Đang giữ vé...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2" size={18} /> Thanh toán
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có <b>15 phút</b> để hoàn tất thanh toán sau khi giữ vé. Nếu
              thanh toán thất bại hoặc quá thời gian này, vé sẽ được trả về hệ
              thống. Vui lòng không thoát, tải lại hay nhân đôi trang trong quá
              trình này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={performCheckout}
              className="bg-lime-600 hover:bg-lime-700"
            >
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketSelection;
