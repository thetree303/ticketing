import React from "react";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Định nghĩa Interface cho Data thật
interface TopEvent {
  id: number;
  name: string;
  location: string;
  date: string;
  revenue: number;
  soldCount: number;
  image?: string;
}

interface TopEventsListProps {
  data: TopEvent[]; // Nhận data từ props
}

export const TopEventsList: React.FC<TopEventsListProps> = ({ data }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sự kiện bán chạy nhất</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Chưa có dữ liệu sự kiện
          </p>
        ) : (
          data.map((event) => (
            <div key={event.id} className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                <img
                  src={
                    event.image ||
                    `https://placehold.co/300x300/68A61C/ffffff?text=${encodeURIComponent(
                      event.name[0],
                    )}`
                  }
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm leading-none font-medium">{event.name}</p>
                <div className="text-muted-foreground flex items-center text-xs">
                  <MapPin className="mr-1 h-3 w-3" />
                  {event.location}
                  <span className="mx-2">•</span>
                  <Calendar className="mr-1 h-3 w-3" />
                  {event.date
                    ? format(new Date(event.date), "dd/MM/yyyy", { locale: vi })
                    : "TBA"}
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(event.revenue)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {event.soldCount} vé
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
