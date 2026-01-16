// ============================================
// FILE: src/pages/customer/WalkInOrder.tsx
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, ArrowLeft, Plus, Minus, Trash2, User, Edit2, Check, X, SquarePen, MoveLeft } from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import type { MenuItem } from '../../types/menu';
import { useOrderStore } from '../../store/useOrderStore';
import { useCartStore } from '../../store/useCartStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WalkInOrder: React.FC = () => {
    const navigate = useNavigate();

    // Zustand stores
    const {
        items: cartItems,
        addItem,
        removeItem,
        updateQuantity,
        getTotalAmount,
        getTotalItems,
    } = useCartStore();

    const {
        items: menuItems,
        categories,
        selectedCategory,
        searchQuery,
        setSelectedCategory,
        setSearchQuery,
        getFilteredItems
    } = useMenuStore();

    const { currentOrder, updateOrder } = useOrderStore();

    // Manage customer name
    // Store original name (may come from AdminTableSelectionView or initial state)
    const originalCustomerNameRef = useRef(currentOrder?.customerName || '');
    // Put the displayed value in local state
    const [customerName, setCustomerName] = useState(currentOrder?.customerName || '');
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Detect if the global currentOrder changes (e.g., if another selection in AdminTableSelectionView happens), and update state accordingly
    useEffect(() => {
        // Only update if the name changed from outside (not by self edit)
        if (
            typeof currentOrder?.customerName === "string" &&
            currentOrder.customerName !== "" &&
            currentOrder.customerName !== originalCustomerNameRef.current
        ) {
            originalCustomerNameRef.current = currentOrder.customerName;
            setCustomerName(currentOrder.customerName);
        }
    }, [currentOrder?.customerName]);

    // On mount or id change hook (to get the default name from currentOrder)
    useEffect(() => {
        setCustomerName(currentOrder?.customerName || '');
        originalCustomerNameRef.current = currentOrder?.customerName || '';
    }, [currentOrder?.id]);

    // Cart, Menu, etc.
    const orderTotal = getTotalAmount();
    const itemCount = getTotalItems();
    const filteredProducts = getFilteredItems();

    const [searchParams] = useSearchParams();
    const customerFromQuery = searchParams.get("customer");

    // Sync customer name ONLY once from query
    useEffect(() => {
        if (!customerFromQuery) return;

        setCustomerName(customerFromQuery);
        originalCustomerNameRef.current = customerFromQuery;

        if (currentOrder) {
            updateOrder(currentOrder.id, {
                customerName: customerFromQuery,
            });
        }
    }, [customerFromQuery, currentOrder, updateOrder]);


    useEffect(() => {
        if (categories.length && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory, setSelectedCategory]);


    // Check product availability
    const checkAvailability = (product: MenuItem) => {
        if (!product.isAvailable) {
            return { allowed: false, reason: 'Out of Stock' };
        }
        // Check day availability if applicable
        const todayName = DAYS[new Date().getDay()];
        // Add day checking logic here if needed
        return { allowed: true, reason: '' };
    };

    // Handle add item to cart
    const handleAddItem = (product: MenuItem) => {
        const status = checkAvailability(product);
        if (!status.allowed) {
            alert(`⚠️ ${status.reason}`);
            return;
        }
        addItem(product);
    };

    // Handle increase quantity
    const handleIncreaseItem = (productId: string) => {
        const product = menuItems.find(p => p.id === productId);
        if (product) {
            addItem(product);
        }
    };

    // Handle decrease quantity
    const handleDecreaseItem = (productId: string) => {
        updateQuantity(productId, -1);
    };

    // Save customer name (On check/tick)
    const handleSaveCustomerName = () => {
        const finalName = customerName.trim();
        if (currentOrder) {
            updateOrder(currentOrder.id, {
                customerName: finalName || undefined,
            });
            // store this as the 'confirmed' name, so if selection comes again it can be detected
            originalCustomerNameRef.current = finalName;
        }
        setIsEditingCustomer(false);
    };

    // Place order
    const handlePlaceOrder = () => {
        if (itemCount === 0 || orderTotal <= 0) {
            alert('⚠️ Add at least one item to place order');
            return;
        }
        // Navigate back to orders list
        navigate('/admin/orders');
    };

    // Handle payment
    const handlePayBill = () => {
        if (orderTotal > 0 && itemCount > 0) {
            setShowPaymentModal(true);
        }
    };

    // Get quantity for a specific product
    const getProductQuantity = (productId: string): number => {
        const item = cartItems.find(i => i.id === productId);
        return item?.quantity || 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Menu Management
                        </h1>

                        <div className="flex items-center gap-2 mt-1 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            {!isEditingCustomer ? (
                                <div className='flex items-center gap-2'>
                                    <span className="font-semibold text-orange-600">
                                        {customerName || "Walk-in Customer"}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingCustomer(true)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        <SquarePen size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="border rounded-md px-2 py-1 text-sm"
                                        autoFocus
                                    />
                                    <button onClick={handleSaveCustomerName} className="text-green-600">
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCustomerName(originalCustomerNameRef.current);
                                            setIsEditingCustomer(false);
                                        }}
                                        className="text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
                    >
                        <MoveLeft size={16}/>
                        Back
                    </button>
                </div>
            </header>


            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Menu Section - Left Side */}
                    <section className="lg:col-span-2 space-y-6">

                        {/* Search & Filter */}
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Filter Menu</h3>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Category Select */}
                            <select
                                className="w-full p-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled={!!searchQuery.trim()}
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Menu Items */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                Menu Items
                            </h2>

                            <div className="space-y-4">
                                {filteredProducts.length === 0 ? (
                                    <div className="text-center py-20 text-gray-400">
                                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p className="text-lg">No items available</p>
                                    </div>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const status = checkAvailability(product);
                                        const qty = getProductQuantity(product.id);

                                        return (
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        <span className="text-4xl">{product.image}</span>
                                                        <div>
                                                            <h4 className="font-bold text-lg flex items-center gap-2">
                                                                {product.name}
                                                                <span>{product.isVeg ? "🟢" : "🔴"}</span>
                                                            </h4>
                                                            <p className="text-sm text-gray-500">{product.category}</p>
                                                            <p className="text-orange-600 font-bold mt-1">
                                                                Rs. {product.price}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {qty === 0 ? (
                                                        <button
                                                            onClick={() => handleAddItem(product)}
                                                            className="px-5 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
                                                        >
                                                            Add
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-xl">
                                                            <button onClick={() => handleDecreaseItem(product.id)}>-</button>
                                                            <span className="font-bold">{qty}</span>
                                                            <button onClick={() => handleIncreaseItem(product.id)}>+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Cart Sidebar - Right Side */}
                    <aside className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Your Cart</h2>

                        {itemCount === 0 ? (
                            <p className="text-gray-400 text-center py-10">Cart is empty</p>
                        ) : (
                            cartItems.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between mb-3 gap-3"
                                >
                                    {/* Item name & qty */}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                            {item.name} × {item.quantity}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <span className="font-semibold text-gray-700">
                                        Rs. {item.price * item.quantity}
                                    </span>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))

                        )}

                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-orange-600">Rs. {orderTotal}</span>
                            </div>

                            <button className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-bold">
                                Place Order
                            </button>
                        </div>
                    </aside>

                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 bg-gray-200 text-gray-600 text-sm mt-12">
                Restaurant POS System © 2024
            </footer>
        </div>
    );
};

export default WalkInOrder;