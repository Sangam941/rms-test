import api from "./axios";

// Create a new order
export const createOrder = async (payload: {
    tableCode?: string;
    customerType: "DINE-IN" | "WALK-IN" | "ONLINE";
    items: { menuItemId: string; quantity: number }[];
    customerName?: string;
    mobileNumber?: string;
  }) => {
    const response = await api.post("/orders", payload);
    return response.data; // returns the created order
  };
  
  // Fetch all orders (for admin)
  export const getOrders = async () => {
    const response = await api.get("/admin/orders/active");
    return response.data; // returns array of orders
  };
  
  // Fetch single order by ID
  export const getOrderById = async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  };
  
  // Update order status (admin)
  export const updateOrderStatusToPreparing = async (
    orderId: string
  ) => {
    const response = await api.patch(`/admin/orders/${orderId}/preparing`);
    return response.data;
  };
  // Update order status (admin)
  export const updateOrderStatusToServe = async (
    orderId: string
  ) => {
    const response = await api.patch(`/admin/orders/${orderId}/serve`);
    return response.data;
  };


  