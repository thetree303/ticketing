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
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Package,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderDetail {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventName: string;
  totalAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  // Tickets
  tickets: Array<{
    id: number;
    ticketTypeName: string;
    qrCode: string;
    seatNumber?: string;
    price: number;
  }>;
  // Payment history from VNPAY
  paymentHistory?: Array<{
    transactionId: string;
    amount: number;
    status: string;
    timestamp: string;
    bankCode?: string;
  }>;
}

interface Props {
  order: OrderDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailSheet: React.FC<Props> = ({
  order,
  open,
  onOpenChange,
}) => {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-green-600 text-white",
      pending: "bg-amber-600 text-white",
      cancelled: "bg-red-600 text-white",
      refunded: "bg-slate-600 text-white",
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
          <SheetTitle>Chi tiết đơn hàng #{order.orderCode}</SheetTitle>
          <SheetDescription>
            Thông tin đầy đủ về đơn hàng và vé
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mã đơn hàng</p>
              <p className="text-2xl font-bold">{order.orderCode}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <Separator />

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm">{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{order.customerPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                Sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.eventName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Đặt lúc{" "}
                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-5 w-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tổng giá vé</span>
                <span className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Phí nền tảng</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(order.platformFee)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Thực nhận</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(order.netAmount)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CreditCard className="h-4 w-4" />
                <span>Phương thức: {order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5" />
                Danh sách vé ({order.tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.tickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      #{index + 1} - {ticket.ticketTypeName}
                    </p>
                    {ticket.seatNumber && (
                      <p className="text-xs text-slate-500">
                        Ghế: {ticket.seatNumber}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      QR: {ticket.qrCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(ticket.price)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* VNPAY Payment History */}
          {order.paymentHistory && order.paymentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5" />
                  Lịch sử thanh toán VNPAY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.paymentHistory.map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="bg-primary mt-2 h-2 w-2 rounded-full" />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline">
                            {payment.transactionId}
                          </Badge>
                          <Badge
                            variant={
                              payment.status === "success"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        {payment.bankCode && (
                          <p className="text-xs text-slate-500">
                            Ngân hàng: {payment.bankCode}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {format(
                            new Date(payment.timestamp),
                            "dd/MM/yyyy HH:mm:ss",
                            { locale: vi },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
