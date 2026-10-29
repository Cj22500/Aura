/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, Order, ProductCategory } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { DeveloperInspector } from './components/DeveloperInspector';
import { StudioConcierge } from './components/StudioConcierge';
import { VoiceModal } from './components/VoiceModal';
import { WishlistModal } from './components/WishlistModal';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'aura_cart_items_v1';
const WISHLIST_STORAGE_KEY = 'aura_wishlist_v1';

export default function App() {
  // Storefront & Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Cart State with LocalStorage sync
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Modal / Drawer visibility
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Wishlist State with LocalStorage sync
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  // Fetch orders count on mount
  useEffect(() => {
    api.getOrders().then((ords) => setOrdersCount(ords.length)).catch(() => {});
  }, []);

  // Fetch products with filters
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const data = await api.getProducts({
        category: activeCategory,
        search: searchTerm,
        sortBy,
        inStockOnly,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeCategory, searchTerm, sortBy, inStockOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 120); // Debounce search and filter updates
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!product.inStock || product.stock <= 0) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const current = prev[existingIndex];
        const newQty = Math.min(product.stock, current.quantity + quantity);
        const updated = [...prev];
        updated[existingIndex] = { ...current, quantity: newQty };
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.stock, newQty);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyCoupon = (code: string, discount: number) => {
    setAppliedCoupon(code);
    setCouponDiscount(discount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Checkout flow
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setLatestOrder(order);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setOrdersCount((c) => c + 1);
    // Refresh product stock after successful purchase
    loadProducts();
  };

  // Admin CRUD updates
  const handleProductCreated = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleProductUpdated = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    if (selectedProduct && selectedProduct.id === updatedProd.id) {
      setSelectedProduct(updatedProd);
    }
  };

  const handleProductDeleted = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCartItems((prev) => prev.filter((item) => item.product.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await api.resetDatabase();
      await loadProducts();
      setCartItems([]);
      setOrdersCount(0);
      alert('Database restored to initial 8 Scandinavian acoustic and furniture objects.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExploreScroll = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeaturedClick = () => {
    const flagship = products.find((p) => p.imageType === 'speaker') || products[0];
    if (flagship) {
      setSelectedProduct(flagship);
    }
  };

  // Wishlist handlers
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const handleAddAllWishlistToCart = () => {
    const available = products.filter(
      (p) => wishlistIds.includes(p.id) && p.inStock && p.stock > 0
    );
    available.forEach((p) => {
      handleAddToCart(p, 1);
    });
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const cartProductIds = useMemo(() => new Set(cartItems.map((i) => i.product.id)), [cartItems]);
  const wishlistProductIdsSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isWishlistView={isWishlistOpen}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={ordersCount}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          handleExploreScroll();
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onResetDb={handleResetDatabase}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Editorial Hero Showcase */}
        <HeroSection
          onExploreClick={handleExploreScroll}
          onFeaturedClick={handleFeaturedClick}
        />

        {/* Dynamic Product Catalog & Filtering Toolbar */}
        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          selectedCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          inStockOnly={inStockOnly}
          onToggleInStock={() => setInStockOnly((prev) => !prev)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
          cartProductIds={cartProductIds}
          wishlistProductIds={wishlistProductIdsSet}
          onToggleWishlist={handleToggleWishlist}
          onResetFilters={() => {
            setActiveCategory('All');
            setSearchTerm('');
            setInStockOnly(false);
            setSortBy('featured');
          }}
          totalAvailable={products.length}
        />
      </main>

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        currentCartQty={
          selectedProduct
            ? cartItems.find((i) => i.product.id === selectedProduct.id)?.quantity || 0
            : 0
        }
        isWishlisted={selectedProduct ? wishlistProductIdsSet.has(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* My Wishlist Drawer */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onAddAllToCart={handleAddAllWishlistToCart}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Slide-Over Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        couponCode={appliedCoupon}
        couponDiscount={couponDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderReceiptModal
        order={latestOrder}
        onClose={() => setIsReceiptOpen(false)}
        onViewOrders={() => {
          setIsReceiptOpen(false);
          setIsOrdersOpen(true);
        }}
      />

      {/* Inventory Operations (Admin CRUD) */}
      <InventoryManagerModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onProductCreated={handleProductCreated}
        onProductUpdated={handleProductUpdated}
        onProductDeleted={handleProductDeleted}
        onResetDatabase={handleResetDatabase}
      />

      {/* Orders History Modal */}
      <OrdersHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onSelectOrder={(ord) => {
          setLatestOrder(ord);
          setIsReceiptOpen(true);
        }}
      />

      {/* Recruiter & Developer Telemetry Inspector */}
      <DeveloperInspector
        productsCount={products.length}
        ordersCount={ordersCount}
        onResetDb={handleResetDatabase}
      />

      {/* Aura Studio AI Concierge (Multi-Turn Chatbot & Search Grounding) */}
      <StudioConcierge onOpenVoice={() => setIsVoiceOpen(true)} />

      {/* Real-Time Hands-Free Voice Conversation (Gemini 3.8 Live API) */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* Quiet Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          handleExploreScroll();
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />
    </div>
  );
}
