import { 
  Product, 
  Order, 
  CartItem, 
  CustomerInfo, 
  ProductFilterOptions, 
  ApiLog, 
  HttpMethod, 
  ValidationError,
  ProductCategory,
  ProductImageType
} from '../types';
import { INITIAL_PRODUCTS, AVAILABLE_COUPONS } from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'aura_products_v1',
  ORDERS: 'aura_orders_v1',
  LOGS: 'aura_api_logs_v1',
};

// Listeners for live API telemetry in the Developer Inspector
type LogSubscriber = (log: ApiLog) => void;
const logSubscribers: Set<LogSubscriber> = new Set();

export function subscribeToApiLogs(callback: LogSubscriber): () => void {
  logSubscribers.add(callback);
  return () => {
    logSubscribers.delete(callback);
  };
}

function broadcastLog(log: ApiLog) {
  logSubscribers.forEach((cb) => cb(log));
  // Keep last 50 logs in sessionStorage
  try {
    const existing: ApiLog[] = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    const updated = [log, ...existing].slice(0, 50);
    sessionStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  } catch {
    // ignore storage quota issues
  }
}

export function getStoredLogs(): ApiLog[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  } catch {
    return [];
  }
}

export function clearStoredLogs(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.LOGS);
  } catch {
    // ignore
  }
}

// Simulated network delay
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to record an API transaction with accurate timing
async function logTransaction<T>(
  method: HttpMethod,
  endpoint: string,
  requestBody: unknown,
  action: () => Promise<{ status: number; statusText: string; data: T }>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await action();
    const durationMs = Math.round(performance.now() - start);
    broadcastLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status: result.status,
      statusText: result.statusText,
      durationMs,
      requestBody,
      responseBody: result.data,
      headers: {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Aura-REST-Engine/1.0',
        'X-Response-Time': `${durationMs}ms`,
      },
    });
    return result.data;
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - start);
    const status = error.status || 500;
    const statusText = error.statusText || 'Internal Server Error';
    broadcastLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      statusText,
      durationMs,
      requestBody,
      responseBody: { error: error.message, details: error.details },
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': status.toString(),
      },
    });
    throw error;
  }
}

// Database initialisation
function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// Validation helpers
export function validateProductData(input: Partial<Product>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!input.name || input.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Product title must be at least 3 characters long.' });
  }
  if (input.price === undefined || input.price === null || isNaN(input.price) || input.price <= 0) {
    errors.push({ field: 'price', message: 'Price must be a valid positive amount greater than $0.' });
  }
  if (input.stock === undefined || input.stock === null || isNaN(input.stock) || input.stock < 0) {
    errors.push({ field: 'stock', message: 'Inventory quantity cannot be negative.' });
  }
  if (!input.category) {
    errors.push({ field: 'category', message: 'Please select a valid product category.' });
  }
  if (!input.description || input.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters.' });
  }
  return errors;
}

export function validateCustomerInfo(info: CustomerInfo): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!info.fullName || info.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Please provide your full legal name.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!info.email || !emailRegex.test(info.email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }
  const phoneDigits = (info.phone || '').replace(/\D/g, '');
  if (phoneDigits.length < 8) {
    errors.push({ field: 'phone', message: 'Please enter a valid telephone number (at least 8 digits).' });
  }
  if (!info.address || info.address.trim().length < 5) {
    errors.push({ field: 'address', message: 'Please enter a complete delivery street address.' });
  }
  if (!info.city || info.city.trim().length < 2) {
    errors.push({ field: 'city', message: 'Please enter your city.' });
  }
  if (!info.postalCode || info.postalCode.trim().length < 3) {
    errors.push({ field: 'postalCode', message: 'Please enter a valid postal or ZIP code.' });
  }
  if (info.paymentMethod === 'card') {
    const cardDigits = (info.cardNumber || '').replace(/\D/g, '');
    if (cardDigits.length < 15 || cardDigits.length > 16) {
      errors.push({ field: 'cardNumber', message: 'Card number must be 15 or 16 digits.' });
    }
    if (!info.cardExp || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(info.cardExp.trim())) {
      errors.push({ field: 'cardExp', message: 'Expiry format must be MM/YY.' });
    }
    const cvcDigits = (info.cardCvc || '').replace(/\D/g, '');
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      errors.push({ field: 'cardCvc', message: 'CVC code must be 3 or 4 digits.' });
    }
  }
  return errors;
}

/**
 * Public REST Client Service
 */
export const api = {
  /**
   * GET /api/products
   * Supports search query, category filtering, min/max price, and sorting
   */
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    const queryParts: string[] = [];
    if (options.search) queryParts.push(`search=${encodeURIComponent(options.search)}`);
    if (options.category && options.category !== 'All') queryParts.push(`category=${options.category}`);
    if (options.minPrice !== undefined) queryParts.push(`minPrice=${options.minPrice}`);
    if (options.maxPrice !== undefined) queryParts.push(`maxPrice=${options.maxPrice}`);
    if (options.sortBy) queryParts.push(`sort=${options.sortBy}`);
    if (options.inStockOnly) queryParts.push(`inStock=true`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const endpoint = `/api/products${queryString}`;

    return logTransaction<Product[]>('GET', endpoint, null, async () => {
      await delay(140);
      let list = loadProducts();

      // Search filter
      if (options.search && options.search.trim()) {
        const q = options.search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.materials.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }

      // Category filter
      if (options.category && options.category !== 'All') {
        list = list.filter((p) => p.category === options.category);
      }

      // Price filters
      if (options.minPrice !== undefined) {
        list = list.filter((p) => p.price >= (options.minPrice ?? 0));
      }
      if (options.maxPrice !== undefined) {
        list = list.filter((p) => p.price <= (options.maxPrice ?? Infinity));
      }

      // In-stock filter
      if (options.inStockOnly) {
        list = list.filter((p) => p.stock > 0);
      }

      // Sorting
      switch (options.sortBy) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }

      return { status: 200, statusText: 'OK', data: list };
    });
  },

  /**
   * GET /api/products/:id
   */
  async getProductById(id: string): Promise<Product> {
    const endpoint = `/api/products/${id}`;
    return logTransaction<Product>('GET', endpoint, null, async () => {
      await delay(90);
      const list = loadProducts();
      const product = list.find((p) => p.id === id);
      if (!product) {
        const err: any = new Error(`Product with ID '${id}' was not found.`);
        err.status = 404;
        err.statusText = 'Not Found';
        throw err;
      }
      return { status: 200, statusText: 'OK', data: product };
    });
  },

  /**
   * POST /api/products
   * Creates a new product with full schema validation
   */
  async createProduct(input: Omit<Product, 'id' | 'sku' | 'rating' | 'reviewsCount' | 'inStock'>): Promise<Product> {
    const endpoint = '/api/products';
    return logTransaction<Product>('POST', endpoint, input, async () => {
      await delay(220);
      const validationErrors = validateProductData(input);
      if (validationErrors.length > 0) {
        const err: any = new Error('Validation failed for product creation.');
        err.status = 422;
        err.statusText = 'Unprocessable Entity';
        err.details = validationErrors;
        throw err;
      }

      const list = loadProducts();
      const newId = `prod-${Date.now().toString(36)}`;
      const categoryAbbr = input.category ? input.category.substring(0, 3).toUpperCase() : 'GEN';
      const randomNum = Math.floor(10 + Math.random() * 90);
      const newSku = `AUR-${categoryAbbr}-${randomNum}`;

      const newProduct: Product = {
        ...input,
        id: newId,
        sku: newSku,
        rating: 5.0,
        reviewsCount: 1,
        inStock: (input.stock ?? 0) > 0,
        features: input.features && input.features.length > 0 ? input.features : ['Artisanal construction', 'Designed in Copenhagen'],
        dimensions: input.dimensions || 'Custom Specification',
        materials: input.materials || 'European Oak, Brushed Metal',
        imageType: (input.imageType as ProductImageType) || 'speaker',
        accentColor: input.accentColor || '#B45309',
        isNew: true,
      };

      list.unshift(newProduct);
      saveProducts(list);

      return { status: 201, statusText: 'Created', data: newProduct };
    });
  },

  /**
   * PUT /api/products/:id
   * Updates an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const endpoint = `/api/products/${id}`;
    return logTransaction<Product>('PUT', endpoint, updates, async () => {
      await delay(180);
      const list = loadProducts();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) {
        const err: any = new Error(`Cannot update product: Product '${id}' not found.`);
        err.status = 404;
        err.statusText = 'Not Found';
        throw err;
      }

      const existing = list[index];
      const merged = { ...existing, ...updates };

      const validationErrors = validateProductData(merged);
      if (validationErrors.length > 0) {
        const err: any = new Error('Validation failed for product update.');
        err.status = 422;
        err.statusText = 'Unprocessable Entity';
        err.details = validationErrors;
        throw err;
      }

      merged.inStock = (merged.stock ?? 0) > 0;
      list[index] = merged;
      saveProducts(list);

      return { status: 200, statusText: 'OK', data: merged };
    });
  },

  /**
   * DELETE /api/products/:id
   */
  async deleteProduct(id: string): Promise<{ success: boolean; deletedId: string }> {
    const endpoint = `/api/products/${id}`;
    return logTransaction<{ success: boolean; deletedId: string }>('DELETE', endpoint, null, async () => {
      await delay(150);
      const list = loadProducts();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) {
        const err: any = new Error(`Cannot delete: Product '${id}' not found.`);
        err.status = 404;
        err.statusText = 'Not Found';
        throw err;
      }

      list.splice(index, 1);
      saveProducts(list);

      return { status: 200, statusText: 'OK', data: { success: true, deletedId: id } };
    });
  },

  /**
   * POST /api/coupons/validate
   */
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountPercent: number; discountAmount: number; message: string }> {
    const endpoint = '/api/coupons/validate';
    return logTransaction('POST', endpoint, { code, subtotal }, async () => {
      await delay(110);
      const cleanCode = (code || '').trim().toUpperCase();
      const match = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

      if (!match) {
        const err: any = new Error(`Coupon code '${cleanCode}' is invalid or has expired.`);
        err.status = 400;
        err.statusText = 'Bad Request';
        throw err;
      }

      if (subtotal < match.minSubtotal) {
        const err: any = new Error(`Coupon requires a minimum subtotal of $${match.minSubtotal.toFixed(2)}.`);
        err.status = 400;
        err.statusText = 'Bad Request';
        throw err;
      }

      const discountAmount = Math.round((subtotal * match.discountPercent) / 100);
      return {
        status: 200,
        statusText: 'OK',
        data: {
          valid: true,
          discountPercent: match.discountPercent,
          discountAmount,
          message: `${match.discountPercent}% discount applied successfully!`
        }
      };
    });
  },

  /**
   * POST /api/orders
   * Processes order: validates client info, verifies real inventory stock, and decrements stock atomically
   */
  async createOrder(payload: {
    items: CartItem[];
    customer: CustomerInfo;
    couponCode?: string;
  }): Promise<Order> {
    const endpoint = '/api/orders';
    return logTransaction<Order>('POST', endpoint, payload, async () => {
      await delay(280);

      // 1. Validate cart
      if (!payload.items || payload.items.length === 0) {
        const err: any = new Error('Cannot place an order with an empty cart.');
        err.status = 400;
        err.statusText = 'Bad Request';
        throw err;
      }

      // 2. Validate customer information
      const customerErrors = validateCustomerInfo(payload.customer);
      if (customerErrors.length > 0) {
        const err: any = new Error('Customer information failed validation.');
        err.status = 422;
        err.statusText = 'Unprocessable Entity';
        err.details = customerErrors;
        throw err;
      }

      // 3. Validate stock availability and calculate subtotal
      const products = loadProducts();
      let subtotal = 0;

      for (const item of payload.items) {
        const currentProd = products.find((p) => p.id === item.product.id);
        if (!currentProd) {
          const err: any = new Error(`Product '${item.product.name}' is no longer available.`);
          err.status = 400;
          err.statusText = 'Bad Request';
          throw err;
        }
        if (currentProd.stock < item.quantity) {
          const err: any = new Error(
            `Insufficient stock for '${currentProd.name}'. Requested ${item.quantity}, but only ${currentProd.stock} remain.`
          );
          err.status = 400;
          err.statusText = 'Bad Request';
          throw err;
        }
        subtotal += currentProd.price * item.quantity;
      }

      // 4. Calculate discounts, shipping, tax
      let discount = 0;
      if (payload.couponCode) {
        const clean = payload.couponCode.trim().toUpperCase();
        const coupon = AVAILABLE_COUPONS.find((c) => c.code === clean);
        if (coupon && subtotal >= coupon.minSubtotal) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
        }
      }

      const taxableSubtotal = Math.max(0, subtotal - discount);
      const shipping = taxableSubtotal >= 150 ? 0 : 15;
      const tax = Math.round(taxableSubtotal * 0.08); // 8% estimated tax
      const total = taxableSubtotal + shipping + tax;

      // 5. Decrement inventory atomically
      for (const item of payload.items) {
        const prodIndex = products.findIndex((p) => p.id === item.product.id);
        if (prodIndex !== -1) {
          products[prodIndex].stock -= item.quantity;
          products[prodIndex].inStock = products[prodIndex].stock > 0;
        }
      }
      saveProducts(products);

      // 6. Create confirmed Order
      const orderNumber = `AUR-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderDate = new Date();
      const estDelivery = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000); // +4 days

      const newOrder: Order = {
        id: `ord-${Date.now().toString(36)}`,
        orderNumber,
        items: payload.items,
        subtotal,
        discount,
        couponCode: payload.couponCode,
        shipping,
        tax,
        total,
        customer: {
          ...payload.customer,
          // Mask sensitive credit card digits for PCI compliance
          cardNumber: payload.customer.cardNumber
            ? `•••• •••• •••• ${payload.customer.cardNumber.slice(-4)}`
            : undefined,
          cardCvc: undefined,
        },
        status: 'confirmed',
        createdAt: orderDate.toISOString(),
        estimatedDelivery: estDelivery.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };

      const orders = loadOrders();
      orders.unshift(newOrder);
      saveOrders(orders);

      return { status: 201, statusText: 'Created', data: newOrder };
    });
  },

  /**
   * GET /api/orders
   */
  async getOrders(): Promise<Order[]> {
    const endpoint = '/api/orders';
    return logTransaction<Order[]>('GET', endpoint, null, async () => {
      await delay(100);
      const orders = loadOrders();
      return { status: 200, statusText: 'OK', data: orders };
    });
  },

  /**
   * Reset local database to factory seed data
   */
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const endpoint = '/api/admin/reset';
    return logTransaction('POST', endpoint, { action: 'factory_reset' }, async () => {
      await delay(160);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      return {
        status: 200,
        statusText: 'OK',
        data: { success: true, message: 'Database reset to initial 8 Scandinavian acoustic and furniture products.' }
      };
    });
  }
};
