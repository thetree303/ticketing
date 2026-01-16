"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  date?: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Chọn thời gian",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  // State lưu giờ (HH:mm) để hiển thị trong input
  const [timeValue, setTimeValue] = React.useState<string>("00:00");

  // Đồng bộ giờ từ prop date vào state nội bộ
  React.useEffect(() => {
    if (date) {
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Giữ nguyên giờ phút hiện tại khi chọn ngày mới
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    setDate(newDate);
    // Lưu ý: Không đóng popover ngay để người dùng có thể chỉnh giờ tiếp
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    // Nếu đã có ngày, cập nhật giờ ngay lập tức
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setDate(newDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start border-slate-200 bg-slate-50 text-left font-normal transition-colors hover:border-lime-200 hover:bg-white",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-lime-500" />
          {date ? (
            <span className="font-medium text-slate-900">
              {format(date, "dd/MM/yyyy HH:mm", { locale: vi })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        {/* Phần Lịch */}
        <div className="border-b border-slate-100">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleDateSelect}
            disabled={(checkDate) => {
              if (minDate && maxDate) {
                const dMin = new Date(minDate);
                const dMax = new Date(maxDate);
                dMin.setHours(0, 0, 0, 0);
                dMax.setHours(23, 59, 59, 999);
                return checkDate < dMin || checkDate > dMax;
              } else if (minDate) {
                const d = new Date(minDate);
                d.setHours(0, 0, 0, 0);
                return checkDate < d;
              } else if (maxDate) {
                // Chặn ngày lớn hơn maxDate (so sánh ngày, bỏ qua giờ)
                const d = new Date(maxDate);
                d.setHours(23, 59, 59, 999);
                return checkDate > d;
              }
              return false;
            }}
            initialFocus
            locale={vi}
            classNames={{
              day_selected:
                "bg-lime-600 text-white hover:bg-lime-600 hover:text-white focus:bg-lime-600 focus:text-white",
              day_today: "bg-slate-100 text-slate-900",
            }}
          />
        </div>

        {/* Phần Footer chọn Giờ (Style Calendar-17) */}
        <div className="bg-slate-50/50 p-3">
          <Label
            htmlFor="time-input"
            className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Thời gian
          </Label>
          <div className="relative">
            <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="time-input"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="appearance-none border-slate-200 bg-white pl-9 font-medium focus-visible:ring-lime-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
