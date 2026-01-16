import React from "react";
import { Plus, ScanLine, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: "Tạo sự kiện mới",
      color: "text-lime-600",
      bgColor: "bg-lime-50 hover:bg-lime-100",
      onClick: () => navigate("/organizer/create-event"),
    },
    {
      icon: ScanLine,
      label: "Quét mã QR",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      onClick: () => navigate("/organizer/checkin"),
    },
    {
      icon: Wallet,
      label: "Yêu cầu rút tiền",
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
      onClick: () => {
        // Placeholder for withdrawal feature
        alert("Tính năng rút tiền đang được phát triển");
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hành động nhanh</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className={`flex h-auto flex-col items-center gap-3 p-6 ${action.bgColor} border-0`}
              onClick={action.onClick}
            >
              <div
                className={`rounded-full bg-white p-3 ${action.color} shadow-sm`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {action.label}
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
