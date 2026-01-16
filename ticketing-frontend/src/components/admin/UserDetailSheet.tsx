import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Ticket,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserDetail {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: string;
  // Purchase history
  totalPurchases?: number;
  totalSpent?: number;
  // Events organized (if organizer)
  eventsOrganized?: number;
  // Activity log
  recentActivity?: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
}

interface Props {
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailSheet: React.FC<Props> = ({
  user,
  open,
  onOpenChange,
}) => {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      admin: "bg-red-500 text-white",
      organizer: "bg-purple-500 text-white",
      customer: "bg-blue-500 text-white",
    };
    return (
      <Badge className={variants[role.toLowerCase()] || "bg-slate-500"}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-500 text-white",
      locked: "bg-amber-500 text-white",
      banned: "bg-red-500 text-white",
    };
    return (
      <Badge className={variants[status.toLowerCase()] || "bg-slate-500"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Chi tiết người dùng</SheetTitle>
          <SheetDescription>
            Thông tin đầy đủ về người dùng và lịch sử hoạt động
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-xl font-bold">
                  {user.fullName || user.username}
                </h3>
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
              <p className="text-sm text-slate-500">@{user.username}</p>
              <p className="mt-1 text-xs text-slate-500">
                Tham gia{" "}
                {format(new Date(user.createdAt), "dd MMMM yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{user.phoneNumber}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {user.role.toLowerCase() === "customer" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lịch sử mua vé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-slate-600">
                      Tổng đơn hàng
                    </span>
                  </div>
                  <span className="text-lg font-bold">
                    {user.totalPurchases || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">
                      Tổng chi tiêu
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(user.totalSpent || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {user.role.toLowerCase() === "organizer" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lịch sử tổ chức</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-slate-600">
                      Sự kiện đã tổ chức
                    </span>
                  </div>
                  <span className="text-lg font-bold">
                    {user.eventsOrganized || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" />
                Log hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.recentActivity && user.recentActivity.length > 0 ? (
                  user.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="bg-primary mt-2 h-2 w-2 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-slate-500">
                          {activity.details}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {format(
                            new Date(activity.timestamp),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Chưa có hoạt động nào
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
