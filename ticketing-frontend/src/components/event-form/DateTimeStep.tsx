// Step 2: Date, Time & Location
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface DateTimeStepProps {
  form: UseFormReturn<any>;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export function DateTimeStep({
  form,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateTimeStepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Thời gian bắt đầu <span className="text-red-500">*</span>
          </Label>
          <DateTimePicker
            date={startDate}
            setDate={onStartDateChange}
            placeholder="Chọn ngày và giờ bắt đầu"
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">
              {errors.startDate.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Thời gian kết thúc <span className="text-red-500">*</span>
          </Label>
          <DateTimePicker
            date={endDate}
            setDate={onEndDateChange}
            placeholder="Chọn ngày và giờ kết thúc"
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">
              {errors.endDate.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">
          Địa điểm <span className="text-red-500">*</span>
        </Label>
        <Input
          id="venue"
          {...register("venue")}
          placeholder="VD: Nhà hát Hòa Bình, TP.HCM"
        />
        {errors.venue && (
          <p className="text-sm text-red-500">
            {errors.venue.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ chi tiết</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
        />
      </div>
    </div>
  );
}
