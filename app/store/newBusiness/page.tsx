'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { getBusinessProfile, getStoreProducts, saveCheckoutOrder, BusinessProfile, StoreProduct } from '@/lib/storeData';

// ==========================================
// STRICT TYPES & INTERFACES
// ==========================================
interface Vendor extends BusinessProfile {
  estimatedDeliveryTime?: string;
  rating?: string;
}

interface Product extends StoreProduct {
  category?: string;
  isPopular?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface UserContext {
  name: string;
  activeAddress: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const DEFAULT_STORE_CATEGORIES: Category[] = [
  { id: 'general', name: 'General', icon: '📦' },
];

export default function GenericCustomerStorefront() {
  const router = useRouter();

  // Active Runtime Core States
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_STORE_CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [vatRate, setVatRate] = useState(0.075);
  const [deliveryFee, setDeliveryFee] = useState(2000);

  // User Context Session Data Mock Hook Ready
  const [userContext, setUserContext] = useState<UserContext>({
    name: 'Usman John',
    activeAddress: 'IHVN Tower A, Jabi, Abuja',
  });

  // ==========================================
  // DATA PIPELINE HYDRATION LOOP
  // ==========================================
  useEffect(() => {
    // Sync dynamic metadata parameters out of local context layer
    const activeProfile = getBusinessProfile();
    const storedProducts = getStoreProducts();

    if (activeProfile) {
      // Load global rules if they exist
      const savedRules = localStorage.getItem('global_store_rules');
      if (savedRules) {
        try {
          const parsed = JSON.parse(savedRules);
          if (parsed.vatRate !== undefined) setVatRate(parsed.vatRate);
          if (parsed.logisticsFee !== undefined) setDeliveryFee(parsed.logisticsFee);
        } catch (e) {
          console.error("Error parsing store rules", e);
        }
      }

      setVendor({
        ...activeProfile,
        estimatedDeliveryTime: ' '
      });

      setCategories(
        activeProfile.categories?.length
          ? activeProfile.categories.map((category) => ({
              id: category.id,
              name: category.name,
              icon: category.icon ?? '📦',
            }))
          : DEFAULT_STORE_CATEGORIES
      );
    }

    if (storedProducts) {
      // Dynamic fallback mappings ensuring categories match criteria
      const structuredItems = storedProducts.map((item, idx) => ({
        ...item,
        category: item.category || 'general',
        isPopular: item.isPopular ?? false,
      }));
      setProducts(structuredItems.filter(p => !p.isDelisted));
    }

    setIsMounted(true);
  }, []);

  // ==========================================
  // BUSINESS OPERATIONS & FILTERS
  // ==========================================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.description}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || product.category?.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const popularProducts = useMemo(() => {
    return products.filter((p) => p.isPopular && p.stock > 0);
  }, [products]);

  const handleAddToCart = (id: string, name: string, price: number) => {
    const target = products.find((p) => p.id === id);
    if (!target || target.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        if (existing.qty >= target.stock) return prev; // Locks addition to active warehouse stock thresholds
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id, name, price, qty: 1 }];
    });
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Aggregated Cart Computed Metrics
  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartCost = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleCheckoutRedirect = () => {
    if (cart.length === 0 || !vendor) return;

    // Persist active cart orders downstream into your checkout pipelines
    saveCheckoutOrder({
      id: `order-${Date.now()}`,
      businessName: vendor.name,
      bankName: vendor.bankName || 'Access Bank PLC',
      accountNumber: vendor.accountNumber || '0123456789',
      accountName: vendor.name,
      items: cart,
      subtotal: totalCartCost,
      vat: Math.round(totalCartCost * vatRate),
      delivery: deliveryFee,
      total: totalCartCost + Math.round(totalCartCost * vatRate) + deliveryFee,
      status: 'pending',
    });

    router.push('/checkout/pending');
  };

  // Safe SSR compilation guard rendering structural skeleton layout blocks
  if (!isMounted || !vendor) {
    return <StorefrontSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-28 font-sans w-full relative">
      <div className="max-w-7xl mx-auto bg-white shadow-sm min-h-screen">
        {/* LAYER 1: GLOBAL STICKY HEADER COMPONENT */}
        
        <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 px-6 md:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-1 mx-2">
            <h1 className="font-bold text-lg text-gray-900 truncate">{vendor.name}</h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 block">Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-500" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Options">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* MAIN CONTENT AREA: Responsive Grid for Landscape PC View */}
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 border-r border-gray-50">
        {/* LAYER 2: CONTEXTUAL DELIVERY / LOCATION BANNER */}
        <section className="px-4 py-4">
          <div className="bg-[#EAF7EE] rounded-2xl p-3 flex items-center justify-between border border-[#D1F0DB]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-xs shrink-0">
                {/* Delivery icon accent matching image_511b46.png */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4 4V11h-8v5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wide">Deliver To</span>
                <h4 className="text-sm font-semibold text-gray-800 truncate">{userContext.name}</h4>
                <p className="text-xs text-gray-500 truncate">{userContext.activeAddress}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="bg-[#126B33] hover:bg-[#0D5226] text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors shadow-xs"
              >
                Change
              </button>
              <div className="bg-white px-2 py-1 rounded-xl shadow-xs border border-gray-100 text-center">
                <span className="text-[10px] font-bold text-black block leading-none">{vendor.estimatedDeliveryTime}</span>
                <span className="text-[8px] text-gray-400 block mt-0.5 font-medium">Delivery Time</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYER 3: UTILITY SEARCH BAR WITH OVERLAYED FLOATING CART BADGE */}
        <section className="px-4 py-3 relative">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dishes...."
              className="w-full bg-white pl-12 pr-14 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-600 transition-colors text-sm text-black shadow-xs placeholder:text-gray-400"
            />
            <div className="absolute right-4 flex items-center">
              <button onClick={handleCheckoutRedirect} disabled={cart.length === 0} className="relative p-1 text-green-600 hover:text-green-700 disabled:text-gray-400" aria-label="Open Cart View">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white font-bold rounded-full w-4 h-4 text-[9px] flex items-center justify-center border border-white">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* LAYER 4: HORIZONTAL CATEGORY CAROUSEL DECK */}
        <section className="py-2">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="font-bold text-base text-gray-800">Categories</h3>
            <button onClick={() => setActiveCategory('all')} className="text-xs font-semibold text-green-600 hover:text-green-700">See All</button>
          </div>
          <div className="flex flex-wrap gap-3 px-4 pb-2">
            {categories.map((category) => {
              const isActive = activeCategory.toLowerCase() === category.id.toLowerCase();
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`snap-start flex flex-col items-center justify-center p-2 rounded-xl min-w-16 border transition-all ${
                    isActive
                      ? 'border-green-600 bg-[#EAF7EE] text-green-800 font-semibold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center text-lg shadow-2xs mb-1">
                    {category.icon}
                  </div>
                  <span className="text-[11px] tracking-wide">{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* LAYER 5: "FEATURED / POPULAR" HORIZONTAL GRID */}
        {popularProducts.length > 0 && (
          <section className="py-3">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="font-bold text-base text-gray-800">Popular Dishes</h3>
              <Link href="#all-feed" className="text-xs font-semibold text-green-600 hover:text-green-700">See All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 pb-2">
              {popularProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs flex flex-col shrink-0 relative transition-transform duration-200 active:scale-98"
                >
                  <div className="block relative aspect-square w-full bg-gray-50">
                    <Image
                      src={product.media[0] || 'https://picsum.photos/200/200'}
                      alt={product.name}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2 flex flex-col justify-between flex-1 bg-white border-t border-gray-50">
                    <h4 className="font-semibold text-xs text-gray-900 truncate leading-tight">{product.name}</h4>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(product.price)}</span>
                      <button
                        onClick={() => handleAddToCart(product.id, product.name, product.price)}
                        className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors shadow-2xs"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <span className="text-sm font-bold leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LAYER 6: "ALL PRODUCTS / RECOMMENDATIONS" VERTICAL FEED */}
        <section id="all-feed" className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-gray-800">Recommended for you</h3>
            <button className="text-xs font-semibold text-green-600 hover:text-green-700">See All</button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-sm text-gray-400">
              No matching items found in warehouse catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-2xl p-3 flex gap-3 shadow-2xs items-center relative transition-all"
                  >
                    <div className="relative w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={product.media[0] || 'https://picsum.photos/100/100'}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-tight">{product.description}</p>
                      <span className="text-xs font-bold text-gray-900 block mt-1">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="absolute right-3 flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(product.id, product.name, product.price)}
                        className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-xs transition-colors"
                        aria-label="Add item"
                      >
                        <span className="text-lg font-bold leading-none">+</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                          isWishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500'
                        }`}
                        aria-label="Toggle wishlist item"
                      >
                        <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>

        {/* LAYER 7: FIXED STICKY BOTTOM FOOTER CTA BANNER */}
        {totalCartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2" style={{ backgroundImage: 'linear-gradient(to top, rgb(255,255,255), rgba(255,255,255,0.95), rgba(255,255,255,0))' }}>
            <div className="max-w-7xl mx-auto">
              <button
                onClick={handleCheckoutRedirect}
                className="w-full bg-[#126B33] hover:bg-[#0D5226] text-white py-4 px-5 rounded-2xl font-semibold flex items-center justify-between shadow-lg transition-all transform active:scale-99 group">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {totalCartCount}
                </div>
                <span className="text-sm font-medium tracking-wide">{formatCurrency(Math.round(totalCartCost * vatRate) + totalCartCost + deliveryFee)}</span>
              </div>
              <span className="text-sm tracking-wider uppercase font-bold pl-2">Continue</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              </button>
            </div>
          </div>
        )}
      </div>
 
 {/* MODAL WINDOW: ADDRESS MANAGEMENT SYSTEM */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center animate-fadeIn px-4">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6 md:p-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Change Delivery Address</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 text-lg p-1">✕</button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Recipient Name"
                value={userContext.name}
                onChange={(e) => setUserContext(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              />
              <textarea
                placeholder="Full Delivery Address"
                rows={2}
                value={userContext.activeAddress}
                onChange={(e) => setUserContext(prev => ({ ...prev, activeAddress: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Update Address Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// INFRASTRUCTURE SKELETON PLACEHOLDER
// ==========================================
function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-white mx-auto p-4 md:p-8 space-y-6 animate-pulse">
      <div className="flex justify-between items-center h-12 bg-gray-100 rounded-xl w-full" />
      <div className="h-20 bg-gray-100 rounded-2xl w-full" />
      <div className="h-12 bg-gray-100 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded-sm w-1/3" />
        <div className="flex gap-3 overflow-hidden">
          <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
          <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
          <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-2xl w-full" />
        <div className="h-20 bg-gray-100 rounded-2xl w-full" />
      </div>
    </div>
  );
}