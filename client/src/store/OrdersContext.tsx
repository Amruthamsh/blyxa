import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { OrdersContext } from "./ordersContextValue";

const STORAGE_KEY = "blyxa.orders.v1";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  placedAt: string;
  name: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export interface NewOrder {
  name: string;
  note: string;
  items: OrderItem[];
  total: number;
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return [];
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // storage may be unavailable; ignore
    }
  }, [orders]);

  const addOrder = (order: NewOrder): Order => {
    const full: Order = {
      id: `order-${Date.now()}`,
      placedAt: new Date().toISOString(),
      status: "pending",
      ...order,
    };
    setOrders((current) => [full, ...current]);
    return full;
  };

  const setStatus = (id: string, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((current) => current.filter((order) => order.id !== id));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, setStatus, deleteOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}
