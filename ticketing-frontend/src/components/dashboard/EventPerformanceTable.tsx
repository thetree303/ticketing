import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type EventPerformance } from "../../types";

interface Props {
  events: EventPerformance[];
}

export const EventPerformanceTable: React.FC<Props> = ({ events }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getCheckInBadge = (rate: number) => {
    if (rate >= 80)
      return <Badge className="bg-green-500">Xuất sắc {rate}%</Badge>;
    if (rate >= 60) return <Badge className="bg-blue-500">Tốt {rate}%</Badge>;
    return <Badge variant="secondary">Trung bình {rate}%</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết hiệu suất sự kiện</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sự kiện</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Vé bán/Tổng</TableHead>
                <TableHead className="text-right">Tỷ lệ check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {event.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatCurrency(event.revenue)}
                      {event.revenue > 5000000 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {event.soldTickets}/{event.totalTickets}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{
                            width: `${
                              event.totalTickets > 0
                                ? (event.soldTickets / event.totalTickets) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {getCheckInBadge(event.checkInRate || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
