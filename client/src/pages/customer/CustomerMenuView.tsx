// import React, { useState, useEffect } from "react";
// import { Search, ShoppingCart, ToggleLeft, ToggleRight, Star } from "lucide-react";
// import CartSidebar from "../../components/customer/CartSidebar";
// import { useMenuStore } from "../../store/useMenuStore"; // import the Zustand store
// import type { MenuItem } from "../../types/menu";

// // Top category images (these are just for display, user picks from all admin categories)
// const TOP_CATEGORIES = [
//   { name: "All", icon: "🍽️" }, // <-- New All category
//   { name: "Tea", icon: "🍵" },
//   { name: "Drinks", icon: "🥤" },
//   { name: "Snacks", icon: "🍜" },
//   { name: "Chatpatey Items", icon: "🌶️" },
//   { name: "Rice", icon: "🍛" },
//   { name: "Momo", icon: "🥟" },
// ];

// // The correct type for image can be inferred, fallback to string
// function getImageProps(image: any, name: string) {
//   if (!image) return { type: "none" };
//   if (typeof image === "string") {
//     return { type: "emoji", value: image };
//   }
//   if (typeof image === "object" && typeof image.url === "string") {
//     return { type: "image", url: image.url, alt: (image.alt as string) || name };
//   }
//   return { type: "none" };
// }

// const CustomerMenuView: React.FC = () => {
//   // Import categories from menu store (admin/source of truth)
//   const { getFilteredItems, fetchAll, categories } = useMenuStore();
//   const [allItems, setAllItems] = useState<MenuItem[]>([]);

//   useEffect(() => {
//     fetchAll().then(() => {
//       setAllItems(getFilteredItems());
//     });
//   }, []);

//   // Keep items in sync with store
//   useEffect(() => {
//     setAllItems(getFilteredItems());
//   }, [getFilteredItems]);

//   const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("All");
//   const [selectedTopCategory, setSelectedTopCategory] = useState<string | null>(null);
//   const [showCart, setShowCart] = useState(false);

//   // Cart functions
//   const addToCart = (item: MenuItem) => {
//     const exists = cart.find((i) => i.id === item.id);
//     if (exists) return alert("Item already in cart");
//     setCart((prev) => [...prev, { ...item, quantity: 1 }]);
//   };

//   const updateQuantity = (id: string, delta: number) => {
//     setCart((prev) =>
//       prev
//         .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
//         .filter((i) => i.quantity > 0)
//     );
//   };

//   const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

//   const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
//   const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

//   // Filtered menu items based on top category, search, and admin's category
//   const filteredItems = allItems.filter((item) => {
//     // Top visual category filter (optional visual for users)
//     const matchesTop =
//       !selectedTopCategory || selectedTopCategory === "All"
//         ? true
//         : item.category === selectedTopCategory;

//     // Primary admin category filter
//     const matchesCat =
//       selectedCategory === "All" ? true : item.category === selectedCategory;

//     // Search filter
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchesTop && matchesCat && matchesSearch;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow sticky top-0 z-30">
//         <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center h-16 lg:h-20">
//           <div className="flex items-center gap-4">
//             <div className="text-3xl lg:text-4xl">🍽️</div>
//             <div>
//               <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Chiyaholic Bhairahawa</h1>
//               <p className="text-xs lg:text-sm text-gray-600">⭐ 77°C</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setShowCart((s) => !s)}
//               className="relative p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
//             >
//               <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
//                   {cartItemCount}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Top Category Images */}
//         <div className="bg-white border-b">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
//             {TOP_CATEGORIES.map((cat) => (
//               <button
//                 key={cat.name}
//                 onClick={() => setSelectedTopCategory(cat.name)}
//                 className={`flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-lg transition-all ${selectedTopCategory === cat.name
//                   ? "bg-orange-600 text-white"
//                   : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                   }`}
//               >
//                 <span className="text-2xl">{cat.icon}</span>
//                 <span className="text-xs font-medium text-center">{cat.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Search + Category Filter */}
//         <div className="bg-white border-b">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col lg:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search menu items..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
//               />
//             </div>
//             <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
//               {/* Category buttons using admin's categories */}
//               <button
//                 key="All"
//                 onClick={() => setSelectedCategory("All")}
//                 className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === "All"
//                     ? "bg-orange-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//               >
//                 All
//               </button>

//               {categories
//                 .filter((cat) => !!cat && cat.categoryName !== "All")
//                 .map((cat) => (
//                   <button
//                     key={cat.categoryId}
//                     onClick={() => setSelectedCategory(cat.categoryName)}
//                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === cat.categoryName
//                         ? "bg-orange-600 text-white"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                   >
//                     {cat.categoryName}
//                   </button>
//                 ))}

//             </div>
//           </div>
//         </div>
//       </header>


//       {/* Menu Grid */}
//       <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredItems.map((item) => {
//           const imgProps = getImageProps(item.image, item.name);
//           return (
//             <div
//               key={item.id}
//               className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 hover:shadow-2xl transition-all"
//             >
//               {/* Star and Availability Toggle */}
//               <div className="flex items-center gap-2 justify-end mb-1">
//                 {item.isSpecial && (
//                   <Star
//                     className="w-5 h-5"
//                     color="#fbbf24"
//                     stroke="#fbbf24"
//                     fill="#facc15"
//                     style={{ filter: "drop-shadow(0 1px 1px #eab30890)" }}
//                     aria-label="Special item"
//                     aria-hidden="false"
//                   />
//                 )}
//                 {item.isAvailable ? (
//                   <ToggleRight className="w-5 h-5 text-green-500" aria-label="Available" />
//                 ) : (
//                   <ToggleLeft className="w-5 h-5 text-gray-400" aria-label="Unavailable" />
//                 )}
//               </div>

//               {/* Image */}
//               <div className="text-4xl text-center">
//                 {imgProps.type === "emoji" ? (
//                   imgProps.value
//                 ) : imgProps.type === "image" ? (
//                   <img src={imgProps.url} alt={imgProps.alt || item.name} className="mx-auto w-16 h-16" />
//                 ) : (
//                   "🍽️"
//                 )}
//               </div>

//               {/* Item info */}
//               <h3 className="font-bold text-lg truncate">{item.name}</h3>
//               <p className="text-xs text-gray-500">{item.category}</p>
//               <p className="text-orange-600 font-bold text-lg">Rs. {item.price}</p>
//               <p className="text-gray-600 text-sm">{item.description}</p>

//               <button
//                 onClick={() => addToCart(item)}
//                 className="mt-auto w-full py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           );
//         })}
//       </div>


//       {/* Cart Sidebar */}
//       {showCart && (
//         <CartSidebar
//           cart={cart}
//           cartTotal={cartTotal}
//           setShowCart={setShowCart}
//           updateQuantity={updateQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
//     </div>
//   );
// };

// export default CustomerMenuView;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import { useCustomerCartStore } from '../../store/useCustomerCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import { useCustomerOrderStore } from '../../store/useCustomerOrderStore';
import CartSidebar from '../../components/customer/CartSidebar';
import type { MenuItem } from '../../types/menu';

const CustomerMenuView: React.FC = () => {
  const { tableCode } = useParams<{ tableCode?: string }>();
  const navigate = useNavigate();
  
  const { cart, addToCart, getTotalAmount, getTotalItems } = useCustomerCartStore();
  const { 
    items: menuItems,
    categories,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    getFilteredItems 
  } = useMenuStore();

  const { orders } = useCustomerOrderStore();

  const [showCart, setShowCart] = useState(false);

  const filteredItems = getFilteredItems();
  const cartTotal = getTotalAmount();
  const cartItemCount = getTotalItems();

  // Check if there's an existing order for this table
  const existingTableOrder = tableCode 
    ? orders.find(o => 
        o.tableCode?.toLowerCase() === tableCode.toLowerCase() && 
        o.status !== 'completed'
      )
    : null;

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="lg:hidden"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="text-3xl lg:text-4xl">🍽️</div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Chiyaholic Bhairahawa
                </h1>
                {tableCode && (
                  <p className="text-xs lg:text-sm text-gray-600">
                    Table: <span className="font-bold text-orange-600">{tableCode.toUpperCase()}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 lg:p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
      </header>

      {/* Existing Order Alert */}
      {existingTableOrder && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 max-w-7xl mx-auto mt-4 mx-4 lg:mx-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                You have an active order: <strong>#{existingTableOrder.orderNumber}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Total: Rs. {existingTableOrder.totalAmount} | Items will be added to this order
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border-b sticky top-16 lg:top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'Veg' ? '🟢' : cat === 'Non-Veg' ? '🔴' : ''} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-bold text-orange-600 mb-4 lg:mb-6">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {items.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl lg:text-5xl">{item.image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base lg:text-lg truncate">
                            {item.name}
                          </h3>
                          <span className="text-lg flex-shrink-0">
                            {item.isVeg ? '🟢' : '🔴'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-orange-600 font-bold text-lg lg:text-xl">
                            Rs. {item.price}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm lg:text-base"
                          >
                            {item.isAvailable ? 'Add' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          setShowCart={setShowCart}
          tableCode={tableCode}
          existingOrder={existingTableOrder}
        />
      )}
    </div>
  );
};

export default CustomerMenuView;