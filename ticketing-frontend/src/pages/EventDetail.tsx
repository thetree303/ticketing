import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowLeft, ChevronRight } from "lucide-react";
import { eventService } from "../services/api";
import type { Event, TicketType } from "../types";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import CountdownTimer from "@/components/CountdownTimer";

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const res = await eventService.getOne(parseInt(id));
          setEvent(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Hàm chuyển hướng sang trang chọn vé
  const handleBuyTicket = () => {
    navigate(`/events/${id}/book`);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-lime-600"></div>
      </div>
    );
  if (!event)
    return (
      <div className="py-20 text-center text-slate-500">
        Không tìm thấy sự kiện
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      {/* Background Blur */}
      <div className="relative h-[200px] w-full overflow-hidden lg:hidden">
        <img
          src={event.bannerUrl}
          alt="bg"
          className="h-full w-full scale-110 object-cover opacity-50 blur-xl"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-50"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 lg:pt-8">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center font-medium text-slate-600 transition-colors hover:text-lime-600"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* LEFT COLUMN - 2/3 Desktop */}
          <div className="space-y-6 lg:col-span-2">
            {/* Banner Image */}
            <div className="rounded-2xl bg-white p-3 shadow-lg">
              <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-[21/9]">
                <img
                  src={
                    event.bannerUrl ||
                    `https://placehold.co/1200x600/68A61C/ffffff?text=${encodeURIComponent(
                      event.title.slice(0, 30),
                    )}`
                  }
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Mobile: Quick Info (Below Banner) */}
            <div className="relative space-y-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:hidden">
              <div className="relative mb-6 flex items-start justify-between">
                <h1 className="text-2xl leading-tight font-extrabold text-slate-900">
                  {event.title}
                </h1>
                <StatusBadge status={event.status} type="event" />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-50 text-lime-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thời gian
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(event.startTime).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(event.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Địa điểm
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {event.venueName}
                    </p>
                    <p className="text-sm text-slate-600">{event.address}</p>
                  </div>
                </div>

                {event.status === "Unpublished" && event.releaseDate && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-center text-xs font-medium text-slate-500">
                      Vé sẽ mở bán vào:{" "}
                      <span className="font-bold text-lime-600">
                        {new Date(event.releaseDate).toLocaleString("vi-VN")}
                      </span>
                    </p>
                    <CountdownTimer targetDate={event.releaseDate} />
                  </div>
                )}
              </div>
            </div>

            {/* Tabs: Description & Organizer */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
              {/* Tab Content - Description */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  Chi tiết sự kiện
                </h3>
                <div className="prose prose-slate max-w-none leading-relaxed whitespace-pre-line text-slate-700">
                  {event.description || "Chưa có mô tả chi tiết."}
                </div>
              </div>

              {/* Organizer Section (for now, simple placeholder) */}
              <div className="mt-8 border-t border-slate-100 pt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  Ban tổ chức
                </h3>
                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  {event.organizer?.avatarUrl ? (
                    <img
                      src={event.organizer.avatarUrl}
                      alt={event.organizer.username}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-lime-500 to-lime-600 text-2xl font-bold text-white">
                      {event.organizer?.fullName?.charAt(0).toUpperCase() ||
                        "O"}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">
                      {event.organizer?.fullName || "Organizer"}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-slate-600">
                      {event.organizer?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 1/3 Desktop, Sticky Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 hidden space-y-6 lg:block">
              <div className="rounded-2xl border-2 border-lime-500/50 bg-white p-6 shadow-xl">
                {/* Event Name */}
                <div className="relative mb-6 flex items-start justify-between">
                  <h1 className="text-2xl leading-tight font-extrabold text-slate-900">
                    {event.title}
                  </h1>
                  <StatusBadge status={event.status} type="event" />
                </div>

                {/* Date & Time */}
                <div className="mb-4 flex items-start gap-4 border-b border-slate-100 pb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thời gian
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(event.startTime).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(event.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Địa điểm
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {event.venueName}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {event.address}
                    </p>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Giá vé
                  </p>
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    <p className="flex items-baseline gap-2 text-3xl font-bold text-lime-600">
                      <span>
                        {event.minPrice
                          ? parseFloat(
                              event.minPrice.toString(),
                            ).toLocaleString()
                          : Math.min(
                              ...event.ticketTypes.map((t: TicketType) =>
                                parseFloat(t.price.toString()),
                              ),
                            ).toLocaleString()}{" "}
                        đ
                      </span>
                      {event.ticketTypes.length > 1 && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-normal text-slate-500">
                            {" "}
                            đến{" "}
                          </span>
                          <span className="text-xl font-bold text-slate-500">
                            {event.maxPrice
                              ? parseFloat(
                                  event.maxPrice.toString(),
                                ).toLocaleString()
                              : Math.max(
                                  ...event.ticketTypes.map((t: TicketType) =>
                                    parseFloat(t.price.toString()),
                                  ),
                                ).toLocaleString()}{" "}
                            đ
                          </span>
                        </div>
                      )}
                    </p>
                  ) : (
                    <p className="text-slate-500">Đang cập nhật</p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={
                    "h-14 w-full text-base font-bold shadow-lg " +
                    (event.status !== "Published"
                      ? "cursor-not-allowed bg-slate-500 text-white"
                      : "bg-linear-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700")
                  }
                  onClick={handleBuyTicket}
                  disabled={event.status !== "Published"}
                >
                  Đặt vé ngay
                  <ChevronRight size={20} className="ml-2" />
                </Button>

                {/* Nếu sự kiện unpublished, hiển thị ngày mở bán vé kèm đếm ngược */}
                {event.status === "Unpublished" && event.releaseDate && (
                  <div className="mt-4 text-center text-sm text-slate-600">
                    <div className="text-xs font-bold text-slate-600 uppercase">
                      Mở bán vé sau
                    </div>
                    <CountdownTimer targetDate={event.releaseDate} />
                    <div className="mt-4">
                      Mở bán vào{" "}
                      <span className="text-md font-bold text-lime-600">
                        {new Date(event.releaseDate).toLocaleString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Available Tickets Summary */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Các loại vé
                    </p>
                    <div className="space-y-2">
                      {event.ticketTypes.map((ticketType: TicketType) => {
                        const available =
                          ticketType.initialQuantity - ticketType.soldQuantity;
                        const isSoldOut = available <= 0;

                        return (
                          <div
                            key={ticketType.id}
                            className="flex items-center justify-between rounded-sm border border-slate-100 px-4 py-2 text-sm shadow-sm"
                          >
                            <span
                              className={
                                isSoldOut ? "text-slate-400" : "text-slate-700"
                              }
                            >
                              {ticketType.name}
                            </span>
                            <span
                              className={`font-semibold ${
                                isSoldOut ? "text-red-500" : "text-slate-900"
                              }`}
                            >
                              {isSoldOut
                                ? "Hết vé"
                                : `${parseFloat(
                                    ticketType.price.toString(),
                                  ).toLocaleString()} đ`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white px-4 py-3 shadow-2xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-600">Giá từ</p>
            <p className="text-lg font-bold text-lime-600">
              {event.ticketTypes && event.ticketTypes.length > 0
                ? `${Math.min(
                    ...event.ticketTypes.map((t: TicketType) =>
                      parseFloat(t.price.toString()),
                    ),
                  ).toLocaleString()} đ`
                : "Đang cập nhật"}
            </p>
          </div>
          <Button
            className="h-12 bg-linear-to-r from-lime-600 to-green-600 px-8 text-base font-semibold shadow-lg hover:from-lime-700 hover:to-green-700"
            onClick={handleBuyTicket}
            disabled={event.status !== "Published"}
          >
            Đặt vé ngay
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
