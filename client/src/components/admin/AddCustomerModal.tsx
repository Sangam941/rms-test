import React, { useState } from 'react';
import { User, Phone } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useCreditStore } from '../../store/useCreditStore';
import { toast } from 'react-hot-toast';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper component to render validation error messages below input fields
const InputError = ({ error }: { error?: string }) =>
  error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null;

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer } = useCreditStore();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    // Phone validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Directly pass fullname and phone number to API via addCustomer function
      await addCustomer(fullName.trim(), phoneNumber.replace(/\s/g, ''));

      toast.success('Customer added successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFullName('');
    setPhoneNumber('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Customer"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <Input
            label="Customer Name *"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            icon={<User className="w-5 h-5" />}
            required
          />
          <InputError error={errors.fullName} />
        </div>

        {/* Phone */}
        <div>
          <Input
            label="Phone Number *"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="9841234567"
            icon={<Phone className="w-5 h-5" />}
            required
          />
          <InputError error={errors.phoneNumber} />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
          <h4 className="font-bold text-gray-800 mb-2">Customer Summary</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> {fullName || '---'}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Phone:</span> {phoneNumber || '---'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};