import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  User,
  DollarSign,
  Ticket,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  categoryName?: string;
  organizerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalRevenue?: number;
  ticketsSold?: number;
  totalTickets?: number;
  views?: number;
  approvalHistory?: Array<{
    status: string;
    note?: string;
    approverName: string;
    createdAt: string;
  }>;
}

interface Props {
  event: EventDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailSheet: React.FC<Props> = ({
  event,
  open,
  onOpenChange,
}) => {
  if (!event) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: "bg-green-600 text-white",
      pending: "bg-amber-600 text-white",
      draft: "bg-slate-500 text-white",
      rejected: "bg-red-600 text-white",
      cancelled: "bg-slate-700 text-white",
      ended: "bg-slate-600 text-white",
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Chi tiết sự kiện</SheetTitle>
          <SheetDescription>
            Thông tin đầy đủ về sự kiện và lịch sử phê duyệt
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Banner */}
          {event.bannerUrl && (
            <div className="h-48 w-full overflow-hidden rounded-lg bg-slate-100">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Title and Status */}
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h3 className="flex-1 text-2xl font-bold">{event.title}</h3>
              {getStatusBadge(event.status)}
            </div>
            <p className="text-sm text-slate-600">{event.description}</p>
          </div>

          <Separator />

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Thời gian</p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(event.startTime), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}{" "}
                    -{" "}
                    {format(new Date(event.endTime), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.venueName}</p>
                  <p className="text-sm text-slate-600">{event.venueAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Người tổ chức:</span>{" "}
                    {event.organizerName}
                  </p>
                </div>
              </div>
              {event.categoryName && (
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Danh mục:</span>{" "}
                      {event.categoryName}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Doanh thu</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(event.totalRevenue || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Ticket className="h-4 w-4" />
                  <span className="text-xs">Vé đã bán</span>
                </div>
                <p className="text-lg font-bold">
                  {event.ticketsSold || 0}/{event.totalTickets || 0}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">Lượt xem</span>
                </div>
                <p className="text-lg font-bold">
                  {(event.views || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Cập nhật lần cuối</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(event.updatedAt), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-5 w-5" />
                Lịch sử phê duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.approvalHistory && event.approvalHistory.length > 0 ? (
                  event.approvalHistory.map((approval, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div
                        className={`mt-2 h-2 w-2 rounded-full ${
                          approval.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant={
                              approval.status === "approved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {approval.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            bởi {approval.approverName}
                          </span>
                        </div>
                        {approval.note && (
                          <p className="text-sm text-slate-600">
                            {approval.note}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {format(
                            new Date(approval.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Chưa có lịch sử phê duyệt
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
