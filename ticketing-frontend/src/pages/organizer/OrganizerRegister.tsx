import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AtSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api";

const OrganizerRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await authService.register({
        username: data.username, // <-- Gửi username lên
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone,
        role: "organizer",
      });

      toast.success("Đăng ký tài khoản Nhà tổ chức thành công!");
      navigate("/login");
    } catch (error: any) {
      console.error("Register error:", error);
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        // Nếu là mảng lỗi, hiển thị dòng đầu tiên hoặc join lại
        toast.error(message[0]);
      } else {
        toast.error(message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="grid min-h-[600px] w-full max-w-5xl grid-cols-1 gap-8 overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Cột trái: Giữ nguyên không đổi */}
        <div className="relative hidden flex-col justify-between bg-slate-900 p-12 text-white md:flex">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold">
                Trở thành Nhà tổ chức sự kiện chuyên nghiệp
              </h1>
              <p className="text-lg text-slate-300">
                Tiếp cận hàng triệu khán giả, quản lý vé thông minh và tối ưu
                doanh thu với nền tảng của chúng tôi.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lime-400" />
              <span>Tạo sự kiện không giới hạn</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lime-400" />
              <span>Hệ thống báo cáo doanh thu chi tiết</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lime-400" />
              <span>Công cụ Check-in vé QR Code</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form đăng ký */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-slate-500">Dành cho Nhà tổ chức sự kiện</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* --- BỔ SUNG: TRƯỜNG USERNAME --- */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <AtSign className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  className="h-11 pl-10"
                  placeholder="VD: organizer_123"
                  {...register("username", {
                    required: "Tên đăng nhập không được để trống",
                    minLength: {
                      value: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới",
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">
                  {String(errors.username.message)}
                </p>
              )}
            </div>

            {/* Các trường cũ giữ nguyên */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Tên đơn vị / Người tổ chức</Label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <Input
                  id="fullName"
                  className="h-11 pl-10"
                  placeholder="Ví dụ: Công ty giải trí ABC"
                  {...register("fullName", {
                    required: "Vui lòng nhập tên đơn vị",
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {String(errors.fullName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email công việc</Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  className="h-11 pl-10"
                  placeholder="contact@company.com"
                  {...register("email", {
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại liên hệ</Label>
              <div className="relative">
                <Phone className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <Input
                  id="phone"
                  className="h-11 pl-10"
                  placeholder="0912345678"
                  {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^(0|84|\+84)(3|5|7|8|9)([0-9]{8})$/,
                      message: "Số điện thoại không hợp lệ (VN)",
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">
                  {String(errors.phone.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    className="h-11 pl-10"
                    {...register("password", {
                      required: "Nhập mật khẩu",
                      minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="h-11 pl-10"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        value === password || "Mật khẩu không khớp",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {String(errors.confirmPassword.message)}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="mt-4 h-12 w-full bg-slate-900 text-base hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                  lý...
                </>
              ) : (
                <>
                  <span className="mr-2">Đăng ký ngay</span>{" "}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-sm text-slate-500">
              Bạn muốn mua vé sự kiện?{" "}
              <Link
                to="/register"
                className="font-semibold text-lime-600 hover:underline"
              >
                Đăng ký Khách hàng
              </Link>
            </div>

            <div className="text-center text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-lime-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerRegister;
