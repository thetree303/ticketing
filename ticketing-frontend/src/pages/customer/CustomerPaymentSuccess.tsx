import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex min-h-fit items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 px-8 pt-20 pb-30">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={48} className="text-green-600" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Thanh toán thành công!
        </h1>

        <p className="mb-2 text-slate-600">
          Đơn hàng #{orderId} đã được thanh toán thành công.
        </p>

        <p className="mb-6 text-slate-600">Vé của bạn đã được kích hoạt.</p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/tickets")}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Xem vé của tôi
            <ArrowRight size={18} />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Về trang chủ
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Vé sự kiện đã được kích hoạt. Bạn có thể kiểm tra vé trong mục "Vé của
          tôi", và xem lịch sử giao dịch trong mục "Đơn hàng của tôi".
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
