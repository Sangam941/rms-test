import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Users } from 'lucide-react';
import { DiscountInput } from './DiscountInput';
import { CreditSearch } from './CreditSearch';
import type { Order } from '../../types/order';
import type { Customer } from '../../types/Customer';
import { useOrderStore } from '../../store/useOrderStore';
import { useCreditStore } from '../../store/useCreditStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'cash' | 'online' | 'credit' | 'mixed';

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState({ type: 'percentage' as const, value: 0, amount: 0 });
  const [cashAmount, setCashAmount] = useState(order.totalAmount);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [processing, setProcessing] = useState(false);

  const { updateOrder } = useOrderStore();
  const { addCreditTransaction } = useCreditStore();

  const finalAmount = order.totalAmount - discount.amount;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Validate payment based on method
      if (activeTab === 'cash') {
        if (cashAmount < finalAmount) {
          alert('Cash amount is less than the final amount');
          setProcessing(false);
          return;
        }
      } else if (activeTab === 'online') {
        if (!transactionId.trim()) {
          alert('Please enter transaction ID');
          setProcessing(false);
          return;
        }
      } else if (activeTab === 'credit') {
        if (!selectedCustomer) {
          alert('Please select a customer');
          setProcessing(false);
          return;
        }
        const availableCredit = selectedCustomer.creditLimit - selectedCustomer.totalCredit;
        if (finalAmount > availableCredit) {
          alert('Amount exceeds customer credit limit');
          setProcessing(false);
          return;
        }
      } else if (activeTab === 'mixed') {
        const total = cashAmount + onlineAmount;
        if (Math.abs(total - finalAmount) > 0.01) {
          alert(`Total payment (Rs. ${total}) must equal final amount (Rs. ${finalAmount})`);
          setProcessing(false);
          return;
        }
      }

      // Update order with payment info
      updateOrder(order.id, {
        paymentMethod: activeTab,
        paymentStatus: 'paid',
        status: 'completed',
        discount: discount.value > 0 ? discount : undefined,
        finalAmount: finalAmount,
        completedAt: new Date()
      });

      // If credit payment, add transaction
      if (activeTab === 'credit' && selectedCustomer) {
        addCreditTransaction(selectedCustomer.id, {
          customerId: selectedCustomer.id,
          orderId: order.id,
          type: 'debt',
          amount: finalAmount
        });
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success
      alert('Payment processed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const tabs: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { key: 'cash', label: 'Cash', icon: <Wallet className="w-5 h-5" /> },
    { key: 'online', label: 'Online', icon: <Smartphone className="w-5 h-5" /> },
    { key: 'mixed', label: 'Mixed', icon: <CreditCard className="w-5 h-5" /> },
    { key: 'credit', label: 'Credit', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" title="Process Payment">
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Order #{order.orderNumber}</span>
            <span className="font-semibold">Table {order.tableNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600">Items:</span>
            <span className="font-semibold">{order.items.length}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
            <span>Original Total:</span>
            <span>Rs. {order.totalAmount}</span>
          </div>
        </div>

        {/* Discount Section */}
        <DiscountInput orderTotal={order.totalAmount} onDiscountChange={setDiscount} />

        {/* Final Amount */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Amount to Pay:</span>
            <span className="text-3xl font-bold text-indigo-600">Rs. {finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 bg-gray-100 p-2 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Payment Method Content */}
        <div className="min-h-[200px]">
          {activeTab === 'cash' && (
            <div className="space-y-4">
              <Input
                type="number"
                label="Cash Received"
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                icon={<Wallet className="w-5 h-5" />}
              />
              {cashAmount >= finalAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Change to Return:</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {(cashAmount - finalAmount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'online' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                <p className="font-semibold mb-2">Payment Methods:</p>
                <ul className="space-y-1">
                  <li>• eSewa / Khalti / IME Pay</li>
                  <li>• Bank Transfer</li>
                  <li>• QR Code Scan</li>
                </ul>
              </div>
              <Input
                type="text"
                label="Transaction ID / Reference Number"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="TXN123456789"
                icon={<Smartphone className="w-5 h-5" />}
              />
            </div>
          )}

          {activeTab === 'mixed' && (
            <div className="space-y-4">
              <Input
                type="number"
                label="Cash Amount"
                value={cashAmount}
                onChange={(e) => {
                  const cash = Number(e.target.value);
                  setCashAmount(cash);
                  setOnlineAmount(finalAmount - cash);
                }}
                icon={<Wallet className="w-5 h-5" />}
              />
              <Input
                type="number"
                label="Online Amount"
                value={onlineAmount}
                onChange={(e) => {
                  const online = Number(e.target.value);
                  setOnlineAmount(online);
                  setCashAmount(finalAmount - online);
                }}
                icon={<Smartphone className="w-5 h-5" />}
              />
              <div className={`rounded-lg p-4 ${
                Math.abs((cashAmount + onlineAmount) - finalAmount) < 0.01
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-sm font-semibold mb-1">Total Entered:</p>
                <p className="text-xl font-bold">Rs. {(cashAmount + onlineAmount).toFixed(2)}</p>
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <CreditSearch onSelectCustomer={setSelectedCustomer} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handlePayment}
            loading={processing}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Confirm Payment - Rs. ${finalAmount.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default { PaymentModal, DiscountInput, CreditSearch };