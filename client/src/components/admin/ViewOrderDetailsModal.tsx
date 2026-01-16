import React from "react";
import { X } from "lucide-react";
import type { Order } from "../../types/order";
import ExportPrintSingleOrder from "./ExportPrintSingleOrder";

type Props = {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
};

// console.log("ORDER ITEMS:", order.items);

const ViewOrderDetailsModal: React.FC<Props> = ({ isOpen, order, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Export/Print Buttons for this order */}
        <ExportPrintSingleOrder order={order} />

        <h2 className="text-xl font-bold mb-4">
          Order #{order.id} Details
        </h2>

        {/* Order Info */}
        <div className="space-y-1 text-sm text-gray-700 mb-4">
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Table:</strong> {order.tableNumber}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="uppercase font-semibold">{order.status}</span>
          </p>
        </div>

        {/* Items */}
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    Rs. {item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>Rs. {order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderDetailsModal;
