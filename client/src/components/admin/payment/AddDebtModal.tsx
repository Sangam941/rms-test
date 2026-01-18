import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { Customer } from '../../../types/Customer';
import { useCreditStore } from '../../../store/useCreditStore';
import toast from 'react-hot-toast';

interface AddDebtModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({ 
  customer, 
  isOpen, 
  onClose 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addCreditTransaction } = useCreditStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtAmount = parseFloat(amount);
    
    if (!debtAmount || debtAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call API to add debt
      const response = await fetch(`/api/customers/${customer.id}/debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: debtAmount,
          description: description || 'Debt added',
          type: 'debt'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add debt');
      }

      const data = await response.json();

      // Update local store
      addCreditTransaction(customer.id, {
        customerId: customer.id,
        type: 'debt',
        amount: debtAmount,
        notes: description || 'Debt added',
      });

      toast.success(`Rs. ${debtAmount.toLocaleString()} debt added successfully!`);
      
      // Reset form
      setAmount('');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Error adding debt:', error);
      toast.error(error?.message || 'Failed to add debt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Add Debt</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Customer</p>
            <p className="font-semibold text-gray-900">{customer.fullName}</p>
            <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-xl font-bold text-red-600">
                Rs. {(customer.totalDue || customer.totalCredit || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Debt Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter the amount the customer owes
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Order #1234, Table 5"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
            />
          </div>

          {/* New Balance Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-700 mb-1">Total Balance (Current + New Debt)</p>
              <p className="text-2xl font-bold text-orange-600">
                Rs. {(Number(customer.totalDue ?? 0) + parseFloat(amount)).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Debt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};