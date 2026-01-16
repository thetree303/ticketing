import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { orderService, authService } from "../../services/api";
import type { TicketType } from "../../types";
import { toast } from "sonner";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu từ state truyền qua, nhưng không tin tưởng tuyệt đối
  const { event, selectedTickets, orderId, reservedAt } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({ fullName: "", email: "", phone: "" });
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false); // State kiểm tra session hợp lệ

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs kiểm soát hành vi thoát trang
  const isPaymentProcessing = useRef(false);
  const isManualCancel = useRef(false);

  // 1. Kiểm tra trạng thái đơn hàng ngay khi vào trang
  useEffect(() => {
    if (!event || !orderId) {
      navigate("/");
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const order = await orderService.getOrderById(orderId);
        // Nếu đơn hàng đã bị hủy hoặc đã hoàn thành -> Không cho thanh toán nữa
        if (order.status !== "Pending") {
          toast.error("Đơn hàng này không còn hiệu lực hoặc đã hết hạn.");
          navigate(`/events/${event.id}`);
          return;
        }
        setIsValidSession(true); // Đánh dấu session hợp lệ để hiện UI
      } catch (error) {
        console.error("Lỗi kiểm tra đơn hàng:", error);
        navigate("/");
      }
    };

    checkOrderStatus();
  }, [event, orderId, navigate]);

  // 2. Timer (Chỉ chạy khi Session hợp lệ)
  useEffect(() => {
    if (!orderId || !isValidSession) return;

    const startTime = reservedAt ? new Date(reservedAt).getTime() : Date.now();
    const endTime = startTime + 15 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remain = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remain);

      if (remain <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeout();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reservedAt, orderId, isValidSession]);

  // 3. Load User Profile
  useEffect(() => {
    if (isValidSession) {
      const fetchProfile = async () => {
        try {
          const res = await authService.getProfile();
          setBuyerInfo({
            fullName: res.fullName || "",
            email: res.email || "",
            phone: res.phoneNumber || "",
          });
        } catch (err) {
          console.error(err);
        }
      };
      fetchProfile();
    }
  }, [isValidSession]);

  // 4. Logic Chặn thoát & Tự động hủy
  useEffect(() => {
    if (!isValidSession) return; // Chỉ kích hoạt khi session hợp lệ

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        !isPaymentProcessing.current &&
        !isManualCancel.current &&
        !isTimeout
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const performAutoCancel = () => {
      if (
        !isPaymentProcessing.current &&
        !isManualCancel.current &&
        !isTimeout &&
        orderId
      ) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        fetch(`${apiUrl}/orders/${orderId}/cancel`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch((err) => console.error("Auto cancel failed", err));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Thêm sự kiện pagehide để xử lý khi đóng tab/trình duyệt (tin cậy hơn cleanup của useEffect)
    window.addEventListener("pagehide", performAutoCancel);

    // CLEANUP - Chạy khi Component Unmount (Thoát trang / Refresh / Back)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", performAutoCancel);

      // Gọi logic hủy khi unmount (xử lý SPA navigation)
      performAutoCancel();
    };
  }, [orderId, isTimeout, isValidSession]);

  const handleTimeout = async () => {
    setIsTimeout(true);
    try {
      if (orderId) await orderService.cancelOrder(orderId);
    } catch (error) {
      console.error("Auto cancel failed", error);
    }
  };

  const handleManualCancel = async () => {
    try {
      isManualCancel.current = true;
      setLoading(true);
      if (orderId) await orderService.cancelOrder(orderId);
      navigate(`/events/${event?.id}/book`);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi hủy đơn hàng");
      isManualCancel.current = false;
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", email: "", phone: "" };

    if (!buyerInfo.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerInfo.email.trim()) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!emailRegex.test(buyerInfo.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!buyerInfo.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!phoneRegex.test(buyerInfo.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const calculateTotal = () => {
    if (!event || !selectedTickets) return 0;
    return Object.entries(selectedTickets).reduce(
      (sum, [ticketTypeId, qty]) => {
        const ticketType = event.ticketTypes.find(
          (t: TicketType) => t.id === parseInt(ticketTypeId),
        );
        return (
          sum +
          (ticketType
            ? parseFloat(ticketType.price.toString()) * (qty as number)
            : 0)
        );
      },
      0,
    );
  };

  const handleConfirmPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      isPaymentProcessing.current = true;
      setProcessingStep("Đang chuyển đến cổng thanh toán...");

      const { paymentService } = await import("../../services/api");
      const response = await paymentService.createVNPayPayment(
        orderId,
        calculateTotal(),
        buyerInfo,
      );

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        isPaymentProcessing.current = false;
        toast.error("Không nhận được link thanh toán.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra.";
      toast.error(`Không thể tạo thanh toán: ${msg}`);
      isPaymentProcessing.current = false;
    } finally {
      setLoading(false);
      setProcessingStep("");
    }
  };

  // Nếu chưa kiểm tra xong session hoặc data lỗi, không render gì cả (hoặc loading)
  if (!event || !isValidSession)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-lime-600" />
      </div>
    );

  if (isTimeout) {
    // ... (Giữ nguyên UI Timeout) ...
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md space-y-4 rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Đã hết thời gian giữ vé
          </h2>
          <p className="text-slate-500">
            Rất tiếc, thời gian thanh toán (15 phút) đã kết thúc. Vé của bạn đã
            được hủy để nhường cho người khác.
          </p>
          <Button
            onClick={() => navigate(`/events/${event.id}`)} // Sửa link về trang chi tiết sự kiện
            className="w-full bg-lime-600 hover:bg-lime-700"
          >
            Đặt vé lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setShowCancelDialog(true)}
          className="mb-2 pl-0 hover:bg-transparent hover:text-lime-600"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại
        </Button>

        <div>
          {/* Header ... */}
          <div className="mb-8 flex flex-col items-center justify-center gap-x-4 gap-y-2 md:flex-row md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Thanh toán & Đặt vé
              </h1>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="flex w-fit items-center gap-2 rounded-xl border border-lime-100 bg-white px-4 py-2 font-mono text-xl font-bold text-lime-700 shadow-sm">
                <Clock size={20} className="animate-pulse" />
                {formatTime(timeLeft)}
              </div>
              <div className="mt-2 text-center text-sm text-slate-400">
                Lưu ý: Bạn có <b>15 phút</b> để hoàn tất thanh toán
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Form Inputs ... */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                {/* ... Nội dung form user ... */}
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                  <User size={22} className="text-lime-600" />
                  Thông tin người tham dự
                </h2>
                {/* Copy lại phần Input từ file cũ vào đây */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={buyerInfo.fullName}
                      onChange={(e) => {
                        setBuyerInfo({
                          ...buyerInfo,
                          fullName: e.target.value,
                        });
                        if (errors.fullName)
                          setErrors({ ...errors, fullName: "" });
                      }}
                      placeholder="Nguyễn Văn A"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Email nhận vé <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={buyerInfo.email}
                      onChange={(e) => {
                        setBuyerInfo({ ...buyerInfo, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="email@example.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={buyerInfo.phone}
                      onChange={(e) => {
                        setBuyerInfo({ ...buyerInfo, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="0912345678"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                {/* Copy lại phần Payment Method UI */}
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                  <CreditCard size={22} className="text-lime-600" />
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-lime-600 bg-lime-50 p-4 transition-all hover:border-lime-500 hover:bg-lime-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-lime-600">
                        <div className="h-2 w-2 rounded-full bg-lime-600"></div>
                      </div>
                      <span className="font-semibold text-slate-800">
                        Thanh toán QR (VNPAY)
                      </span>
                    </div>
                    <CreditCard size={20} className="text-lime-600" />
                  </label>
                  {/* ... Các method khác ... */}
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4 opacity-60 transition-all hover:border-lime-500 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border border-slate-400"></div>
                      <span className="font-semibold text-slate-800">
                        Thẻ quốc tế (Visa/Mastercard)
                      </span>
                    </div>
                    <CreditCard size={20} className="text-slate-400" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4 opacity-60 transition-all hover:border-lime-500 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border border-slate-400"></div>
                      <span className="font-semibold text-slate-800">
                        Thanh toán tại quầy
                      </span>
                    </div>
                    <CreditCard size={20} className="text-slate-400" />
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-lime-100 bg-white p-6 shadow-lg">
                <h3 className="mb-4 border-b border-slate-100 pb-4 text-lg font-bold text-slate-900">
                  Đơn hàng của bạn
                </h3>
                <div className="mb-6 space-y-2">
                  <h4 className="line-clamp-2 font-bold text-slate-800">
                    {event.title}
                  </h4>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    {new Date(event.startTime).toLocaleString("vi-VN")}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    {event.venueName}
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="mb-6 space-y-3">
                  {Object.entries(selectedTickets).map(([typeId, qty]) => {
                    const ticket = event.ticketTypes.find(
                      (t: TicketType) => t.id === parseInt(typeId),
                    );
                    if (!ticket) return null;
                    return (
                      <div
                        key={typeId}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <span className="mb-2 font-medium text-slate-700">
                            {ticket.name}
                          </span>
                          <div className="text-xs text-slate-500">
                            x {qty as number} vé
                          </div>
                        </div>
                        <span className="font-medium text-slate-900">
                          {(
                            parseFloat(ticket.price.toString()) *
                            (qty as number)
                          ).toLocaleString()}{" "}
                          đ
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-4 bg-slate-200" />
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-md font-semibold text-slate-700">
                    Tổng thanh toán
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-lime-600">
                      {calculateTotal().toLocaleString()} đ
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="h-12 w-full bg-lime-600 text-base font-semibold shadow-lg shadow-lime-200 transition-all hover:bg-lime-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />{" "}
                      {processingStep || "Đang xử lý..."}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2" /> Xác nhận thanh toán
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc muốn quay lại?</AlertDialogTitle>
              <AlertDialogDescription>
                Nếu bạn rời khỏi trang này, đơn hàng đang giữ chỗ của bạn sẽ bị
                hủy và vé sẽ được trả lại kho.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Ở lại thanh toán</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleManualCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Hủy đơn & Quay lại
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Checkout;
