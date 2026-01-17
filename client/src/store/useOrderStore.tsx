import { create } from 'zustand';
import type { Order } from '../types/order';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  selectedStatus: string;
  
  // Order Management
  addOrder: (order: Order) => void;
  setCurrentOrder: (order: Order | null) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  
  // Filtering
  getFilteredOrders: () => Order[];
  setSelectedStatus: (status: string) => void;
  
  // Stats
  getTodayStats: () => { revenue: number; orderCount: number; activeOrders: number };
  getOrderById: (id: string) => Order | undefined;
}

// Dummy initial orders
const DUMMY_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    tableNumber: 'T1',
    items: [
      {
        id: 'food-1',
        name: 'Veg Chowmein',
        quantity: 1,
        price: 180,
        category: 'Noodles',
        image: '🍜',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
      {
        id: 'drink-1',
        name: 'Coke',
        quantity: 2,
        price: 60,
        category: 'Beverage',
        image: '🥤',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
    ],
    totalAmount: 300,
    finalAmount: 300,
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    customerName: 'Ram Sharma',
  },

  {
    id: '2',
    orderNumber: 'ORD002',
    tableNumber: 'T2',
    items: [
      {
        id: 'food-2',
        name: 'Chicken Momo',
        quantity: 2,
        price: 150,
        category: 'Momo',
        image: '🥟',
        isVeg: false,
        isAvailable: true,
        isSpecial: false,
      },
      {
        id: 'drink-2',
        name: 'Sprite',
        quantity: 1,
        price: 60,
        category: 'Beverage',
        image: '🥤',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
    ],
    totalAmount: 360,
    finalAmount: 360,
    paymentStatus: 'paid',
    status: 'preparing',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    customerName: 'Sita Thapa',
  },

  {
    id: '3',
    orderNumber: 'ORD003',
    tableNumber: 'T3',
    items: [
      {
        id: 'food-3',
        name: 'Veg Spring Roll',
        quantity: 2,
        price: 130,
        category: 'Snacks',
        image: '🌯',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
      {
        id: 'drink-3',
        name: 'Tea',
        quantity: 2,
        price: 65,
        category: 'Beverage',
        image: '🍵',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
    ],
    totalAmount: 390,
    finalAmount: 390,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    customerName: 'Hari Poudel',
  },

  {
    id: '4',
    orderNumber: 'ORD004',
    tableNumber: 'T5',
    items: [
      {
        id: 'food-4',
        name: 'Chicken Pizza',
        quantity: 1,
        price: 550,
        category: 'Pizza',
        image: '🍕',
        isVeg: false,
        isAvailable: true,
        isSpecial: true,
      },
      {
        id: 'drink-4',
        name: 'Fanta',
        quantity: 2,
        price: 70,
        category: 'Beverage',
        image: '🥤',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
    ],
    totalAmount: 690,
    finalAmount: 690,
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    customerName: 'Gita Rai',
  },

  {
    id: '5',
    orderNumber: 'ORD005',
    tableNumber: 'WALK-IN',
    items: [
      {
        id: 'food-5',
        name: 'Pasta',
        quantity: 1,
        price: 190,
        category: 'Pasta',
        image: '🍝',
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
      },
      {
        id: 'food-6',
        name: 'Samosa',
        quantity: 2,
        price: 50,
        category: 'Snacks',
        image: '🥟',
        isVeg: true,
        isAvailable: true,
        isSpecial: true,
      },
    ],
    totalAmount: 290,
    finalAmount: 290,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    customerName: 'Krishna KC',
  },
];


export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: DUMMY_ORDERS,
  currentOrder: null,
  selectedStatus: 'all',

  // Add new order
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders]
  })),

  // Set current active order
  setCurrentOrder: (order) => set({ currentOrder: order }),

  // Update order details
  updateOrder: (id, updates) => set((state) => {
    const updatedOrders = state.orders.map(order =>
      order.id === id 
        ? { ...order, ...updates, updatedAt: new Date() }
        : order
    );

    // Also update currentOrder if it's the one being updated
    const updatedCurrentOrder = state.currentOrder?.id === id
      ? { ...state.currentOrder, ...updates, updatedAt: new Date() }
      : state.currentOrder;

    return {
      orders: updatedOrders,
      currentOrder: updatedCurrentOrder as Order | null
    };
  }),

  // Update order status
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === id 
        ? { 
            ...order, 
            status, 
            completedAt: status === 'completed' ? new Date() : order.completedAt,
            updatedAt: new Date()
          } 
        : order
    )
  })),

  // Delete order
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter(order => order.id !== id),
    currentOrder: state.currentOrder?.id === id ? null : state.currentOrder
  })),

  // Get filtered orders based on status
  getFilteredOrders: () => {
    const { orders, selectedStatus } = get();
    if (selectedStatus === 'all') return orders;
    return orders.filter(order => order.status === selectedStatus);
  },

  // Set filter status
  setSelectedStatus: (status) => set({ selectedStatus: status }),

  // Get today's statistics
  getTodayStats: () => {
    const { orders } = get();
    const today = new Date().setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
      return orderDate === today;
    });

    const activeOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'preparing'
    ).length;

    return {
      revenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      orderCount: todayOrders.length,
      activeOrders: activeOrders
    };
  },

  // Get order by ID
  getOrderById: (id) => {
    const { orders } = get();
    return orders.find(order => order.id === id);
  }
}));