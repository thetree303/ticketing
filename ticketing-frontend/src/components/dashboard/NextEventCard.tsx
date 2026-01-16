import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NextEventProps {
  event: {
    id: number;
    name: string;
    date: string;
    location: string;
  } | null;
}

export const NextEventCard: React.FC<NextEventProps> = ({ event }) => {
  if (!event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">
            Sự kiện sắp diễn ra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">Chưa có sự kiện sắp diễn ra</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-500">
          Sự kiện sắp diễn ra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {event.name}
        </h3>

        <div className="border-t border-slate-100 pt-2">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Còn{" "}
            {Math.max(
              0,
              Math.ceil(
                (new Date(event.date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )}{" "}
            ngày
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
