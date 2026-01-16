import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { MenuItem } from "../types/menu";

// Define the structure of a customer order
interface CustomerOrder {
  id: string;                // internal unique ID
  orderNumber: string;       // display order number (4-digit)
  items: (MenuItem & { quantity: number })[];
  totalAmount: number;       // sum of item prices
  finalAmount?: number;      // can include discounts/tax
  status?: "pending" | "preparing" | "completed"; // optional
  createdAt: Date;
}

interface CustomerOrderStore {
  orders: CustomerOrder[];
  createOrder: (items: (MenuItem & { quantity: number })[]) => CustomerOrder;
  getOrderById: (id: string) => CustomerOrder | undefined;
  updateOrderStatus: (id: string, status: "pending" | "preparing" | "completed") => void;
}

export const useCustomerOrderStore = create<CustomerOrderStore>((set, get) => ({
  orders: [],

  // Create a new order
  createOrder: (items) => {
    const id = uuid();
    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder: CustomerOrder = {
      id,
      orderNumber,
      items,
      totalAmount,
      finalAmount: totalAmount,
      status: "pending",
      createdAt: new Date(),
    };

    set({ orders: [...get().orders, newOrder] });
    return newOrder;
  },

  // Get order by ID
  getOrderById: (id) => get().orders.find((o) => o.id === id),

  // Update order status
  updateOrderStatus: (id, status) => {
    set({
      orders: get().orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    });
  },
}));
