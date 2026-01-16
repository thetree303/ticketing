import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  eventService,
  categoryService,
  ticketTypeService,
} from "../../services/api";
import {
  MultiStepEventForm,
  type TicketType,
} from "../../components/MultiStepEventForm";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const OrganizerCreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveEvent = async (data: FormData, tickets: TicketType[]) => {
    try {
      console.log("Sending FormData to backend...");

      const res = await eventService.create(data);
      const savedEventId = res.data.id;

      if (savedEventId && tickets.length > 0) {
        const ticketPromises = tickets.map((ticket) =>
          ticketTypeService.create({
            eventId: savedEventId,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            initialQuantity: ticket.quantity,
            numPerOrder: ticket.numPerOrder,
            maxPerOrder: ticket.maxPerOrder,
          }),
        );
        await Promise.all(ticketPromises);
      }

      toast.success("Tạo sự kiện thành công!");
      // Clear any existing drafts
      localStorage.removeItem("event-form-draft");
      navigate("/organizer/events");
    } catch (error: any) {
      console.error(error);
      // Hiển thị lỗi chi tiết hơn
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        toast.error(message[0]); 
      } else {
        toast.error(message || "Có lỗi xảy ra.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo sự kiện mới</h1>
          <p className="text-slate-500">
            Điền thông tin để tạo sự kiện của bạn
          </p>
        </div>
      </div>

      <Card className="p-6">
        <MultiStepEventForm
          onClose={() => navigate("/organizer/events")}
          onSubmit={handleSaveEvent}
          categories={categories}
        />
      </Card>
    </div>
  );
};

export default OrganizerCreateEvent;
