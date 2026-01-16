import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import {
  loginSchema,
  type LoginFormData,
} from "../lib/validations/auth.schema";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      setAuth(response.accessToken, response.user);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    // FIX: Dùng min-h-[calc(100vh-5rem)] thay vì min-h-screen để trừ đi chiều cao Header
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-lime-600/30 blur-[120px]"></div>
        <div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-purple-600/30 blur-[120px]"></div>
      </div>

      <div className="relative z-10 m-4 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">
            Chào mừng trở lại!
          </h2>
          <p className="text-slate-300">
            Nhập thông tin để truy cập tài khoản của bạn
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <div>
              <Label htmlFor="identifier" className="text-slate-300">
                Tên đăng nhập / Email
              </Label>
              <div className="relative">
                <User
                  className="absolute top-3 left-4 text-slate-400"
                  size={20}
                />
                <Input
                  id="identifier"
                  {...register("identifier")}
                  className="mt-2 h-11 border-slate-700 bg-slate-200 pl-12 text-black placeholder-slate-500 focus-visible:ring-lime-500"
                  placeholder="Tên đăng nhập / Email"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.identifier.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
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
                  placeholder="Mật khẩu"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="group w-full bg-linear-to-r from-lime-600 to-purple-600 py-3.5 transition-all hover:shadow-lg hover:shadow-lime-500/30"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            {!isSubmitting && (
              <ArrowRight
                size={18}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-lime-400 hover:text-lime-300"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
