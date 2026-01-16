import type { CartItem } from "./cart";

export interface Order {
    id: string;
    tableNumber: string;
    items: CartItem[];
    totalAmount: number;
    status: 'pending' | 'preparing' | 'completed' | 'cancelled';
    createdAt: Date;
    completedAt?: Date;
    customerName?: string;
  }