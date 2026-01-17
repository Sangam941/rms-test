import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditTransaction, Customer } from '../types/Customer';

interface CreditStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  
  // Customer Management
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'creditHistory' | 'totalCredit'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  
  // Credit Management
  addCreditTransaction: (customerId: string, transaction: Omit<CreditTransaction, 'id' | 'timestamp' | 'balance'>) => void;
  settleDebt: (customerId: string, amount: number, notes?: string) => void;
  getCreditHistory: (customerId: string) => CreditTransaction[];
  
  // Stats
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
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Sita Devi Thapa',
    phone: '9857654321',
    email: 'sita@example.com',
    totalCredit: 2500,
    creditLimit: 5000,
    creditHistory: [],
    createdAt: new Date('2024-02-10')
  }
];

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      customers: DUMMY_CUSTOMERS,
      isLoading: false,
      error: null,

      // Add new customer
      addCustomer: (customerData) => {
        try {
          // Validate phone number
          if (!customerData.phone || customerData.phone.length < 10) {
            throw new Error('Invalid phone number');
          }

          // Check if customer already exists
          const existingCustomer = get().customers.find(
            c => c.phone === customerData.phone
          );

          if (existingCustomer) {
            throw new Error('Customer with this phone number already exists');
          }

          const newCustomer: Customer = {
            ...customerData,
            id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            totalCredit: 0,
            creditHistory: [],
            createdAt: new Date()
          };

          set(state => ({ 
            customers: [...state.customers, newCustomer],
            error: null
          }));

          return newCustomer;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Update customer
      updateCustomer: (id, updates) => {
        try {
          set(state => ({
            customers: state.customers.map(c => 
              c.id === id ? { ...c, ...updates } : c
            ),
            error: null
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Delete customer
      deleteCustomer: (id) => {
        try {
          const customer = get().customers.find(c => c.id === id);
          
          if (customer && customer.totalCredit > 0) {
            throw new Error('Cannot delete customer with outstanding credit');
          }

          set(state => ({
            customers: state.customers.filter(c => c.id !== id),
            error: null
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Get customer by ID
      getCustomerById: (id) => get().customers.find(c => c.id === id),

      // Search customers
      searchCustomers: (query) => {
        const { customers } = get();
        const q = query.toLowerCase();
        return customers.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.phone.includes(q) ||
          c.email?.toLowerCase().includes(q)
        );
      },

      // Add credit transaction
      addCreditTransaction: (customerId, transactionData) => {
        try {
          const customer = get().customers.find(c => c.id === customerId);
          if (!customer) {
            throw new Error('Customer not found');
          }

          const transaction: CreditTransaction = {
            ...transactionData,
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            balance: transactionData.type === 'debt' 
              ? customer.totalCredit + transactionData.amount
              : customer.totalCredit - transactionData.amount
          };

          const newTotal = transaction.balance;

          // Check credit limit for debt transactions
          if (transactionData.type === 'debt' && newTotal > customer.creditLimit) {
            throw new Error('Credit limit exceeded');
          }

          set(state => ({
            customers: state.customers.map(c => 
              c.id === customerId 
                ? { 
                    ...c, 
                    totalCredit: newTotal,
                    creditHistory: [...c.creditHistory, transaction]
                  }
                : c
            ),
            error: null
          }));

          return transaction;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Settle debt
      settleDebt: (customerId, amount, notes) => {
        try {
          const customer = get().customers.find(c => c.id === customerId);
          
          if (!customer) {
            throw new Error('Customer not found');
          }

          if (amount <= 0) {
            throw new Error('Settlement amount must be greater than zero');
          }

          if (amount > customer.totalCredit) {
            throw new Error('Settlement amount exceeds outstanding debt');
          }

          get().addCreditTransaction(customerId, {
            customerId,
            type: 'payment',
            amount,
            notes: notes || 'Debt settlement payment'
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Get credit history
      getCreditHistory: (customerId) => {
        const customer = get().customers.find(c => c.id === customerId);
        return customer?.creditHistory || [];
      },

      // Get total outstanding
      getTotalOutstanding: () => {
        return get().customers.reduce((sum, c) => sum + c.totalCredit, 0);
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    { 
      name: 'credit-storage',
      partialize: (state) => ({ customers: state.customers })
    }
  )
);