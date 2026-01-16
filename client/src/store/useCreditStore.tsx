import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditTransaction, Customer } from '../types/Customer';

interface CreditStore {
  customers: Customer[];
  
  // Customer Management
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'creditHistory'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  
  // Credit Management
  addCreditTransaction: (customerId: string, transaction: Omit<CreditTransaction, 'id' | 'timestamp' | 'balance'>) => void;
  settleDebt: (customerId: string, amount: number, notes?: string) => void;
  getCreditHistory: (customerId: string) => CreditTransaction[];
  
  // Stats
  getTotalOutstanding: () => number;
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

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: `cust-${Date.now()}`,
          totalCredit: 0,
          creditHistory: [],
          createdAt: new Date()
        };
        set(state => ({ customers: [...state.customers, newCustomer] }));
      },

      updateCustomer: (id, updates) => set(state => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      getCustomerById: (id) => get().customers.find(c => c.id === id),

      searchCustomers: (query) => {
        const { customers } = get();
        const q = query.toLowerCase();
        return customers.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.phone.includes(q) ||
          c.email?.toLowerCase().includes(q)
        );
      },

      addCreditTransaction: (customerId, transactionData) => {
        const customer = get().customers.find(c => c.id === customerId);
        if (!customer) return;

        const transaction: CreditTransaction = {
          ...transactionData,
          id: `txn-${Date.now()}`,
          timestamp: new Date(),
          balance: transactionData.type === 'debt' 
            ? customer.totalCredit + transactionData.amount
            : customer.totalCredit - transactionData.amount
        };

        const newTotal = transaction.balance;

        set(state => ({
          customers: state.customers.map(c => 
            c.id === customerId 
              ? { 
                  ...c, 
                  totalCredit: newTotal,
                  creditHistory: [...c.creditHistory, transaction]
                }
              : c
          )
        }));
      },

      settleDebt: (customerId, amount, notes) => {
        get().addCreditTransaction(customerId, {
          customerId,
          type: 'payment',
          amount,
          notes: notes || 'Debt settlement payment'
        });
      },

      getCreditHistory: (customerId) => {
        const customer = get().customers.find(c => c.id === customerId);
        return customer?.creditHistory || [];
      },

      getTotalOutstanding: () => {
        return get().customers.reduce((sum, c) => sum + c.totalCredit, 0);
      }
    }),
    { name: 'credit-storage' }
  )
);