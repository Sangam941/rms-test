import React, { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import CartSidebar from "../../components/customer/CartSidebar";
import { useMenuStore } from "../../store/useMenuStore"; // import the Zustand store
import type { MenuItem } from "../../types/menu";

// Top category images
const TOP_CATEGORIES = [
  { name: "All", icon: "🍽️" }, // <-- New All category
  { name: "Tea", icon: "🍵" },
  { name: "Drinks", icon: "🥤" },
  { name: "Snacks", icon: "🍜" },
  { name: "Chatpatey Items", icon: "🌶️" },
  { name: "Rice", icon: "🍛" },
  { name: "Momo", icon: "🥟" },
];

// Categories for filter bar
const FILTER_CATEGORIES = ["All", "Veg", "Non-Veg", "Snacks", "Drinks"];

const CustomerMenuView: React.FC = () => {
  const { getFilteredItems } = useMenuStore(); // fetch items from Zustand store
  const allItems = getFilteredItems();

  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedTopCategory, setSelectedTopCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    const exists = cart.find((i) => i.id === item.id);
    if (exists) return alert("Item already in cart");
    setCart((prev) => [...prev, { ...item, quantity: 1 }]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Filtered menu items based on top category, search, and filter category
  const filteredItems = allItems.filter((item) => {
    // Top Category filter
    const matchesTop =
      !selectedTopCategory || selectedTopCategory === "All"
        ? true
        : item.category === selectedTopCategory;

    // Side Category filter (All, Veg, Non-Veg, Snacks…)
    const matchesFilter =
      selectedFilter === "All"
        ? true
        : selectedFilter === "Veg"
        ? item.isVeg
        : selectedFilter === "Non-Veg"
        ? !item.isVeg
        : item.category === selectedFilter;

    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTop && matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center gap-4">
            <div className="text-3xl lg:text-4xl">🍽️</div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Chiyaholic Bhairahawa</h1>
              <p className="text-xs lg:text-sm text-gray-600">⭐ 77°C</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCart((s) => !s)}
              className="relative p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Top Category Images */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedTopCategory(cat.name)}
                className={`flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-lg transition-all ${
                  selectedTopCategory === cat.name
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedFilter === cat
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat === "Veg" ? "🟢" : cat === "Non-Veg" ? "🔴" : ""} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 hover:shadow-2xl transition-all">
            <div className="text-4xl text-center">{item.image}</div>
            <h3 className="font-bold text-lg truncate">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.category}</p>
            <p className="text-orange-600 font-bold text-lg">Rs. {item.price}</p>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <button
              onClick={() => addToCart(item)}
              className="mt-auto w-full py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          cartTotal={cartTotal}
          setShowCart={setShowCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
};

export default CustomerMenuView;
