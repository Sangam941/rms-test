import api from "./axios";

// Fetch all customers
export const fetchCustomers = () => {
  return api.get("/credit/customers");
};

// Add a new customer
export const addCustomer = async (fullName:string, phoneNumber:string) => {
  const response = await api.post("/admin/credit-accounts", {fullName, phoneNumber});
  return response.data
};


// Fetch all credit accounts (admin)
export const fetchAllAccounts = async () => {
  const response = await api.get("/admin/credit-accounts");
  return response.data.data
};


// Delete a customer
export const deleteCustomer = (customerId: string) => {
  return api.delete(`/credit/customers/${customerId}`);
};

// Get credit history for a customer
export const getCreditHistory = async (customerId: string) => {
  const response = await api.get(`/admin/credit-accounts/${customerId}`);
  return response.data.data
};

// Add a credit transaction for a customer
export const addCreditTransaction = (
  customerId: string,
  transaction: {
    type: "borrow" | "repayment";
    amount: number;
    notes?: string;
  }
) => {
  return api.post(`/credit/customers/${customerId}/transactions`, transaction);
};

// Settle (repay) customer debt
export const settleDebt = async (
  customerId: string,
  amount: number,
  notes?: string
) => {
  const response = await api.post(`/admin/credit-accounts/${customerId}/payment`, { amount, notes });
  return response.data
};

