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
    tableNumber: 'T1',
    items: [
      {
        id: 'food-1',
        name: 'Veg Chowmein',
        quantity: 1,
        price: 180,
        category: 'Noodles',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'drink-1',
        name: 'Coke',
        quantity: 2,
        price: 60,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'food-2',
        name: 'Momo',
        quantity: 1,
        price: 150,
        category: 'Snacks',
        image: '',
        isVeg: true,
        isAvailable: true
      }
    ],
    totalAmount: 450,
    status: 'pending',
    createdAt: new Date(Date.now() - 600000),
    customerName: 'Ram Sharma'
  },
  {
    id: '2',
    tableNumber: 'C2',
    items: [
      {
        id: 'food-3',
        name: 'Chicken Burger',
        quantity: 2,
        price: 250,
        category: 'Burger',
        image: '',
        isVeg: false,
        isAvailable: true
      },
      {
        id: 'food-4',
        name: 'Fries',
        quantity: 1,
        price: 80,
        category: 'Snacks',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'drink-2',
        name: 'Sprite',
        quantity: 1,
        price: 60,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'drink-3',
        name: 'Coffee',
        quantity: 1,
        price: 140,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      }
    ],
    totalAmount: 780,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1500000),
    customerName: 'Sita Thapa'
  },
  {
    id: '3',
    tableNumber: 'T3',
    items: [
      {
        id: 'food-5',
        name: 'Egg Roll',
        quantity: 1,
        price: 120,
        category: 'Snacks',
        image: '',
        isVeg: false,
        isAvailable: true
      },
      {
        id: 'drink-4',
        name: 'Tea',
        quantity: 2,
        price: 65,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      }
    ],
    totalAmount: 250,
    status: 'completed',
    createdAt: new Date(Date.now() - 2700000),
    customerName: 'Hari Poudel'
  },
  {
    id: '4',
    tableNumber: 'T5',
    items: [
      {
        id: 'food-6',
        name: 'Chicken Pizza',
        quantity: 1,
        price: 550,
        category: 'Pizza',
        image: '',
        isVeg: false,
        isAvailable: true
      },
      {
        id: 'drink-5',
        name: 'Fanta',
        quantity: 2,
        price: 70,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'food-7',
        name: 'Ice Cream',
        quantity: 2,
        price: 115,
        category: 'Dessert',
        image: '',
        isVeg: true,
        isAvailable: true
      }
    ],
    totalAmount: 920,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1200000),
    customerName: 'Gita Rai'
  },
  {
    id: '5',
    tableNumber: 'C1',
    items: [
      {
        id: 'food-8',
        name: 'Pasta',
        quantity: 2,
        price: 190,
        category: 'Pasta',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'drink-6',
        name: 'Lassi',
        quantity: 1,
        price: 70,
        category: 'Beverage',
        image: '',
        isVeg: true,
        isAvailable: true
      },
      {
        id: 'food-9',
        name: 'Samosa',
        quantity: 2,
        price: 100,
        category: 'Snacks',
        image: '',
        isVeg: true,
        isAvailable: true
      }
    ],
    totalAmount: 650,
    status: 'pending',
    createdAt: new Date(Date.now() - 300000),
    customerName: 'Krishna KC'
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