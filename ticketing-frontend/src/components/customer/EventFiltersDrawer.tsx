import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface FilterOptions {
  priceRange: [number, number];
  dateFrom?: Date;
  dateTo?: Date;
  categories: number[];
  location?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Array<{ id: number; name: string }>;
}

export const EventFiltersDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  categories,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handlePriceChange = (value: number[]) => {
    setDraftFilters({ ...draftFilters, priceRange: [value[0], value[1]] });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = draftFilters.categories.includes(categoryId)
      ? draftFilters.categories.filter((id) => id !== categoryId)
      : [...draftFilters.categories, categoryId];
    setDraftFilters({ ...draftFilters, categories: newCategories });
  };

  const handleReset = () => {
    setDraftFilters({
      priceRange: [0, 100000000],
      categories: [],
      location: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const handleApply = () => {
    onFiltersChange(draftFilters);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Bộ lọc nâng cao</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Khoảng giá</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={100000000}
                step={100000}
                value={draftFilters.priceRange}
                onValueChange={handlePriceChange}
                className="mt-4 w-full"
              />
              <div className="mt-2 flex justify-between text-sm text-slate-600">
                <span>{formatCurrency(draftFilters.priceRange[0])}</span>
                <span>{formatCurrency(draftFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Thời gian</Label>
            <DateRangePicker
              from={draftFilters.dateFrom}
              to={draftFilters.dateTo}
              onSelect={(from, to) => {
                setDraftFilters({
                  ...draftFilters,
                  dateFrom: from,
                  dateTo: to,
                });
              }}
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Danh mục</Label>
            <div className="mt-2 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={draftFilters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Địa điểm</Label>
            <Input
              placeholder="Nhập tên thành phố, địa điểm..."
              value={draftFilters.location || ""}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, location: e.target.value })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Áp dụng
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
