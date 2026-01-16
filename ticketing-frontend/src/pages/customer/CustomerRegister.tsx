import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import {
  registerSchema,
  type RegisterFormData,
} from "../../lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { ...registerData } = data;
      await authService.register(registerData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Đăng ký thất bại",
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 py-10">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-[-10%] left-[-5%] h-[40%] w-[40%] animate-pulse rounded-full bg-lime-600/20 blur-[100px]"></div>
        <div
          className="absolute top-[-10%] right-[-5%] h-[40%] w-[40%] animate-pulse rounded-full bg-cyan-600/20 blur-[100px]"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 m-4 w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">
            Tạo tài khoản mới
          </h2>
          <p className="text-slate-300">
            Tham gia ngay để khám phá hàng ngàn sự kiện hấp dẫn
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-slate-300">
              Họ và tên
            </Label>
            <div className="relative">
              <User
                className="absolute top-3 left-4 text-slate-400"
                size={20}
              />
              <Input
                id="fullName"
                {...register("fullName")}
                className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="absolute top-3 left-4 text-slate-400"
                size={20}
              />
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                placeholder="email@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" className="text-slate-300">
              Số điện thoại (tùy chọn)
            </Label>
            <div className="relative">
              <Phone
                className="absolute top-3 left-4 text-slate-400"
                size={20}
              />
              <Input
                id="phoneNumber"
                type="tel"
                {...register("phoneNumber")}
                className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                placeholder="0912345678"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-400">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-slate-300">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock
                className="absolute top-3 left-4 text-slate-400"
                size={20}
              />
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-slate-300">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Lock
                className="absolute top-3 left-4 text-slate-400"
                size={20}
              />
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="group mt-6 w-full bg-linear-to-r from-lime-600 to-cyan-600 py-4 transition-all hover:shadow-lg hover:shadow-lime-500/30"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
            {!isSubmitting && (
              <ArrowRight
                size={18}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>

        <p className="mt-1 text-center text-sm text-slate-400">
          Bạn là Nhà tổ chức?{" "}
          <Link
            to="/register-organizer"
            className="font-medium text-violet-400 hover:text-violet-300 hover:underline"
          >
            Đăng ký tại đây
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
