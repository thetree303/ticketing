// Step 4: Review
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Ticket,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";

interface ReviewStepProps {
  form: UseFormReturn<any>;
  categories: any[];
  imagePreview: string | null;
  startDate: Date | null;
  endDate: Date | null;
  tickets: any[];
  releaseDate: Date | null;
  closingDate: Date | null;
}

export function ReviewStep({
  form,
  categories,
  imagePreview,
  startDate,
  endDate,
  releaseDate,
  closingDate,
  tickets,
}: ReviewStepProps) {
  const formData = form.getValues();
  const category = categories.find((c) => c.id === formData.categoryId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold">Xem lại thông tin sự kiện</h3>
        <p className="text-muted-foreground text-sm">
          Kiểm tra kỹ thông tin trước khi tạo sự kiện
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview && (
            <div className="flex items-center gap-4">
              <ImageIcon className="text-muted-foreground h-5 w-5" />
              <div className="flex-1">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Tên sự kiện
            </p>
            <p className="text-xl font-medium">{formData.title || "—"}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm font-medium">Mô tả</p>
            <p className="mt-1">{formData.description || "—"}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Danh mục
            </p>
            <Badge variant="secondary" className="mt-1">
              {category?.name || "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Date & Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Thời gian & Địa điểm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Bắt đầu
                </p>
                <p className="text-lg font-bold">
                  {startDate
                    ? format(startDate, "dd/MM/yyyy HH:mm", { locale: vi })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Kết thúc
                </p>
                <p className="text-lg font-bold">
                  {endDate
                    ? format(endDate, "dd/MM/yyyy HH:mm", { locale: vi })
                    : "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Địa điểm
              </p>
              <p className="mt-1 text-lg font-bold">
                {formData.venue || "—"}
              </p>
              {formData.address && (
                <p className="text-muted-foreground text-sm">
                  {formData.address}
                </p>
              )}
              {formData.city && (
                <p className="text-muted-foreground text-sm">{formData.city}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4" />
              Loại vé ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-lg font-bold">{ticket.name}</p>
                    {ticket.description && (
                      <p className="text-muted-foreground text-sm">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(ticket.price)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      SL: {ticket.quantity}
                    </p>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-4 border-t px-2 pt-4 xl:grid-cols-3">
                <div>
                  <p className="text-muted-foreground font-medium">
                    Tổng số vé
                  </p>
                  <p className="text-xl font-bold">
                    {tickets.reduce((sum, t) => sum + t.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Mở bán</p>
                  <p className="text-lg font-bold">
                    {releaseDate
                      ? format(releaseDate, "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground font-medium">Đóng bán</p>
                  <p className="text-lg font-bold">
                    {closingDate
                      ? format(closingDate, "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banking Info */}
      {(formData.bankName ||
        formData.accountNumber ||
        formData.accountName) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.bankName && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Ngân hàng
                </p>
                <p className="mt-1">{formData.bankName}</p>
              </div>
            )}
            {formData.accountNumber && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Số tài khoản
                </p>
                <p className="mt-1">{formData.accountNumber}</p>
              </div>
            )}
            {formData.accountName && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Chủ tài khoản
                </p>
                <p className="mt-1">{formData.accountName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
