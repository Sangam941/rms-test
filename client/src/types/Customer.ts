// Credit Transaction Types
export type CreditTransactionType = 'debt' | 'payment';

export interface CreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: CreditTransactionType;
  balance: number;
  notes?: string;
  timestamp: Date;
}

// Customer Type
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalCredit: number;
  creditLimit: number;
  creditHistory: CreditTransaction[];
  createdAt: Date;
}