// Step 1: Basic Information
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
interface EventCategory {
  id: number;
  name: string;
}

interface BasicInfoStepProps {
  form: UseFormReturn<any>;
  categories: EventCategory[];
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicInfoStep({
  form,
  categories,
  imagePreview,
  onImageChange,
}: BasicInfoStepProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Tên sự kiện <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="VD: Đêm nhạc Acoustic"
        />
        {errors.title && (
          <p className="text-sm text-red-500">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Mô tả sự kiện <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Mô tả chi tiết về sự kiện..."
          rows={5}
        />
        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">
          Danh mục <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setValue("categoryId", parseInt(value))}
          defaultValue={form.watch("categoryId")?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-red-500">
            {errors.categoryId.message as string}
          </p>
        )}
      </div>

      <div>
        <Label>Ảnh sự kiện</Label>
        <label className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-lime-400 hover:bg-slate-100">
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
            onChange={onImageChange}
          />
        </label>
      </div>
    </div>
  );
}
