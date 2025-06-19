export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // Changed to string to accommodate various inputs
  tags: string[];
  prescriptionRequired?: boolean;
  pharmacyName?: string; // Added pharmacyName
  productAmount?: number; // Added productAmount
  expiryDate?: Date | null; // Added expiryDate, can be Date object or null
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Add pharmacyInfo for Pharmacy role
  pharmacyInfo?: {
    name: string;
    vodafoneCash: string;
    address: string;
    mapLink: string;
    logoImage: string | null;
    pharmacyImages: Array<string | null>;
  };
}

export interface Comment {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productInStock: boolean;
  productBrand: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string; // Added userPhotoUrl
  text: string;
  rating: number;
  timestamp: Date;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  productCount: number;
  website: string;
  nationality: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  inStockOnly: boolean;
  deliveryTime: string[];
  minRating: number;
}
