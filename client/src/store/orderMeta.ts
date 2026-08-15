import type { OrderStatus } from "./OrdersContext";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-sun-200 text-sun-700",
  confirmed: "bg-leaf-100 text-leaf-800",
  delivered: "bg-leaf-600 text-white",
  cancelled: "bg-stone-200 text-stone-500",
};
