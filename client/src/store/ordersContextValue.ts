import { createContext, useContext } from "react";
import type { Order, OrderStatus } from "./OrdersContext";
import type { NewOrder } from "./OrdersContext";

export interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: NewOrder) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
}

export const OrdersContext = createContext<OrdersContextValue | null>(null);

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
