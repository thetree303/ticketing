import React, { useState, useMemo } from "react";
import {
  Upload,
  MapPin,
  Type,
  FileText,
  Layers,
  Ticket,
  Plus,
  Trash2,
  DollarSign,
  Hash,
  Loader2,
} from "lucide-react";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import type { Event } from "../types";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
}

export interface TicketTypeInput {
  id?: number;
  name: string;
  description?: string;
  price: number;
  initialQuantity: number;
  numPerOrder?: number;
  maxPerOrder?: number;
}

interface EventFormProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (eventData: FormData, tickets: TicketTypeInput[]) => void;
  initialData?: Event | null;
  isEditMode?: boolean;
  categories?: Category[];
}

interface EventFormProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (eventData: FormData, tickets: TicketTypeInput[]) => void;
  initialData?: Event | null;
  isEditMode?: boolean;
  categories?: Category[];
}

const EventForm: React.FC<EventFormProps> = ({
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startTime: initialData?.startTime ? new Date(initialData.startTime) : null,
    endTime: initialData?.endTime ? new Date(initialData.endTime) : null,
    releaseDate: initialData?.releaseDate
      ? new Date(initialData.releaseDate)
      : null,
    closingDate: initialData?.closingDate
      ? new Date(initialData.closingDate)
      : null,
    venueName: initialData?.venueName || "",
    address: initialData?.address || "",
    categoryId: initialData?.category?.id?.toString() || "",
    bannerUrl: initialData?.bannerUrl || "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.bannerUrl || null,
  );

  const [isUploading, setIsUploading] = useState(false);

  const [tickets, setTickets] = useState<TicketTypeInput[]>(() => {
    if (
      initialData &&
      initialData.ticketTypes &&
      initialData.ticketTypes.length > 0
    ) {
      return initialData.ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        description: tt.description || "",
        price: Number(tt.price),
        initialQuantity: tt.initialQuantity,
        numPerOrder: tt.numPerOrder || 1,
        maxPerOrder: tt.maxPerOrder || 10,
      }));
    }
    return [
      {
        name: "",
        price: 0,
        initialQuantity: 100,
        description: "",
        numPerOrder: 1,
        maxPerOrder: 10,
      },
    ];
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    name: "startTime" | "endTime" | "releaseDate" | "closingDate",
    date: Date | null,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const data = new FormData();
        data.append("file", file);

        const response = await api.post("/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const imageUrl = response.data.url;
        setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }));
        setImagePreview(imageUrl);
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        alert("Không thể tải ảnh lên. Vui lòng thử lại!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleTicketChange = (
    index: number,
    field: keyof TicketTypeInput,
    value: any,
  ) => {
    const newTickets = [...tickets];
    // @ts-expect-error - Dynamic field assignment
    newTickets[index][field] = value;
    setTickets(newTickets);
  };

  const addTicketType = () => {
    setTickets([...tickets, { name: "", price: 0, initialQuantity: 100 }]);
  };

  const removeTicketType = (index: number) => {
    if (tickets.length > 1) {
      const newTickets = tickets.filter((_, i) => i !== index);
      setTickets(newTickets);
    }
  };

  const errors = useMemo(() => {
    const newErrors: { [key: string]: string } = {};
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = "Thời gian Kết thúc phải sau Thời gian Bắt đầu";
      }
    }
    if (formData.releaseDate && formData.closingDate) {
      if (formData.releaseDate >= formData.closingDate) {
        newErrors.closingDate = "Thời gian Đóng bán phải sau Thời gian Mở bán";
      }
    }
    // Kiểm tra ngày mở bán phải trước thời gian bắt đầu
    if (formData.releaseDate && formData.startTime) {
      if (formData.releaseDate >= formData.startTime) {
        newErrors.releaseDate = "Thời gian Mở bán phải trước Thời gian Bắt đầu";
      }
    }
    // Kiểm tra ngày đóng bán phải trước thời gian kết thúc
    if (formData.closingDate && formData.endTime) {
      if (formData.closingDate >= formData.endTime) {
        newErrors.closingDate =
          (newErrors.closingDate ? newErrors.closingDate + ". " : "") +
          "Thời gian Đóng bán phải trước Thời gian Kết thúc";
      }
    }
    return newErrors;
  }, [
    formData.startTime,
    formData.endTime,
    formData.releaseDate,
    formData.closingDate,
  ]);

  const handleSubmit = () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description || "");
    if (formData.startTime)
      data.append("startTime", formData.startTime.toISOString());
    if (formData.endTime)
      data.append("endTime", formData.endTime.toISOString());
    if (formData.releaseDate)
      data.append("releaseDate", formData.releaseDate.toISOString());
    if (formData.closingDate)
      data.append("closingDate", formData.closingDate.toISOString());

    data.append("venueName", formData.venueName || "");
    data.append("address", formData.address || "");
    data.append("categoryId", formData.categoryId.toString());
    if (formData.bannerUrl) data.append("bannerUrl", formData.bannerUrl);

    if (onSubmit) {
      onSubmit(data, tickets);
    }
  };

  const isFormValid = () => {
    if (isUploading) return false;
    if (!formData.title || !formData.categoryId) return false;
    if (tickets.some((t) => !t.name || t.price < 0)) return false;
    if (
      !formData.startTime ||
      !formData.endTime ||
      !formData.releaseDate ||
      !formData.closingDate
    )
      return false;
    return Object.keys(errors).length === 0;
  };

  // CSS Classes
  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const iconClass =
    "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none";

  console.log(formData);

  return (
    <div className="custom-scrollbar m-2 max-h-[75vh] space-y-6 overflow-y-auto pr-2">
      <div className="space-y-5">
        <h4 className="border-b border-lime-100 pb-2 text-sm font-bold tracking-wide text-lime-600 uppercase">
          1. Thông tin chung
        </h4>

        {/* Tên & Danh mục */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Tên sự kiện <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Type size={18} className={iconClass} />
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="VD: Liveshow, biểu diễn nghệ thuật..."
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Danh mục <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Layers size={18} className={iconClass} />
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Chọn danh mục...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className={labelClass}>Mô tả</label>
          <div className="relative">
            {/* Textarea cần chỉnh top icon khác với input thường */}
            <FileText
              size={18}
              className="pointer-events-none absolute top-3 left-3 text-slate-400"
            />
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass} pl-10`}
              placeholder="Mô tả chi tiết..."
            />
          </div>
        </div>

        {/* --- DATE PICKERS (ĐÃ SỬA) --- */}
        {/* Dùng popperProps={{ strategy: "fixed" }} để lịch hiển thị đè lên Modal */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              date={formData.startTime}
              setDate={(date) => handleDateChange("startTime", date)}
              placeholder="Chọn ngày bắt đầu"
            />
          </div>
          <div>
            <label className={labelClass}>
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              date={formData.endTime}
              setDate={(date) => handleDateChange("endTime", date)}
              placeholder="Chọn ngày kết thúc"
              minDate={formData.startTime || undefined}
            />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Thời gian mở bán <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              date={formData.releaseDate}
              setDate={(date) => handleDateChange("releaseDate", date)}
              maxDate={formData.endTime || undefined}
              placeholder="Chọn ngày mở bán"
            />
            {errors.releaseDate && (
              <p className="mt-1 text-xs text-red-500">{errors.releaseDate}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Thời gian đóng bán <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              date={formData.closingDate}
              setDate={(date) => handleDateChange("closingDate", date)}
              placeholder="Chọn ngày đóng bán"
              minDate={formData.releaseDate || undefined}
              maxDate={formData.endTime || undefined}
            />
            {errors.closingDate && (
              <p className="mt-1 text-xs text-red-500">{errors.closingDate}</p>
            )}
          </div>
        </div>

        {/* Địa điểm & Banner */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className={iconClass} />
              <input
                name="venueName"
                value={formData.venueName}
                onChange={handleChange}
                className={inputClass}
                placeholder="VD: Sân Mỹ Đình"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Địa chỉ</label>
            <div className="relative">
              <MapPin size={18} className={iconClass} />
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={inputClass}
                placeholder="Số 1 Lê Đức Thọ..."
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Ảnh banner sự kiện</label>
          <label className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-lime-400 hover:bg-slate-100">
            {isUploading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 transition-all">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-lime-600" />
                <p className="text-xs font-medium text-slate-600">
                  Đang tải lên...
                </p>
              </div>
            )}
            {imagePreview ? (
              <div className="relative h-full w-full">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex flex-col items-center text-white">
                    <Upload className="mb-2 h-8 w-8" />
                    <span className="text-sm font-medium">Thay đổi ảnh</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold">Tải ảnh lên</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG hoặc WebP (Tối đa 5MB)
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* PHẦN 2: LOẠI VÉ */}
      <div className="mt-2 space-y-4 border-t border-dashed border-slate-200 pt-4">
        <h4 className="text-sm font-bold tracking-wide text-lime-600 uppercase">
          2. Loại vé
        </h4>

        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className="group relative space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-lime-200"
            >
              {/* Nút xóa vé đặt ở góc phải */}
              {tickets.length > 1 && (
                <button
                  onClick={() => removeTicketType(index)}
                  className="absolute top-2 right-2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Hàng 1: Tên vé, Giá, Số lượng, Min, Max */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1.5fr_2fr]">
                {/* 1. Tên loại vé (To) */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">
                    Tên loại vé <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ticket
                      size={14}
                      className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={ticket.name}
                      onChange={(e) =>
                        handleTicketChange(index, "name", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-2 pl-8 text-sm outline-none focus:ring-1 focus:ring-lime-500"
                      placeholder="VD: VIP, CAT 1, GA 1,..."
                    />
                  </div>
                </div>

                {/* 2. Giá vé (To) */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">
                    Giá vé (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={14}
                      className="absolute top-1/2 left-2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min={0}
                      value={ticket.price}
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "price",
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-2 pl-6 text-sm outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* 3. Số lượng (Bé) */}
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">
                      Tổng SL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash
                        size={14}
                        className="absolute top-1/2 left-2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="number"
                        min={1}
                        value={ticket.initialQuantity}
                        onChange={(e) =>
                          handleTicketChange(
                            index,
                            "initialQuantity",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-2 pl-6 text-sm outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>
                  {/* 4. Min (Bé) */}
                  <div>
                    <label className="mb-1 block flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      SL / Đơn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={ticket.numPerOrder || 1}
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "numPerOrder",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full rounded-lg border border-lime-200 bg-white px-2 py-2 text-center text-sm outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  {/* 5. Max (Bé) */}
                  <div>
                    <label className="mb-1 block flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      Max / Đơn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={ticket.maxPerOrder || 10}
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "maxPerOrder",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full rounded-lg border border-lime-200 bg-white px-2 py-2 text-center text-sm outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hàng 2: Mô tả (Full width) - Giữ nguyên */}
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={ticket.description || ""}
                  onChange={(e) =>
                    handleTicketChange(index, "description", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-lime-500"
                  placeholder="VD: Bao gồm vòng tay, quà tặng,..."
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addTicketType}
              className="flex items-center rounded-lg border border-lime-100 px-3 py-1.5 text-xs font-bold text-lime-600 transition-colors hover:bg-lime-50"
            >
              <Plus size={14} className="mr-1" /> Thêm loại vé
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-slate-100 bg-white pt-4 pb-2">
        <button
          onClick={onClose}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="rounded-xl bg-lime-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-lime-200 transition-all hover:bg-lime-700 disabled:opacity-50 disabled:shadow-none"
        >
          Lưu Sự Kiện
        </button>
      </div>
    </div>
  );
};

export default EventForm;
