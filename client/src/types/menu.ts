export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    isVeg: boolean;
    isAvailable: boolean;
    prepTime?: number;
  }
  
