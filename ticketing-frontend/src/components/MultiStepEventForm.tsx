import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stepper, type Step } from "@/components/ui/stepper";
import { BasicInfoStep } from "./event-form/BasicInfoStep";
import { DateTimeStep } from "./event-form/DateTimeStep";
import { TicketsStep } from "./event-form/TicketsStep";
import { ReviewStep } from "./event-form/ReviewStep";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// Validation
const eventSchema = z.object({
  title: z.string().min(1, "Tên sự kiện không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
  venue: z.string().min(1, "Địa điểm không được để trống"),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.coerce.number().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  numPerOrder: number;
  description: string;
}

interface MultiStepEventFormProps {
  onClose: () => void;
  onSubmit: (eventData: FormData, tickets: TicketType[]) => void;
  categories: any[];
  initialData?: any;
}

const steps: Step[] = [
  { id: 1, label: "Thông tin cơ bản", description: "Tên, mô tả, danh mục" },
  { id: 2, label: "Thời gian & Địa điểm", description: "Ngày giờ, venue" },
  { id: 3, label: "Vé & Thanh toán", description: "Loại vé, ngân hàng" },
  { id: 4, label: "Xem lại", description: "Kiểm tra thông tin" },
];

const DRAFT_STORAGE_KEY = "event-form-draft";

export function MultiStepEventForm({
  onClose,
  onSubmit,
  categories,
  initialData,
}: MultiStepEventFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.bannerUrl || null,
  );
  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.startTime ? new Date(initialData.startTime) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData?.endTime ? new Date(initialData.endTime) : null,
  );
  const [releaseDate, setReleaseDate] = useState<Date | null>(
    initialData?.releaseDate ? new Date(initialData.releaseDate) : null,
  );
  const [closingDate, setClosingDate] = useState<Date | null>(
    initialData?.closingDate ? new Date(initialData.closingDate) : null,
  );
  const [tickets, setTickets] = useState<TicketType[]>([
    {
      name: "Standard",
      price: 0,
      quantity: 100,
      maxPerOrder: 4,
      numPerOrder: 1,
      description: "",
    },
  ]);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [showFreeTicketWarning, setShowFreeTicketWarning] =
    useState<string[]>();
  const [hasConfirmedFreeTicket, setHasConfirmedFreeTicket] = useState(false);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      categoryId: initialData?.category?.id || 0,
      venue: initialData?.venueName || "",
      address: initialData?.address || "",
      city: "",
      capacity: initialData?.capacity || undefined,
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
  });

  // Tải dữ liệu nháp từ localstorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setShowDraftAlert(true);
      } catch (error) {
        console.error("Error parsing draft:", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []);

  // Tự động lưu vào localstorage khi dữ liệu thay đổi
  useEffect(() => {
    const subscription = form.watch((data) => {
      const draftToSave = {
        formData: data,
        currentStep,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        releaseDate: releaseDate?.toISOString(),
        closingDate: closingDate?.toISOString(),
        tickets,
        imagePreview,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
    });
    return () => subscription.unsubscribe();
  }, [
    form,
    currentStep,
    startDate,
    endDate,
    releaseDate,
    closingDate,
    tickets,
    imagePreview,
  ]);

  const restoreDraft = () => {
    if (draftData) {
      form.reset(draftData.formData);

      setCurrentStep(draftData.currentStep || 1);
      if (draftData.startDate) setStartDate(new Date(draftData.startDate));
      if (draftData.endDate) setEndDate(new Date(draftData.endDate));
      if (draftData.releaseDate)
        setReleaseDate(new Date(draftData.releaseDate));
      if (draftData.closingDate)
        setClosingDate(new Date(draftData.closingDate));
      if (draftData.tickets) setTickets(draftData.tickets);
      if (draftData.imagePreview) setImagePreview(draftData.imagePreview);

      toast.success("Đã khôi phục bản nháp!");
    }
    setShowDraftAlert(false);
  };

  const dismissDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setShowDraftAlert(false);
    toast.info("Đã xóa bản nháp");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTicket = () => {
    setTickets([
      ...tickets,
      {
        name: "",
        price: 0,
        quantity: 100,
        description: "",
        maxPerOrder: 4,
        numPerOrder: 1,
      },
    ]);
    setHasConfirmedFreeTicket(false);
  };

  const handleRemoveTicket = (index: number) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((_, i) => i !== index));
      setHasConfirmedFreeTicket(false);
    } else {
      toast.error("Phải có ít nhất một loại vé");
    }
  };

  const handleTicketChange = (
    index: number,
    field: keyof TicketType,
    value: string | number,
  ) => {
    const updated = [...tickets];
    updated[index] = { ...updated[index], [field]: value };
    setTickets(updated);
    setHasConfirmedFreeTicket(false);
  };

  const validateCurrentStep = async () => {
    let isValid = true;
    const now = new Date();

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(["title", "description", "categoryId"]);
        break;
      case 2:
        isValid = await form.trigger(["venue"]);
        if (!startDate || !endDate) {
          toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
          isValid = false;
        }
        if (isValid && startDate && endDate && startDate >= endDate) {
          toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
          isValid = false;
        }
        if (isValid && startDate && startDate <= now) {
          toast.error("Thời gian bắt đầu phải là trong tương lai");
          isValid = false;
        }
        if (isValid && endDate && endDate <= now) {
          toast.error("Thời gian kết thúc phải là trong tương lai");
          isValid = false;
        }
        break;
      case 3: {
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất một loại vé");
          isValid = false;
        }
        const hasEmptyTicket = tickets.some(
          (t) => !t.name || t.price < 0 || t.quantity <= 0,
        );
        if (hasEmptyTicket) {
          toast.error("Vui lòng điền đầy đủ thông tin vé (Giá vé phải từ 0đ)");
          isValid = false;
        }

        const hasFreeTicket = tickets.some((t) => t.price === 0);
        if (isValid && hasFreeTicket && !hasConfirmedFreeTicket) {
          setShowFreeTicketWarning(
            tickets.filter((t) => t.price === 0).map((t) => t.name),
          );
          isValid = false;
        }

        if (!releaseDate) {
          toast.error("Vui lòng chọn thời gian mở bán vé");
          isValid = false;
        }
        if (!closingDate) {
          toast.error("Vui lòng chọn thời gian đóng bán vé");
          isValid = false;
        }
        if (releaseDate && closingDate && releaseDate >= closingDate) {
          toast.error("Thời gian đóng bán phải sau thời gian mở bán");
          isValid = false;
        }
        if (isValid && releaseDate && releaseDate <= now) {
          toast.error("Thời gian mở bán vé phải là trong tương lai");
          isValid = false;
        }
        if (isValid && closingDate && closingDate <= now) {
          toast.error("Thời gian đóng bán vé phải là trong tương lai");
          isValid = false;
        }
        if (isValid && startDate && releaseDate && releaseDate >= startDate) {
          toast.error(
            "Thời gian mở bán vé phải trước thời gian bắt đầu sự kiện",
          );
          isValid = false;
        }
        if (isValid && endDate && closingDate && closingDate >= endDate) {
          toast.error(
            "Thời gian đóng bán vé phải trước thời gian kết thúc sự kiện",
          );
          isValid = false;
        }
        break;
      }
      case 4:
        break;
    }

    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const formData = new FormData();
    const values = form.getValues();

    // Append form data
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("categoryId", values.categoryId.toString());
    formData.append("venueName", values.venue);
    if (values.address) formData.append("address", values.address);
    if (values.city) formData.append("city", values.city);
    if (values.capacity)
      formData.append("capacity", values.capacity.toString());

    if (startDate) formData.append("startTime", startDate.toISOString());
    if (endDate) formData.append("endTime", endDate.toISOString());
    if (releaseDate) formData.append("releaseDate", releaseDate.toISOString());
    if (closingDate) formData.append("closingDate", closingDate.toISOString());

    if (imageFile) {
      formData.append("file", imageFile);
    }
    // Xóa dữ liệu nháp khi submit thành công
    localStorage.removeItem(DRAFT_STORAGE_KEY);

    onSubmit(formData, tickets);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            form={form}
            categories={categories}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />
        );
      case 2:
        return (
          <DateTimeStep
            form={form}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        );
      case 3:
        return (
          <TicketsStep
            form={form}
            tickets={tickets}
            releaseDate={releaseDate}
            closingDate={closingDate}
            onReleaseDateChange={setReleaseDate}
            onClosingDateChange={setClosingDate}
            onAddTicket={handleAddTicket}
            onRemoveTicket={handleRemoveTicket}
            onTicketChange={handleTicketChange}
          />
        );
      case 4:
        return (
          <ReviewStep
            form={form}
            categories={categories}
            imagePreview={imagePreview}
            startDate={startDate}
            endDate={endDate}
            releaseDate={releaseDate}
            closingDate={closingDate}
            tickets={tickets}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Restoration Alert */}
      {showDraftAlert && (
        <Alert>
          <AlertTitle className="text-md flex items-center gap-x-2 text-lg font-medium">
            <AlertCircle className="h-6 w-6" />
            Tìm thấy bản nháp
          </AlertTitle>
          <AlertDescription className="p flex items-center justify-between">
            <span className="text-md">
              Bạn có muốn khôi phục bản nháp đã lưu không?
              {draftData?.timestamp && (
                <span className="text-muted-foreground ml-2 text-xs">
                  (Lưu lúc:{" "}
                  {new Date(draftData.timestamp).toLocaleString("vi-VN")})
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={dismissDraft}>
                Không
              </Button>
              <Button size="sm" onClick={restoreDraft}>
                Khôi phục
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onClose : handleBack}
        >
          {currentStep === 1 ? (
            "Hủy"
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            Bước {currentStep} / {steps.length}
          </span>
        </div>

        {currentStep < 4 ? (
          <Button type="button" onClick={handleNext}>
            Tiếp theo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit}>
            <Check className="h-4 w-4" />
            Gửi duyệt
          </Button>
        )}
      </div>

      {/* Free Ticket Warning Dialog */}
      <AlertDialog
        open={!!showFreeTicketWarning?.length}
        onOpenChange={(open) => {
          if (!open) setShowFreeTicketWarning(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cảnh báo vé miễn phí</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                Bạn đang tạo vé <b>{showFreeTicketWarning?.join(", ")}</b> với
                giá <b>0đ (miễn phí)</b>.
              </p>
              <p>Bạn có chắc chắn muốn tiếp tục không?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasConfirmedFreeTicket(true);
                setCurrentStep(currentStep + 1);
              }}
            >
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
