'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { BusinessProfile, getBusinessProfile, getStoreProducts, saveCheckoutOrder, StoreProduct } from '@/lib/storeData';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface DisplayProduct extends StoreProduct {
  accent: string;
}

const STORE_ITEMS = [
  {
    id: 'demo-1',
    name: 'Asset Identification Sticker Pack',
    description: 'High resilience weather-resistant QR material tracking sheets.',
    price: 4500,
    stock: 30,
    isDelisted: false,
    media: [],
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'demo-2',
    name: 'Smart Metallic Business Card',
    description: 'Laser engraved premium profile communication chip layers.',
    price: 12000,
    stock: 15,
    isDelisted: false,
    media: [],
    accent: 'bg-slate-100 text-slate-700',
  },
] satisfies DisplayProduct[];

const DEFAULT_BUSINESS: BusinessProfile = {
  name: 'Acme Logistics Corp',
  description: 'Verified Merchant Workspace Channel',
  phone: '',
  email: '',
  bankName: 'Access Bank PLC',
  accountNumber: '0123456789',
  images: [],
};

export default function PublicStorefront() {
  const router = useRouter();
  const orderIdPrefix = useId();
  const orderCountRef = useRef(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartFeedback, setCartFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<DisplayProduct | null>(null);
  const [business] = useState<BusinessProfile>(() => getBusinessProfile() ?? DEFAULT_BUSINESS);
  const [products] = useState<DisplayProduct[]>(() => {
    const savedProducts = getStoreProducts()
      ?.filter((product) => !product.isDelisted && product.stock > 0)
      .map((product, index) => ({
        ...product,
        accent: index % 2 === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
      }));

    if (savedProducts?.length) {
      return savedProducts;
    }

    return STORE_ITEMS;
  });

  const filteredStoreItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleAddToCart = (id: string, name: string, price: number) => {
    setCartFeedback(null);
    setCart(prev => {
      const exists = prev.find(item => item.id === id);
      if (exists) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, name, price, qty: 1 }];
    });
    setCartFeedback({ type: 'success', message: `${name} added to your cart.` });
  };

  const handleProductCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, item: DisplayProduct) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPreviewItem(item);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const targetQty = item.qty + change;
        return targetQty > 0 ? { ...item, qty: targetQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Computational Totals Mechanics
  const itemSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const calculatedVat = Math.round(itemSubtotal * 0.075);
  const logisticsFee = itemSubtotal > 0 ? 2000 : 0;
  const grandTotal = itemSubtotal + calculatedVat + logisticsFee;
  const globalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const executeCheckoutRedirect = () => {
    setCartFeedback(null);

    // Cart Requirement Verification
    if (cart.length === 0) {
      setCartFeedback({ type: 'error', message: 'Your shopping cart is currently empty. Add products before proceeding.' });
      return;
    }

    setCart([]);
    orderCountRef.current += 1;
    saveCheckoutOrder({
      id: `order-${orderIdPrefix}-${orderCountRef.current}`,
      businessName: business.name,
      bankName: business.bankName || DEFAULT_BUSINESS.bankName,
      accountNumber: business.accountNumber || DEFAULT_BUSINESS.accountNumber,
      accountName: business.name,
      items: cart,
      subtotal: itemSubtotal,
      vat: calculatedVat,
      delivery: logisticsFee,
      total: grandTotal,
      status: 'pending',
    });
    router.push('/checkout/pending');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black relative">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-black truncate">{business.name}</h1>
          <p className="text-xs text-gray-500">{business.description || 'Verified Merchant Workspace Channel'}</p>
        </div>
        <button onClick={() => { setIsCartOpen(true); setCartFeedback(null); }} className="relative bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
          <span>🛒</span> <span className="font-semibold">Cart</span>
          {globalCartCount > 0 && <span className="bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{globalCartCount}</span>}
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 h-fit space-y-4">
          <h3 className="font-semibold text-lg">Discovery Filter</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name/keyword..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-green-600 text-sm text-black"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {filteredStoreItems.length === 0 ? (
            <div className="sm:col-span-2 bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
              No products match your search.
            </div>
          ) : filteredStoreItems.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setPreviewItem(item)}
              onKeyDown={(event) => handleProductCardKeyDown(event, item)}
              className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              <div className={`relative aspect-video w-full ${item.media[0] ? 'bg-gray-100' : item.accent} flex items-center justify-center px-6 text-center`}>
                {item.media[0] ? (
                  <Image src={item.media[0]} alt={item.name} fill sizes="(max-width: 640px) 100vw, 384px" unoptimized className="object-cover" />
                ) : (
                  <span className="text-sm font-semibold uppercase tracking-wide">{item.name}</span>
                )}
              </div>
              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                    <span className="font-bold text-green-600 whitespace-nowrap">₦{item.price.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">{item.description}</p>
                </div>
                <button 
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToCart(item.id, item.name, item.price);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-sm mt-4"
                >
                  Add to Shopping Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 px-4 py-6 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl max-h-full overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl">
            <div className={`relative aspect-video w-full ${previewItem.media[0] ? 'bg-gray-100' : previewItem.accent} flex items-center justify-center px-8 text-center`}>
              {previewItem.media[0] ? (
                <Image src={previewItem.media[0]} alt={previewItem.name} fill sizes="672px" unoptimized className="object-cover" />
              ) : (
                <span className="text-lg sm:text-2xl font-bold uppercase tracking-wide">{previewItem.name}</span>
              )}
            </div>
            <div className="p-5 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{previewItem.name}</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">{previewItem.description}</p>
                </div>
                <button
                  type="button"
                  aria-label="Close product preview"
                  onClick={() => setPreviewItem(null)}
                  className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xl text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-5">
                <span className="text-2xl font-bold text-green-600">₦{previewItem.price.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(previewItem.id, previewItem.name, previewItem.price);
                    setIsCartOpen(true);
                    setPreviewItem(null);
                  }}
                  className="w-full sm:w-auto rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Add to Shopping Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Panel overlay implementation */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white h-full p-5 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl sm:text-2xl font-bold">Shopping Cart</h2>
                <button type="button" aria-label="Close cart" onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black text-xl p-2">✕</button>
              </div>

              {cartFeedback && (
                <div className={`p-4 border text-xs font-medium rounded-xl ${cartFeedback.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {cartFeedback.message}
                </div>
              )}

              {/* Dynamic Drawer List */}
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-10">Your shopping cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 justify-between items-center border-b border-gray-100 pb-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-green-600 font-medium">₦{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-xl flex-shrink-0">
                        <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)} className="font-bold text-gray-500 hover:text-black">-</button>
                        <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                        <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)} className="font-bold text-gray-500 hover:text-black">+</button>
                      </div>
                    </div>
                  ))}

                  {/* Calculations breakdown readout panel */}
                  <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2 border border-gray-200">
                    <div className="flex justify-between text-gray-500"><span>Items Subtotal</span><span>₦{itemSubtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>VAT (7.5%)</span><span>+ ₦{calculatedVat.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Logistics Delivery</span><span>+ ₦{logisticsFee.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2 text-black"><span>Total Bill</span><span>₦{grandTotal.toLocaleString()}</span></div>
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={executeCheckoutRedirect} className="w-full mt-6 text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors text-base sm:text-lg">
              Finalize Order & Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
