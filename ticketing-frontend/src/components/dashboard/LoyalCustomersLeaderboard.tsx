import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LoyalCustomer } from "../../types";

interface LoyalCustomersProps {
  data: LoyalCustomer[];
}

export const LoyalCustomersLeaderboard: React.FC<LoyalCustomersProps> = ({
  data,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Khách hàng thân thiết</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Chưa có dữ liệu khách hàng
          </p>
        ) : (
          data.map((customer) => (
            <div key={customer.id} className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                <img
                  src={
                    customer.avatar ||
                    `https://placehold.co/300x300/68A61C/ffffff?text=${encodeURIComponent(
                      customer.name[0],
                    )}`
                  }
                  alt={customer.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm leading-none font-medium">
                  {customer.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {customer.email}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {formatCurrency(customer.totalSpent)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
