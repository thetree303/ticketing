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
import { StatusBadge } from "@/components/StatusBadge";
import { type TicketStatus } from "@/types";
import { Ticket, User, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TicketDetail {
  id: number;
  qrCode: string;
  ticketTypeName: string;
  price: number;
  seatNumber?: string;
  // Customer info
  customerName: string;
  customerEmail: string;
  // Event info
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  // Order info
  orderCode: string;
  purchaseDate: string;
  // Status
  status: TicketStatus;
  checkinTime?: string;
}

interface Props {
  ticket: TicketDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketDetailSheet: React.FC<Props> = ({
  ticket,
  open,
  onOpenChange,
}) => {
  if (!ticket) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Chi tiết vé</SheetTitle>
          <SheetDescription>Thông tin đầy đủ về vé và QR code</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="h-5 w-5" />
                Thông tin vé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Loại vé</span>
                <span className="font-medium">{ticket.ticketTypeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Giá</span>
                <span className="text-lg font-bold">
                  {formatCurrency(ticket.price)}
                </span>
              </div>
              {ticket.seatNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Số ghế</span>
                  <Badge variant="outline" className="font-mono">
                    {ticket.seatNumber}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Mã đơn hàng</span>
                <span className="font-mono text-sm">{ticket.orderCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Trạng thái</span>
                <span className="text-lg font-bold">
                  <StatusBadge status={ticket.status} type={"ticket"} />
                </span>
              </div>
              {ticket.checkinTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Thời gian check-in
                  </span>
                  <span className="text-md font-semibold">
                    {format(new Date(ticket.checkinTime), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{ticket.customerName}</p>
              <p className="text-sm text-slate-600">{ticket.customerEmail}</p>
              <p className="text-xs text-slate-500">
                Mua lúc{" "}
                {format(new Date(ticket.purchaseDate), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </p>
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                Thông tin sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-lg font-medium">{ticket.eventName}</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Thời gian</p>
                  <p className="text-sm text-slate-600">
                    {format(
                      new Date(ticket.eventDate),
                      "EEEE, dd MMMM yyyy - HH:mm",
                      {
                        locale: vi,
                      },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">{ticket.venueName}</p>
                  <p className="text-sm text-slate-600">
                    {ticket.venueAddress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
