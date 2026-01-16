"use client";

import * as React from "react";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Chọn ngày",
  disabled = false,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          id="date-picker"
          className={cn(
            "justify-between font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex items-center gap-4">
            <CalendarIcon size={16} className="opacity-50" />
            {date ? format(date, "dd/MM/yyyy", { locale: vi }) : placeholder}
          </div>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-auto overflow-hidden p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleDateSelect}
          disabled={(checkDate) => {
            if (minDate) {
              return checkDate < minDate;
            }
            return false;
          }}
          initialFocus
          locale={vi}
          captionLayout="dropdown"
          fromYear={1950}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
