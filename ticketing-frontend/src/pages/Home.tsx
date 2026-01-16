import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Shield,
  Headphones,
  ArrowRight,
  MapPin,
  Music,
  Film,
  Brush,
  Theater,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { eventService, categoryService } from "@/services/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const Home: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      // Gán icon thủ công, do API chưa hỗ trợ
      const iconMap: { [key: string]: React.ReactNode } = {
        1: <Music size={40} />,
        2: <Film size={40} />,
        3: <Theater size={40} />,
        4: <Brush size={40} />,
      };
      response.data = response.data.map((cat: any) => ({
        ...cat,
        icon: iconMap[cat.id] || null,
      }));

      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll({
        status: "Published",
      });
      const events = response.data || [];
      // Set first 6 as featured
      setFeaturedEvents(events.slice(0, 6));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: vi });
  };

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section*/}
      <div className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1656401992374-5ce15b9a11fa?q=80&w=2074&auto=format&fit=crop"
            className="animate-subtle-zoom h-full w-full scale-105 object-cover"
            alt="Hero Background"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-900/45 to-slate-900/20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          {" "}
          <div className="animate-fade-in max-w-2xl">
            <Badge
              className="mb-6 border-lime-900/90 bg-linear-to-r from-lime-600/80 to-lime-600/65 px-4 py-2 text-white uppercase shadow-lg backdrop-blur-md transition-colors duration-300 hover:from-lime-700/80 hover:to-lime-700/60"
              variant={"outline"}
            >
              Nền tảng bán vé hàng đầu
            </Badge>

            <h1 className="mb-6 text-5xl leading-tight font-extrabold md:text-7xl">
              <span className="text-white drop-shadow-2xl">Sống trọn từng</span>
              <br />
              <span className="animate-gradient bg-linear-to-r from-lime-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                khoảnh khắc
              </span>
            </h1>

            <p className="mb-10 max-w-lg text-xl leading-relaxed text-slate-200 drop-shadow-lg">
              Khám phá và đặt vé cho những sự kiện âm nhạc, hội thảo và giải trí
              đỉnh cao nhất ngay hôm nay.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 transform rounded-full bg-linear-to-r from-lime-600 to-green-600 px-10 text-base font-bold shadow-2xl shadow-lime-600/50 transition-all duration-300 hover:-translate-y-1 hover:from-lime-700 hover:to-green-700 hover:shadow-lime-600/70"
              >
                <Link to="/events">
                  Khám phá ngay <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 transform rounded-full border-2 border-white/30 bg-white/10 px-10 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/20"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-72 w-72 animate-pulse rounded-full bg-lime-500/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-green-500/10 blur-3xl delay-1000"></div>
      </div>

      {/* Featured Events Carousel */}
      {featuredEvents.length > 0 && (
        <div className="bg-slate-50 pt-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Sự kiện nổi bật
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600">
                Những sự kiện được yêu thích nhất trong tuần
              </p>
            </div>

            <Slider {...carouselSettings}>
              {featuredEvents.map((event) => (
                <div key={event.id} className="h-full px-3 pb-16">
                  <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="relative h-40 shrink-0">
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
                    <CardContent className="flex flex-1 flex-col p-6">
                      <Badge variant="secondary" className="mb-3 w-fit">
                        {event.categoryName || "Event"}
                      </Badge>
                      <h3 className="mb-4 line-clamp-2 text-xl font-bold text-slate-900">
                        {event.title}
                      </h3>
                      <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.startTime)}</span>
                      </div>
                      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.venueName}</span>
                      </div>
                      <Button asChild className="mt-auto w-full">
                        <Link to={`/events/${event.id}`}>Xem chi tiết</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Khám phá theo danh mục
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Tìm sự kiện yêu thích của bạn theo từng loại hình
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/events/category/${category.id}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 flex justify-center text-4xl text-lime-600">
                      {category.icon ? (
                        <span>{category.icon}</span>
                      ) : (
                        <Theater size={40} />
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 transition-colors group-hover:text-lime-600">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Button to See All Events */}
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="h-14 transform rounded-full bg-linear-to-r from-lime-600 to-green-600 px-12 text-base font-bold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-lime-700/60 hover:to-green-700/60 hover:shadow-2xl"
            >
              <Link to="/events">
                Xem tất cả sự kiện <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Tại sao chọn TICKETEST?
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Chúng tôi mang đến trải nghiệm mua vé mượt mà, an toàn và nhanh
              chóng nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: <Calendar className="h-8 w-8 text-lime-600" />,
                title: "Đặt vé siêu tốc",
                desc: "Quy trình tối ưu hóa, chỉ mất 30s để sở hữu vé.",
              },
              {
                icon: <Shield className="h-8 w-8 text-lime-600" />,
                title: "Thanh toán an toàn",
                desc: "Bảo mật tuyệt đối với công nghệ mã hóa SSL chuẩn quốc tế.",
              },
              {
                icon: <Headphones className="h-8 w-8 text-lime-600" />,
                title: "Hỗ trợ 24/7",
                desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng lắng nghe bạn.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="group rounded-2xl border-slate-100 bg-white transition-all duration-300 hover:shadow-xl"
              >
                <CardContent className="p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-50 transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
