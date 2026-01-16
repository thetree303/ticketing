import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventService, categoryService } from "../services/api";
import Pagination from "../components/Pagination";
import { EventFiltersDrawer } from "../components/customer/EventFiltersDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FilterOptions } from "../components/customer/EventFiltersDrawer";

const Events: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusTab, setStatusTab] = useState<string>("Published");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const defaultFilters: FilterOptions = {
    priceRange: [0, 100000000],
    dateFrom: undefined,
    dateTo: undefined,
    categories: [],
    location: "",
  };

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const { data: eventsData, isLoading } = useQuery({
    queryKey: [filters, statusTab, page, searchTerm],
    queryFn: () =>
      eventService.getAll({
        page,
        limit: 9,
        search:
          `${searchTerm || ""} ${filters.location || ""}`.trim() || undefined,
        status: statusTab || undefined,
        dateFrom: filters.dateFrom?.toISOString().split("T")[0],
        dateTo: filters.dateTo?.toISOString().split("T")[0],
        categoryId:
          filters.categories.length > 0 ? filters.categories[0] : undefined,
        priceRange: filters.priceRange,
        sortBy: "startTime",
        sortOrder: "ASC",
      }),
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden px-4 py-16 text-center">
        <img
          src="https://images.unsplash.com/photo-1505842465776-3b4953ca4f44?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Events Banner"
          className="absolute inset-0 h-full w-full object-cover brightness-50"
        ></img>
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10">
          <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-lime-400 blur-3xl"></div>
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-lime-500 blur-3xl"></div>
        </div>
        <h1 className="relative z-10 mb-4 text-4xl font-bold text-white">
          Khám Phá Sự Kiện
        </h1>
        <p className="relative z-10 text-lg text-white">
          Tìm kiếm những trải nghiệm tuyệt vời nhất dành cho bạn
        </p>
      </div>

      <div className="relative z-20 container mx-auto -mt-8 px-4">
        {/* Search Bar - Floating */}
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl md:flex-row">
          <div className="relative w-full flex-grow">
            <Search
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform text-slate-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Tìm tên sự kiện, nghệ sĩ, địa điểm..."
              className="border-slate-200 bg-slate-50 py-3 pr-4 pl-12 text-slate-800 placeholder-slate-400 focus-visible:ring-lime-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Filter size={18} className="mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Active Filters Display */}
        {(filters.categories.length > 0 || filters.location) && (
          <div className="mx-auto mt-4 flex max-w-4xl flex-wrap gap-2">
            {filters.categories.map((catId) => {
              const category = categoriesData?.data.find(
                (c: any) => c.id === catId,
              );
              return (
                <Badge key={catId} variant="secondary" className="gap-2">
                  {category?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        categories: filters.categories.filter(
                          (id) => id !== catId,
                        ),
                      });
                    }}
                  />
                </Badge>
              );
            })}
            {filters.location && (
              <Badge variant="secondary" className="gap-2">
                {filters.location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, location: "" })}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Status Tabs and View Toggle */}
        <div className="mt-8 flex flex-col items-center justify-between md:flex-row">
          <div className="flex-1"></div>
          <Tabs
            value={statusTab}
            onValueChange={setStatusTab}
            className="w-full md:w-auto"
          >
            <TabsList className="mb-8 grid w-full grid-cols-2 md:mb-0 md:grid-cols-4">
              <TabsTrigger value="Published" className="px-8">
                Đang mở bán
              </TabsTrigger>
              <TabsTrigger value="Unpublished" className="px-8">
                Sắp mở bán
              </TabsTrigger>
              <TabsTrigger value="Ended" className="px-8">
                Đã kết thúc
              </TabsTrigger>
              <TabsTrigger value="Cancelled" className="px-8">
                Đã hủy
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-10 w-10 p-0"
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-10 w-10 p-0"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Event List */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl bg-white shadow-sm"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {eventsData?.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
                  <div className="mb-8 h-64 w-64 opacity-20">
                    <img
                      src="https://illustrations.popsy.co/amber/crashed-error.svg"
                      alt="No events"
                      className="h-full w-full"
                    />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-800">
                    Không tìm thấy sự kiện nào
                  </h3>
                  <p className="mb-6 max-w-md text-center text-slate-500">
                    Không có sự kiện nào phù hợp với bộ lọc của bạn. Hãy thử
                    điều chỉnh lại tiêu chí tìm kiếm.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setFilters(defaultFilters);
                      setStatusTab("Published");
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {eventsData?.data.map((event) => {
                    const totalTickets =
                      event.ticketTypes?.reduce(
                        (sum: number, tt: any) => sum + tt.initialQuantity,
                        0,
                      ) || 0;
                    const soldTickets =
                      event.ticketTypes?.reduce(
                        (sum: number, tt: any) =>
                          sum + (tt.initialQuantity - tt.availableQuantity),
                        0,
                      ) || 0;
                    const availabilityPercent =
                      totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

                    let availabilityBadge = null;
                    if (availabilityPercent >= 100) {
                      availabilityBadge = (
                        <Badge className="bg-red-600 text-white">Hết vé</Badge>
                      );
                    } else if (availabilityPercent >= 80) {
                      availabilityBadge = (
                        <Badge className="bg-amber-600 text-white">
                          Sắp hết
                        </Badge>
                      );
                    } else if (totalTickets > 0 && totalTickets <= 50) {
                      availabilityBadge = (
                        <Badge className="bg-blue-600 text-white">
                          Vé giới hạn
                        </Badge>
                      );
                    }

                    const minPrice = Number(event.minPrice) || Infinity;

                    return (
                      <Link
                        to={`/events/${event.id}`}
                        key={event.id}
                        className="group"
                      >
                        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                          <div className="relative h-60 overflow-hidden">
                            <img
                              src={
                                event.bannerUrl ||
                                `https://placehold.co/600x400/68A61C/ffffff?text=${encodeURIComponent(
                                  event.title.slice(0, 20),
                                )}`
                              }
                              alt={event.title}
                              onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/600x400/68A61C/ffffff?text=Event`;
                              }}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                              <Badge className="flex min-h-[50px] min-w-[60px] flex-col items-center justify-center bg-white/90 text-lime-900 shadow-sm backdrop-blur-sm hover:bg-white/90">
                                <span className="text-lg leading-none text-lime-600">
                                  {new Date(event.startTime).getDate()}
                                </span>
                                <span className="text-[10px] tracking-wide uppercase">
                                  Thg {new Date(event.startTime).getMonth() + 1}
                                </span>
                              </Badge>
                              {availabilityBadge}
                            </div>
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                          </div>

                          <CardContent className="flex flex-grow flex-col p-6">
                            <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-lg font-bold text-slate-900 transition-colors group-hover:text-lime-600">
                              {event.title}
                            </h3>

                            <div className="mb-4 flex-grow space-y-3 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-lime-600" />
                                <span>
                                  {new Date(event.startTime).toLocaleTimeString(
                                    "vi-VN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-lime-600" />
                                <span className="truncate">
                                  {event.venueName || "Địa điểm đang cập nhật"}
                                </span>
                              </div>
                            </div>

                            {minPrice && minPrice !== Infinity && (
                              <p className="mb-4 flex items-baseline gap-2 text-sm text-slate-600">
                                <span className="text-xs"> Từ</span>
                                <span className="text-xl font-bold text-lime-600">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(minPrice)}
                                </span>
                              </p>
                            )}

                            <Button className="text-md h-12 w-full">
                              Đặt vé ngay
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {eventsData?.data.map((event) => {
                    const totalTickets =
                      event.ticketTypes?.reduce(
                        (sum: number, tt: any) => sum + tt.initialQuantity,
                        0,
                      ) || 0;
                    const soldTickets =
                      event.ticketTypes?.reduce(
                        (sum: number, tt: any) =>
                          sum + (tt.initialQuantity - tt.availableQuantity),
                        0,
                      ) || 0;
                    const availabilityPercent =
                      totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

                    let availabilityBadge = null;
                    if (availabilityPercent >= 100) {
                      availabilityBadge = (
                        <Badge className="bg-red-600 text-white">Hết vé</Badge>
                      );
                    } else if (availabilityPercent >= 80) {
                      availabilityBadge = (
                        <Badge className="bg-amber-600 text-white">
                          Sắp hết
                        </Badge>
                      );
                    }

                    const minPrice = Number(event.minPrice) || Infinity;

                    return (
                      <Link
                        to={`/events/${event.id}`}
                        key={event.id}
                        className="mx-auto block max-w-6xl"
                      >
                        <Card className="transition-all duration-300 hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="flex-shrink-0">
                                <div className="h-32 w-32 overflow-hidden rounded-lg">
                                  <img
                                    src={
                                      event.bannerUrl ||
                                      `https://placehold.co/200x200/68A61C/ffffff?text=${encodeURIComponent(
                                        event.title.slice(0, 10),
                                      )}`
                                    }
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <h3 className="line-clamp-1 text-xl font-bold text-slate-900">
                                    {event.title}
                                  </h3>
                                  {availabilityBadge}
                                </div>

                                <div className="mb-3 space-y-2 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar
                                      size={14}
                                      className="text-lime-600"
                                    />
                                    <span>
                                      {new Date(
                                        event.startTime,
                                      ).toLocaleDateString("vi-VN")}{" "}
                                      -{" "}
                                      {new Date(
                                        event.startTime,
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin
                                      size={14}
                                      className="text-lime-600"
                                    />
                                    <span className="truncate">
                                      {event.venueName ||
                                        "Địa điểm đang cập nhật"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  {minPrice && minPrice !== Infinity && (
                                    <div>
                                      <span className="text-xs text-slate-500">
                                        Từ{" "}
                                      </span>
                                      <span className="text-xl font-bold text-lime-600">
                                        {new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                          notation: "standard",
                                        }).format(minPrice)}
                                      </span>
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    className="text-md px-6 font-semibold"
                                  >
                                    Đặt vé ngay
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {eventsData && eventsData.meta.totalPages > 1 && (
                <div className="mt-16">
                  <Pagination
                    currentPage={page}
                    totalPages={eventsData.meta.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Drawer */}
        <EventFiltersDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          filters={filters}
          onFiltersChange={setFilters}
          categories={categoriesData?.data || []}
        />
      </div>
    </div>
  );
};

export default Events;
