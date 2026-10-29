/**
 * Domain types for Aura Living & Acoustics e-commerce platform
 */

export type ProductCategory = 'Acoustics' | 'Lighting' | 'Seating' | 'Tableware' | 'Accessories';

export type ProductImageType = 'speaker' | 'lamp' | 'chair' | 'carafe' | 'desk' | 'headphones' | 'vase' | 'clock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  features: string[];
  dimensions: string;
  materials: string;
  imageType: ProductImageType;
  accentColor: string;
  isNew?: boolean;
  featured?: boolean;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSubtotal: number;
  description: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'card' | 'cod' | 'applepay';
  cardNumber?: string;
  cardExp?: string;
  cardCvc?: string;
}

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  customer: CustomerInfo;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiLog {
  id: string;
  timestamp: string;
  method: HttpMethod;
  endpoint: string;
  status: number;
  statusText: string;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
  headers?: Record<string, string>;
}

export interface ProductFilterOptions {
  search?: string;
  category?: ProductCategory | 'All';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';
  inStockOnly?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
