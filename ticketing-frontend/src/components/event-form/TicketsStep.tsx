// Step 3: Tickets & Banking
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { DateTimePicker } from "../ui/datetime-picker";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  numPerOrder: number;
  description: string;
}

interface TicketsStepProps {
  form: UseFormReturn<any>;
  tickets: TicketType[];
  releaseDate: Date | null;
  closingDate: Date | null;
  onReleaseDateChange: (date: Date | null) => void;
  onClosingDateChange: (date: Date | null) => void;
  onAddTicket: () => void;
  onRemoveTicket: (index: number) => void;
  onTicketChange: (
    index: number,
    field: keyof TicketType,
    value: string | number,
  ) => void;
}

export function TicketsStep({
  form,
  tickets,
  releaseDate,
  closingDate,
  onReleaseDateChange,
  onClosingDateChange,
  onAddTicket,
  onRemoveTicket,
  onTicketChange,
}: TicketsStepProps) {
  const {
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Ticket Types Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Loại vé</h3>
            <p className="text-muted-foreground text-sm">
              Thêm các loại vé khác nhau cho sự kiện
            </p>
          </div>
          <Button type="button" onClick={onAddTicket} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm loại vé
          </Button>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Chưa có loại vé nào. Nhấn "Thêm loại vé" để bắt đầu.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <h4 className="font-medium">Loại vé #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveTicket(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tên loại vé</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) =>
                          onTicketChange(index, "name", e.target.value)
                        }
                        placeholder="VD: VIP, Standard"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Giá vé (VNĐ)</Label>
                      <Input
                        type="number"
                        value={ticket.price}
                        onChange={(e) =>
                          onTicketChange(
                            index,
                            "price",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          onTicketChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 space-y-2">
                      <div>
                        <Label>SL / Đơn hàng</Label>
                        <Input
                          type="number"
                          value={ticket.numPerOrder}
                          defaultValue={1}
                          onChange={(e) =>
                            onTicketChange(
                              index,
                              "numPerOrder",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label>MAX / Đơn hàng</Label>
                        <Input
                          type="number"
                          value={ticket.maxPerOrder}
                          defaultValue={4}
                          onChange={(e) =>
                            onTicketChange(
                              index,
                              "maxPerOrder",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Mô tả</Label>
                      <Input
                        value={ticket.description}
                        onChange={(e) =>
                          onTicketChange(index, "description", e.target.value)
                        }
                        placeholder="Mô tả ngắn về loại vé này"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chọn ngày mở bán và đóng bán */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Ngày mở bán</h3>
          <p className="text-muted-foreground text-sm">
            Lựa chọn ngày và giờ mở bán vé, đóng bán vé cho sự kiện
          </p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Thời gian mở bán <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={releaseDate}
                setDate={onReleaseDateChange}
                placeholder="Chọn ngày và giờ bắt đầu"
              />
              {errors.releaseDate && (
                <p className="text-sm text-red-500">
                  {errors.releaseDate.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Thời gian đóng bán <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={closingDate}
                setDate={onClosingDateChange}
                placeholder="Chọn ngày và giờ đóng bán"
              />
              {errors.closingDate && (
                <p className="text-sm text-red-500">
                  {errors.closingDate.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
