import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorCode = searchParams.get("code");

  const getErrorMessage = (code: string | null) => {
    const errorMessages: { [key: string]: string } = {
      "07": "Giao dịch bị từ chối bởi ngân hàng",
      "09": "Thẻ chưa đăng ký dịch vụ Internet Banking",
      "10": "Xác thực thông tin thẻ không chính xác",
      "11": "Hết thời gian thanh toán",
      "12": "Thẻ bị khóa",
      "13": "Sai mật khẩu xác thực giao dịch",
      "24": "Giao dịch bị hủy",
      "51": "Tài khoản không đủ số dư",
      "65": "Vượt quá hạn mức giao dịch",
      "75": "Ngân hàng đang bảo trì",
      "79": "Giao dịch bị timeout",
    };

    return (
      errorMessages[code || ""] ||
      "Giao dịch không thành công. Vui lòng thử lại sau."
    );
  };

  return (
    <div className="flex min-h-fit items-center justify-center bg-linear-to-br from-red-50 to-pink-50 px-8 pt-20 pb-30">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle size={48} className="text-red-600" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Thanh toán thất bại
        </h1>

        <p className="mb-4 text-slate-600">
          Đơn hàng của bạn đã bị hủy do thanh toán không thành công. Vé sẽ được
          hoàn trả lại về kho.
        </p>

        {errorCode && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              Lỗi {errorCode}: {getErrorMessage(errorCode)}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <ArrowLeft size={18} />
            Về trang chủ
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Nếu bạn gặp vấn đề, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailed;
