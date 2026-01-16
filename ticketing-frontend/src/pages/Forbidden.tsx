import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-full bg-red-50"></div>
          </div>
          <ShieldAlert className="relative mx-auto h-20 w-20 text-red-500" />
        </div>

        <h2 className="mb-3 text-3xl font-bold text-slate-900">
          Truy cập bị hạn chế
        </h2>

        <p className="mb-10 text-lg text-slate-500">
          Rất tiếc, bạn không có quyền truy cập vào nội dung này. Vui lòng kiểm
          tra lại tài khoản hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <Button asChild className="flex items-center gap-2">
            <Link to="/home">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
          </Button>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-400">
            Bạn nghĩ đây là một lỗi?{" "}
            <button className="font-medium text-lime-600 hover:underline">
              Báo cáo ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
