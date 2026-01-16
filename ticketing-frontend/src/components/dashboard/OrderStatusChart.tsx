import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type OrderStatus } from "@/types";
import { ORDER_STATUS_BADGE_STYLE } from "@/lib/statusConstant";

interface OrderStatusChartProps {
  data: Array<{ name: OrderStatus; value: number }>;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const getColor = (status: OrderStatus) => {
    return ORDER_STATUS_BADGE_STYLE[status]?.color || "gray";
  };

  const getLabel = (status: OrderStatus) => {
    return ORDER_STATUS_BADGE_STYLE[status]?.label || status;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%" debounce={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                value,
                getLabel(name as OrderStatus),
              ]}
            />
            <Legend formatter={(value) => getLabel(value as OrderStatus)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
