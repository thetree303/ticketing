import React, { useState } from "react";
import { QrCode, Search, CheckCircle, AlertCircle } from "lucide-react";
import { ticketService } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "../../components/QrScanner";

const OrganizerCheckIn: React.FC = () => {
  const [ticketCode, setTicketCode] = useState("");
  const [checkInMsg, setCheckInMsg] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<
    "success" | "error" | null
  >(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);

  const handleCheckIn = async (code?: string) => {
    const c = code || ticketCode;
    if (!c) return;
    try {
      const res = await ticketService.checkIn(c);
      setCheckInStatus("success");
      setCheckInMsg(
        `Hợp lệ! Khách: ${res.data.tickets?.purchaserName || "N/A"}`,
      );
    } catch (e: any) {
      setCheckInStatus("error");
      setCheckInMsg(e.response?.data?.message || "Vé không hợp lệ");
    }
  };

  const handleQrCheckIn = async (code: string) => {
    // Logic check in qua QR
    if (!code) return;
    setQrResult(null); // Reset để hiện loading
    try {
      const res = await ticketService.checkIn(code);
      // Backend trả về { success, message, tickets }
      setQrResult(res.data);
    } catch (e: any) {
      setQrResult({
        success: false,
        message: e.response?.data?.message || "Lỗi xác thực vé",
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pt-30">
      <Card className="overflow-hidden border-lime-50 text-center shadow-xl">
        <div className="h-1 w-full bg-linear-to-r from-lime-500 to-green-500" />
        <CardContent className="pt-8 pb-8">
          <div className="mb-6 inline-flex rounded-full bg-lime-50 p-5 text-lime-600">
            <QrCode size={48} />
          </div>
          <h2 className="mb-8 text-3xl font-bold">Soát vé vào cửa</h2>

          <Button
            onClick={() => setScannerOpen(true)}
            className="mb-6 h-14 w-full gap-3 bg-linear-to-r from-lime-600 to-green-600 text-lg"
          >
            <QrCode size={24} /> QUÉT MÃ QR
          </Button>

          <div className="mb-4 text-slate-500">Hoặc nhập mã vé thủ công</div>

          <div className="relative mb-4">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <Input
              placeholder="Nhập mã vé..."
              className="h-12 pl-12 text-lg"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
            />
          </div>
          <Button
            onClick={() => handleCheckIn()}
            className="h-12 w-full bg-slate-800"
          >
            KIỂM TRA VÉ
          </Button>

          {checkInMsg && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-left ${
                checkInStatus === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {checkInStatus === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <p className="font-medium">{checkInMsg}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quét QR</DialogTitle>
          </DialogHeader>
          <QrScanner
            onScanSuccess={handleQrCheckIn}
            onRescan={() => setQrResult(null)}
            onClose={() => setScannerOpen(false)}
            checkInResult={qrResult}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerCheckIn;
