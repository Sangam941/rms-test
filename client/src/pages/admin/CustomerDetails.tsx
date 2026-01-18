import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, FileText, RefreshCw } from 'lucide-react';
import { useCreditStore } from '../../store/useCreditStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AddDebtModal } from '../../components/admin/payment/AddDebtModal';
import type { Customer } from '../../types/Customer';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { customers, getCustomerById } = useCreditStore();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);

  // Fetch customer details on mount
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) {
        setError('No customer ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First check if customer exists in local store
        const localCustomer = customers.find(c => c.id === id);
        
        if (localCustomer) {
          setCustomer(localCustomer);
        }

        // Then fetch full details from API (including credit history)
        const customerData = await getCustomerById(id);
        
        if (customerData) {
          setCustomer(customerData);
        } else if (!localCustomer) {
          setError('Customer not found');
        }
      } catch (err: any) {
        console.error('Error loading customer:', err);
        setError(err?.message || 'Failed to load customer details');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [id, getCustomerById, customers]);

  // Refresh customer data
  const handleRefresh = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const customerData = await getCustomerById(id);
      if (customerData) {
        setCustomer(customerData);
      }
    } catch (err: any) {
      console.error('Error refreshing customer:', err);
      setError(err?.message || 'Failed to refresh customer data');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !customer) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading customer details...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !customer) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/credit')}>
              Back to Credit Ledger
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Customer not found
  if (!customer) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Customer not found</p>
            <Button onClick={() => navigate('/admin/credit')}>
              Back to Credit Ledger
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Safe access to ledger/creditHistory
  const transactions = customer.ledger || customer.creditHistory || [];
  const totalDue = customer.totalDue || customer.totalCredit || 0;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/credit')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Credit Ledger
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.fullName || 'N/A'}</h1>
            <p className="text-gray-600 mt-1">{customer.phoneNumber || 'N/A'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh customer data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {/* <Button
              onClick={() => setShowAddDebtModal(true)}
              icon={<Plus className="w-5 h-5" />}
            >
              Add Debt
            </Button> */}
          </div>
        </div>
      </div>

      {/* Credit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
          <p className="text-3xl font-bold text-red-600">
            Rs. {totalDue.toLocaleString()}
          </p>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600">
            {transactions.length}
          </p>
        </Card>

        <Card className="border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Customer Since</p>
          <p className="text-lg font-bold text-green-600">
            {customer.createdAt 
              ? new Date(customer.createdAt).toLocaleDateString()
              : 'N/A'
            }
          </p>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          {transactions.length > 0 && (
            <span className="text-sm text-gray-600">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">No transactions yet</p>
            <p className="text-sm">Add a debt to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction: any) => {
              // Normalize transaction type (handle different formats)
              const transactionType = (transaction.type || '').replace(/"/g, '').toUpperCase();
              const isDebt = transactionType === 'DEBT' || transactionType === 'CREDIT';
              const isPayment = transactionType === 'SETTLE' ||  transactionType === 'PAYMENT';

              return (
                <div
                  key={transaction.id || transaction._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDebt
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isDebt ? 'Debt Added' : 'Payment Received'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.createdAt 
                          ? new Date(transaction.createdAt).toLocaleString()
                          : transaction.createdAT 
                            ? new Date(transaction.createdAT).toLocaleString()
                            : transaction.timestamp
                              ? new Date(transaction.timestamp).toLocaleString()
                              : 'N/A'
                        }
                      </p>
                      {(transaction.notes || transaction.description) && (
                        <p className="text-sm text-gray-500 mt-1">
                          {transaction.notes || transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      isDebt ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isDebt ? '+' : '-'} Rs. {Number(transaction.amount || 0).toLocaleString()}
                    </p>
                    {transaction.balance !== undefined && transaction.balance !== null && (
                      <p className="text-sm text-gray-600">
                        Balance: Rs. {Number(transaction.balance).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Debt Modal */}
      {/* {showAddDebtModal && (
        <AddDebtModal
          customer={customer}
          isOpen={showAddDebtModal}
          onClose={() => {
            setShowAddDebtModal(false);
            handleRefresh(); // Refresh data after adding debt
          }}
        />
      )} */}
    </div>
  );
};

export default CustomerDetails;