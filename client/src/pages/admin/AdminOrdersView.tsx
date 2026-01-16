// ============================================
// ADMIN ORDERS VIEW (ZUSTAND CONNECTED)
// ============================================

import OrdersExportPrint from "../../components/admin/OrdersExportPrint";
import ToggleSideBar from "../../components/admin/ToggleSideBar";
import ViewOrderDetailsModal from "../../components/admin/ViewOrderDetailsModal";
import { useOrderStore } from "../../store/useOrderStore";

const AdminOrdersView = () => {
    const {
        getFilteredOrders,
        selectedStatus,
        setSelectedStatus,
        setCurrentOrder,
        currentOrder,
        updateOrderStatus,
    } = useOrderStore();

    const orders = getFilteredOrders();

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <header className="bg-white border-b px-4 lg:px-8 py-4 flex items-center gap-4">
                <ToggleSideBar />
                <h1 className="text-xl lg:text-2xl font-bold">Orders Management</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {/* <ExportPrintOrders orders={orders} /> */}
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'preparing', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedStatus === status
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Export / Print Buttons */}
                <OrdersExportPrint orders={orders} />

                {/* Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                    <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                                    <p className="text-sm text-gray-600">{order.customerName}</p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'preparing'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === 'cancelled'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {order.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-xl">Rs. {order.totalAmount}</span>
                                </div>

                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                                        >
                                            Start Preparing
                                        </button>
                                    )}

                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                                        >
                                            Mark Complete
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setCurrentOrder(order)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Order Details Modal */}
            <ViewOrderDetailsModal
                isOpen={!!currentOrder}
                order={currentOrder}
                onClose={() => setCurrentOrder(null)}
            />
        </div>
    );
};

export default AdminOrdersView;
