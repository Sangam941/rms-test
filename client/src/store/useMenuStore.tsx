import { create } from "zustand";
import type { MenuItem } from "../types/menu";

interface MenuStore {
  items: MenuItem[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;

  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;

  addItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;

  getFilteredItems: () => MenuItem[];
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [
    {
      id: "1",
      name: "Chicken Momo",
      price: 150,
      category: "Momo",
      image: "🥟",
      isVeg: false,
      isAvailable: true,
      description: "Delicious steamed chicken dumplings with spicy sauce",
    },
    {
      id: "2",
      name: "Veg Chowmein",
      price: 120,
      category: "Chowmein",
      image: "🍝",
      isVeg: true,
      isAvailable: true,
      description: "Stir-fried noodles with fresh vegetables",
    },
    {
      id: "3",
      name: "Buff Chowmein",
      price: 140,
      category: "Chowmein",
      image: "🍜",
      isVeg: false,
      isAvailable: false,
      description: "Noodles stir-fried with buffalo meat",
    },
    {
      id: "4",
      name: "Pani Puri",
      price: 80,
      category: "Chatpatey Items",
      image: "🥚",
      isVeg: true,
      isAvailable: true,
      description: "Crispy puris with spicy tangy water",
    },
    {
      id: "5",
      name: "Coke",
      price: 50,
      category: "Drinks",
      image: "🥤",
      isVeg: true,
      isAvailable: true,
      description: "Refreshing cold drink",
    },
    {
      id: "6",
      name: "Veg Spring Roll",
      price: 130,
      category: "Chatpatey Items",
      image: "🌯",
      isVeg: true,
      isAvailable: false,
      description: "Crispy rolls filled with mixed vegetables",
    },
    {
      id: "7",
      name: "Chicken Lollipop",
      price: 200,
      category: "Chatpatey Items",
      image: "🍗",
      isVeg: false,
      isAvailable: true,
      description: "Deep-fried chicken wings with tangy sauce",
    },
  ],

  categories: ["All", "Veg", "Non-Veg", "Chatpatey Items", "Chowmein", "Drink"],
  selectedCategory: "All",
  searchQuery: "",

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredItems: () => {
    const { items, selectedCategory, searchQuery } = get();
    return items.filter(item => {
      const matchCategory =
        selectedCategory === "All" ||
        (selectedCategory === "Veg" && item.isVeg) ||
        (selectedCategory === "Non-Veg" && !item.isVeg) ||
        item.category === selectedCategory;

      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  },

  addItem: (item) =>
    set({
      items: [...get().items, { ...item, id: crypto.randomUUID() }],
    }),

  updateMenuItem: (updatedItem) =>
    set({
      items: get().items.map(i =>
        i.id === updatedItem.id ? updatedItem : i
      ),
    }),

  deleteMenuItem: (id) =>
    set({ items: get().items.filter(i => i.id !== id) }),

  toggleAvailability: (id) =>
    set({
      items: get().items.map(i =>
        i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
      ),
    }),
}));
