import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type EventComparison } from "../../types";

interface Props {
  events: EventComparison[];
}

export const EventComparisonChart: React.FC<Props> = ({ events }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>So sánh doanh thu giữa các sự kiện</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350} debounce={250}>
          <BarChart data={events}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number | undefined) =>
                formatCurrency(value || 0)
              }
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Doanh thu"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              barSize={40}
            />
            <Bar
              dataKey="ticketsSold"
              name="Vé đã bán"
              fill="hsl(var(--chart-2))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
