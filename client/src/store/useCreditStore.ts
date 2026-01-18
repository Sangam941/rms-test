import { create } from 'zustand';
import type { CreditTransaction, Customer } from '../types/Customer';
import { 
  addCustomer as apiAddCustomer, 
  fetchAllAccounts as apiFetchAllAccounts, 
  getCreditHistory, 
  settleDebt 
} from '../api/credit';
import toast from 'react-hot-toast';

interface CreditStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;

  // Only accepts fullName and phoneNumber
  addCustomer: (fullName: string, phoneNumber: string) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Promise<Customer | undefined>;
  searchCustomers: (query: string) => Customer[];

  addCreditTransaction: (
    customerId: string,
    transaction: Omit<CreditTransaction, 'id' | 'timestamp' | 'balance'>
  ) => CreditTransaction;

  settleDebt: (customerId: string, amount: number, notes?: string) => Promise<void>;
  getCreditHistory: (customerId: string) => Promise<CreditTransaction[]>;
  getTotalOutstanding: () => number;
  clearError: () => void;

  // Fetch all customers from API
  fetchAllCustomers: () => Promise<void>;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  // Fetch all customers from the backend and populate the store
  fetchAllCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiCustomers = await apiFetchAllAccounts(); 
      const parsedCustomers: Customer[] = (apiCustomers || []).map((c: any) => ({
        ...c,
        totalCredit: c.totalCredit ?? c.totalDue ?? 0,
        totalDue: c.totalDue ?? c.totalCredit ?? 0,
        creditHistory: c.creditHistory ?? c.ledger ?? [],
        ledger: c.ledger ?? c.creditHistory ?? [],
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        id: c.id || c._id,
      }));
      set({ customers: parsedCustomers, isLoading: false, error: null });
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch customers';
      set({ isLoading: false, error: message });
      toast.error(message);
    }
  },

  addCustomer: async (fullName: string, phoneNumber: string) => {
    try {
      const name = fullName?.trim?.() || '';
      const phone = phoneNumber?.trim?.() || '';
      
      if (!phone || phone.length < 10) {
        throw new Error('Invalid phone number');
      }
      if (!name || name.length < 3) {
        throw new Error('Name is required');
      }
      
      const exists = get().customers.find(c => c.phoneNumber === phone);
      if (exists) throw new Error('Customer already exists');

      // Call backend API - expects (fullName, phoneNumber)
      const apiCustomer = await apiAddCustomer(fullName, phoneNumber);

      const newCustomer: Customer = {
        ...apiCustomer,
        totalCredit: apiCustomer.totalCredit ?? apiCustomer.totalDue ?? 0,
        totalDue: apiCustomer.totalDue ?? apiCustomer.totalCredit ?? 0,
        creditHistory: apiCustomer.creditHistory ?? apiCustomer.ledger ?? [],
        ledger: apiCustomer.ledger ?? apiCustomer.creditHistory ?? [],
        createdAt: apiCustomer.createdAt ? new Date(apiCustomer.createdAt) : new Date(),
        id: apiCustomer.id || apiCustomer._id,
      };

      set(state => ({
        customers: [...state.customers, newCustomer],
        error: null
      }));

      toast.success('Customer added successfully!');
      return newCustomer;
    } catch (error: any) {
      const message = error?.message || 'Failed to add customer';
      set(state => ({
        ...state,
        error: message
      }));
      toast.error(message);
      throw error;
    }
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

  getCustomerById: async (id: string) => {
    try {
      // First check local store
      const localCustomer = get().customers.find(c => c.id === id);
      
      // Fetch full credit history from API
      const history = await getCreditHistory(id);
      
      if (localCustomer && history) {
        // Merge local customer with API history
        const updatedCustomer: Customer = {
          ...localCustomer,
          creditHistory: history.ledger || history.creditHistory || [],
          ledger: history.ledger || history.creditHistory || [],
          totalDue: history.totalDue ?? localCustomer.totalDue ?? 0,
          totalCredit: history.totalCredit ?? localCustomer.totalCredit ?? 0,
        };

        // Update customer in store
        set(state => ({
          customers: state.customers.map(c =>
            c.id === id ? updatedCustomer : c
          )
        }));

        return updatedCustomer;
      } else if (history) {
        // If customer not in local store but API returned data
        const newCustomer: Customer = {
          id: history.id || history._id || id,
          fullName: history.fullName || 'Unknown',
          phoneNumber: history.phoneNumber || 'N/A',
          totalDue: history.totalDue ?? 0,
          totalCredit: history.totalCredit ?? 0,
          creditHistory: history.ledger || history.creditHistory || [],
          ledger: history.ledger || history.creditHistory || [],
          createdAt: history.createdAt ? new Date(history.createdAt) : new Date(),
        };

        // Add to store
        set(state => ({
          customers: [...state.customers, newCustomer]
        }));

        return newCustomer;
      }

      return localCustomer;
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch customer details';
      set(state => ({
        ...state,
        error: message,
      }));
      toast.error(message);
      throw error;
    }
  },

  searchCustomers: (query) => {
    if (!query || query.trim() === '') {
      return get().customers;
    }
    return get().customers.filter(c =>
      (typeof c.fullName === 'string' &&
        c.fullName.toLowerCase().includes(query.toLowerCase())) ||
      (typeof c.phoneNumber === 'string' &&
        c.phoneNumber.includes(query))
    );
  },

  addCreditTransaction: (customerId, transactionData) => {
    const customer = get().customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');

    const currentBalance = customer.totalDue || customer.totalCredit || 0;

    const transaction: CreditTransaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
      timestamp: new Date(),
      balance:
        transactionData.type === 'debt'
          ? currentBalance + transactionData.amount
          : currentBalance - transactionData.amount
    };

    set(state => ({
      customers: state.customers.map(c =>
        c.id === customerId
          ? {
              ...c,
              totalCredit: transaction.balance,
              totalDue: transaction.balance,
              creditHistory: [...(c.creditHistory || []), transaction],
              ledger: [...(c.ledger || []), transaction]
            }
          : c
      )
    }));

    return transaction;
  },

  settleDebt: async (customerId: string, amount: number, notes?: string) => {
    try {
      const response = await settleDebt(customerId, amount);
      
      const transaction = response.data?.transaction || response.transaction;
      
      if (transaction) {
        // Add transaction to local store
        get().addCreditTransaction(customerId, {
          customerId,
          type: 'payment',
          amount,
          notes: notes || transaction.notes || transaction.description,
        });

        toast.success('Debt settled successfully!');
        
        // Refresh customer data
        await get().getCustomerById(customerId);
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to settle debt';
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  getCreditHistory: async (customerId: string) => {
    try {
      const history = await getCreditHistory(customerId);
      return history.ledger || history.creditHistory || [];
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch credit history';
      set(state => ({
        ...state,
        error: message,
      }));
      toast.error(message);
      throw error;
    }
  },

  getTotalOutstanding: () =>
    get().customers.reduce((sum, c) => sum + (c.totalDue || c.totalCredit || 0), 0),

  clearError: () => set({ error: null })
}));