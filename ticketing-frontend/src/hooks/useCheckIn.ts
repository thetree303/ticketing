import { useState } from "react";
import { ticketService } from "../services/api";

export const useCheckIn = () => {
  const [ticketCode, setTicketCode] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!ticketCode) return;
    setLoading(true);
    setCheckInStatus("idle");
    try {
      await new Promise((r) => setTimeout(r, 500));
      const res = await ticketService.checkIn(ticketCode);
      setCheckInStatus("success");
      setCheckInMessage(
        `Vé hợp lệ! Khách hàng: ${res.data.ticketInfo?.id || "Ẩn danh"}`,
      );
    } catch (error: any) {
      setCheckInStatus("error");
      setCheckInMessage(error.response?.data?.message || "Vé không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  return {
    ticketCode,
    setTicketCode,
    checkInStatus,
    checkInMessage,
    loading,
    handleCheckIn,
  };
};
