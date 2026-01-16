import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { RefreshCcw, ScanLine, AlertTriangle, CheckCircle } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  onRescan?: () => void;
  onClose?: () => void;
  checkInResult?: {
    success?: boolean;
    message: string;
    tickets?: {
      id: number;
      uniqueCode?: string;
      eventTitle?: string;
      ticketType?: string;
      seatNumber?: string;
      purchaserName?: string;
      purchaserEmail?: string;
      purchaserPhone?: string;
      checkinTime?: string;
    };
  };
}

const QrScanner: React.FC<QrScannerProps> = ({
  onScanSuccess,
  onRescan,
  checkInResult,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");

  // 1. Ref để giữ thư viện
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // 2. Ref để "bắt giữ" luồng Camera vật lý
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        setStartError(null);
        // Đảm bảo DOM đã sẵn sàng
        const elementId = "qr-reader-video";
        if (!document.getElementById(elementId)) {
          console.warn("QR Scanner element not found");
          return;
        }

        const html5QrCode = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10, // Tăng nhẹ lên 10 để mượt hơn, vẫn an toàn
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.8),
                height: Math.floor(minEdge * 0.8),
              };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted && isScanning) {
              // Dừng quét ngay lập tức để tránh double-scan
              html5QrCode.pause();
              setIsScanning(false);
              setLastScannedCode(decodedText);
              onScanSuccess(decodedText);
            }
          },
          () => {}, // Ignore errors frame-by-frame
        );

        // --- BẮT GIỮ STREAM NGAY KHI KHỞI ĐỘNG THÀNH CÔNG ---
        const videoElement = document.querySelector(
          `#${elementId} video`,
        ) as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
          mediaStreamRef.current = videoElement.srcObject as MediaStream;
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Lỗi khởi động camera:", err);
          // Xử lý các lỗi phổ biến
          let errorMessage = "Không thể truy cập Camera.";
          if (err?.name === "NotAllowedError") {
            errorMessage =
              "Bạn đã chặn quyền truy cập Camera. Vui lòng bật lại trong cài đặt trình duyệt.";
          } else if (err?.name === "NotFoundError") {
            errorMessage = "Không tìm thấy Camera trên thiết bị này.";
          }
          setStartError(errorMessage);
        }
      }
    };

    startScanner();

    // --- CLEANUP (DỌN DẸP) ---
    return () => {
      isMounted = false;

      // 1. Tắt bằng thư viện
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current
              .stop()
              .catch((e) => console.warn("Stop failed", e))
              .finally(() => scannerRef.current?.clear());
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {
          console.warn("Cleanup error", e);
        }
      }

      // 2. Tắt bằng ref đã lưu
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        mediaStreamRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRescan = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onRescan) onRescan();

    // Reset UI ngay lập tức
    setIsScanning(true);
    setLastScannedCode("");

    if (scannerRef.current) {
      try {
        // Đợi 800ms mới resume để tránh quét lại mã cũ ngay lập tức
        setTimeout(() => {
          if (scannerRef.current) {
            try {
              // Chỉ resume nếu đang ở trạng thái PAUSED (4) hoặc tương đương
              scannerRef.current.resume();
            } catch (err) {
              console.warn("Resume failed, trying to restart...", err);
            }
          }
        }, 800);
      } catch (e) {
        console.warn("Handle rescan error", e);
      }
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-4 border-slate-900 bg-black shadow-2xl">
      {/* Video Container */}
      <div className="relative h-[400px] w-full bg-black">
        {startError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold">Lỗi Camera</h3>
            <p className="mx-auto max-w-[250px] text-sm text-slate-400">
              {startError}
            </p>
          </div>
        ) : (
          /* ID này quan trọng để thư viện mount vào */
          <div id="qr-reader-video" className="h-full w-full object-cover" />
        )}

        {/* Overlay scanning animation */}
        {!startError && isScanning && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="relative h-56 w-56 rounded-xl border-2 border-white/20">
              {/* 4 góc xanh lá */}
              <div className="absolute top-0 left-0 -mt-[2px] -ml-[2px] h-6 w-6 rounded-tl-sm border-t-4 border-l-4 border-green-500"></div>
              <div className="absolute top-0 right-0 -mt-[2px] -mr-[2px] h-6 w-6 rounded-tr-sm border-t-4 border-r-4 border-green-500"></div>
              <div className="absolute bottom-0 left-0 -mb-[2px] -ml-[2px] h-6 w-6 rounded-bl-sm border-b-4 border-l-4 border-green-500"></div>
              <div className="absolute right-0 bottom-0 -mr-[2px] -mb-[2px] h-6 w-6 rounded-br-sm border-r-4 border-b-4 border-green-500"></div>

              {/* Laser beam quét lên xuống */}
              <div className="animate-scan absolute top-1/2 right-0 left-0 h-[2px] w-full bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)]"></div>
            </div>
            <p className="absolute bottom-10 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
              Di chuyển mã QR vào giữa khung
            </p>
          </div>
        )}

        {/* Result screen - Hiển thị kết quả checkin */}
        {!startError && !isScanning && (
          <div className="animate-in fade-in zoom-in absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-md duration-200">
            {/* TRẠNG THÁI: THÀNH CÔNG */}
            {checkInResult?.success === true && (
              <div className="flex w-full max-w-xs flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-green-400">
                  Vé Hợp Lệ
                </h3>
                <div className="mb-6 w-full rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="line-clamp-1 text-base font-semibold text-white">
                    {checkInResult.tickets?.eventTitle || "unknown"}
                  </p>
                  <p className="text-sm text-slate-300">
                    Loại vé: {checkInResult.tickets?.ticketType || "unknown"}{" "}
                    {checkInResult.tickets?.seatNumber &&
                      ` - Ghế: ${checkInResult.tickets.seatNumber}`}
                  </p>
                  <p className="mt-2 font-mono text-xs break-all text-green-200">
                    Mã vé: {lastScannedCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRescan}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black shadow-lg transition-all hover:bg-slate-200 active:scale-95"
                >
                  <RefreshCcw size={18} /> Tiếp tục quét
                </button>
              </div>
            )}

            {/* TRẠNG THÁI: LỖI */}
            {checkInResult?.success === false && (
              <div className="flex w-full max-w-xs flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                  <AlertTriangle className="text-white" size={40} />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-red-400">
                  Vé không Hợp Lệ
                </h3>
                <div className="mb-6 w-full rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm font-medium break-words text-red-200">
                    {checkInResult.message}
                  </p>
                  <p className="mt-2 font-mono text-xs break-all text-red-300/60">
                    Mã vé: {lastScannedCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRescan}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black shadow-lg transition-all hover:bg-slate-200 active:scale-95"
                >
                  <RefreshCcw size={18} /> Thử lại
                </button>
              </div>
            )}

            {/* TRẠNG THÁI: MẶC ĐỊNH (KHI VỪA QUÉT XONG, CHƯA CÓ KẾT QUẢ TỪ API) */}
            {!checkInResult && (
              <div className="flex w-full max-w-xs flex-col items-center">
                <div className="relative mb-4 h-16 w-16">
                  <div className="absolute inset-0 animate-pulse rounded-full border-4 border-blue-500/30"></div>
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <ScanLine
                    className="absolute inset-0 m-auto text-blue-500"
                    size={24}
                  />
                </div>
                <h3 className="mb-1 text-lg font-bold text-white">
                  Đang kiểm tra...
                </h3>
                <p className="text-sm text-slate-400">
                  Hệ thống đang xác thực vé
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
