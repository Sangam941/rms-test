import React, { useState } from "react";
import { Plus, Search, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import ToggleSideBar from "../../components/admin/ToggleSideBar";
import EditMenuItemModal from "../../components/admin/EditMenuItemModal";
import type { MenuItem } from "../../types/menu";
import { useMenuStore } from "../../store/useMenuStore";
import { useNavigate } from "react-router-dom";

const AdminMenuView: React.FC = () => {
  const navigate = useNavigate();

  const {
    getFilteredItems,
    categories,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  } = useMenuStore();

  const menuItems = getFilteredItems();

  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ToggleSideBar />
          <h1 className="text-xl lg:text-2xl font-bold">Menu Management</h1>
        </div>

        <button
          onClick={() => navigate("/admin/menu/add")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* SEARCH & FILTER */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-700 font-semibold"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {typeof item.image === "string" && item.image.startsWith("blob")
                      ? <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                      : item.image}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span>{item.isVeg ? "🟢" : "🔴"}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-orange-600 font-bold text-xl mt-1">
                      Rs. {item.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <span className="text-sm font-semibold text-gray-700">Available</span>
                <button onClick={() => toggleAvailability(item.id)}>
                  {item.isAvailable ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditItem(item)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No items found
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      <EditMenuItemModal
        isOpen={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onUpdateItem={(item) => {
          updateMenuItem(item);
          setEditItem(null);
        }}
      />
    </div>
  );
};

export default AdminMenuView;
