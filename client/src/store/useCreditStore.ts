import { create } from 'zustand';
import type { CreditTransaction, Customer } from '../types/Customer';

interface CreditStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'creditHistory' | 'totalCredit'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];

  addCreditTransaction: (
    customerId: string,
    transaction: Omit<CreditTransaction, 'id' | 'timestamp' | 'balance'>
  ) => CreditTransaction;

  settleDebt: (customerId: string, amount: number, notes?: string) => void;
  getCreditHistory: (customerId: string) => CreditTransaction[];
  getTotalOutstanding: () => number;
  clearError: () => void;
}

const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Ram Kumar Sharma',
    phone: '9841234567',
    email: 'ram@example.com',
    totalCredit: 5000,
    creditLimit: 10000,
    creditHistory: [],
    createdAt: new Date()
  }
];

export const useCreditStore = create<CreditStore>((set, get) => ({
  customers: DUMMY_CUSTOMERS,
  isLoading: false,
  error: null,

  addCustomer: (customerData) => {
    if (!customerData.phone || customerData.phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    const exists = get().customers.find(c => c.phone === customerData.phone);
    if (exists) throw new Error('Customer already exists');

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalCredit: 0,
      creditHistory: [],
      createdAt: new Date()
    };

    set(state => ({
      customers: [...state.customers, newCustomer],
      error: null
    }));

    return newCustomer;
  },

  updateCustomer: (id, updates) =>
    set(state => ({
      customers: state.customers.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    })),

  deleteCustomer: (id) =>
    set(state => ({
      customers: state.customers.filter(c => c.id !== id)
    })),

  getCustomerById: (id) =>
    get().customers.find(c => c.id === id),

  searchCustomers: (query) =>
    get().customers.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query)
    ),

  addCreditTransaction: (customerId, transactionData) => {
    const customer = get().customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');

    const transaction: CreditTransaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
      timestamp: new Date(),
      balance:
        transactionData.type === 'debt'
          ? customer.totalCredit + transactionData.amount
          : customer.totalCredit - transactionData.amount
    };

    set(state => ({
      customers: state.customers.map(c =>
        c.id === customerId
          ? {
              ...c,
              totalCredit: transaction.balance,
              creditHistory: [...c.creditHistory, transaction]
            }
          : c
      )
    }));

    return transaction;
  },

  settleDebt: (customerId, amount, notes) => {
    get().addCreditTransaction(customerId, {
      customerId,
      type: 'payment',
      amount,
      notes
    });
  },

  getCreditHistory: (customerId) =>
    get().customers.find(c => c.id === customerId)?.creditHistory || [],

  getTotalOutstanding: () =>
    get().customers.reduce((sum, c) => sum + c.totalCredit, 0),

  clearError: () => set({ error: null })
}));
