import React, { useState } from 'react';
import type { MenuItem } from '../../types/menu';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerOrderStore } from '../../store/useCustomerOrderStore';


//for the check demo
export const DUMMY_TABLE_T2 = {
    tableCode: "t2",
    name: "Table 2",
  };

interface CartSidebarProps {
  cart: (MenuItem & { quantity: number })[];
  cartTotal: number;
  setShowCart: (show: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  customerType?: "DINE-IN" | "WALK-IN" | "ONLINE";
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  cartTotal,
  setShowCart,
  updateQuantity,
  removeFromCart,
  customerType: propCustomerType,
}) => {
  const navigate = useNavigate();
//   const { tableCode } = useParams<{ tableCode: string }>(); // e.g., t1, t2 from URL
    let tableCode = DUMMY_TABLE_T2.tableCode;  // just for the check

  const [loading, setLoading] = useState(false);

  const { createOrder } = useCustomerOrderStore();

  const customerType = propCustomerType || (tableCode ? "DINE-IN" : "WALK-IN");

  const handleCheckout = async () => {
    if (!cart.length) return alert("Cart is empty");

    if (customerType === "DINE-IN" && !tableCode) {
      return alert("Table code is missing. Please scan the QR code.");
    }

    setLoading(true);

    try {
      const newOrder = await createOrder({
        items: cart,
        tableCode: tableCode || undefined,
        customerType,
      });
      console.log(newOrder)

      if (newOrder) {
        setShowCart(false);
        navigate(`/order-success/${newOrder.orderId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setShowCart(false)}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 lg:w-[480px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 bg-orange-600 text-white">
          <h3 className="text-lg lg:text-xl font-bold">My Cart</h3>
          <button onClick={() => setShowCart(false)} className="p-1 hover:bg-orange-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 lg:w-20 lg:h-20 mb-4" />
              <p className="text-lg lg:text-xl font-semibold">Your cart is empty</p>
              <p className="text-sm lg:text-base mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl lg:text-4xl">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm lg:text-base truncate">{item.name}</h4>
                    <p className="text-orange-600 font-bold text-sm lg:text-base">Rs. {item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold">-</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Checkout Button */}
        {cart.length > 0 && (
          <div className="border-t p-4 lg:p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 text-base lg:text-lg">Subtotal:</span>
              <span className="font-bold text-xl lg:text-2xl">Rs. {cartTotal}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
