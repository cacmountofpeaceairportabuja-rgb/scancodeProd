'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getStoreProducts, saveStoreProducts } from '@/lib/storeData';

const MAX_PRODUCT_MEDIA = 7;
const MAX_PRODUCT_MEDIA_BYTES = 5 * 1024 * 1024;
const MAX_PRODUCT_MEDIA_MB = MAX_PRODUCT_MEDIA_BYTES / (1024 * 1024);

const revokeObjectUrl = (url: string) => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('Unable to revoke product media preview URL.', error);
  }
};

const parseRequiredNumber = (value: string) => {
  const normalizedValue = value.trim().replace(/,/g, '');
  if (!normalizedValue) return Number.NaN;
  return Number(normalizedValue);
};

const parseRequiredInteger = (value: string) => {
  const normalizedValue = value.trim().replace(/,/g, '');
  if (!/^\d+$/.test(normalizedValue)) return Number.NaN;
  return Number(normalizedValue);
};

const fileToDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isDelisted: boolean;
  media: string[];
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  vat: number;
  delivery: number;
  total: number;
  status: 'pending' | 'confirmed';
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ScanCode Smart Tag v2',
    description: 'Compact smart tag for payments and tracking.',
    price: 7500,
    stock: 42,
    isDelisted: false,
    media: [],
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'charges' | 'orders'>('products');
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const productMediaRef = useRef<string[]>([]);
  const isLoading = false;
  const [products, setProducts] = useState<Product[]>(() => getStoreProducts() ?? INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order-1',
      customer: 'Chidi Okafor',
      phone: '+234 803 111 2222',
      items: [{ name: 'ScanCode Smart Tag v2', qty: 2, price: 7500 }],
      vat: 1125,
      delivery: 2000,
      total: 18125,
      status: 'pending',
    },
  ]);
  const [vatRate, setVatRate] = useState<string>('7.5');
  const [deliveryFee, setDeliveryFee] = useState<string>('2000');
  const [productMedia, setProductMedia] = useState<string[]>([]);

  useEffect(() => {
    saveStoreProducts(products);
  }, [products]);

  useEffect(() => {
    productMediaRef.current = productMedia;
  }, [productMedia]);

  useEffect(() => {
    return () => {
      productMediaRef.current.forEach(revokeObjectUrl);
    };
  }, []);

  const handleProductMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_PRODUCT_MEDIA - productMedia.length;
    if (remaining <= 0) {
      setProductFeedback({ type: 'error', message: `You can upload up to ${MAX_PRODUCT_MEDIA} product images.` });
      e.currentTarget.value = '';
      return;
    }

    const acceptedFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        rejectedFiles.push(`${file.name} is not an image.`);
        continue;
      }

      if (file.size > MAX_PRODUCT_MEDIA_BYTES) {
        rejectedFiles.push(`${file.name} is larger than ${MAX_PRODUCT_MEDIA_MB}MB.`);
        continue;
      }

      if (acceptedFiles.length < remaining) {
        acceptedFiles.push(file);
      }
    }

    if (files.length > remaining) {
      rejectedFiles.push(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added.`);
    }

    try {
      const newMedia = await Promise.all(acceptedFiles.map(fileToDataUrl));
      setProductMedia((prev) => [...prev, ...newMedia]);

      if (rejectedFiles.length > 0) {
        setProductFeedback({ type: 'error', message: rejectedFiles.slice(0, 3).join(' ') });
      } else if (newMedia.length > 0) {
        setProductFeedback(null);
      }
    } catch {
      setProductFeedback({ type: 'error', message: 'Unable to process one or more selected images. Please try again.' });
    }

    e.currentTarget.value = '';
  };

  const handleRemoveProductMedia = (idx: number) => {
    setProductMedia((prev) => {
      const url = prev[idx];
      if (url) revokeObjectUrl(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Form Inputs State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');

  // Action Feedback Utilities
  const [productFeedback, setProductFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [chargesFeedback, setChargesFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Dashboard operates fully on client-side state in this version.

  // --- Live Database Mutation Handlers ---

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductFeedback(null);

    // Baseline Inputs Hard-Validation Guard
    if (!newProdName.trim()) return setProductFeedback({ type: 'error', message: 'Product Name is a required parameter field.' });
    if (!newProdDesc.trim() || newProdDesc.trim().length < 10) return setProductFeedback({ type: 'error', message: 'Provide a complete technical descriptive payload (Min 10 characters).' });
    if (productMedia.length === 0) return setProductFeedback({ type: 'error', message: 'Upload at least one product image before publishing this item.' });
    
    const parsedPrice = parseRequiredNumber(newProdPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setProductFeedback({ type: 'error', message: 'Item valuation pricing must exceed ₦0.' });
    
    const parsedStock = parseRequiredInteger(newProdStock);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) return setProductFeedback({ type: 'error', message: 'Inventory volume must be a whole number of 0 units or more.' });

    const createdProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      description: newProdDesc.trim(),
      price: parsedPrice,
      stock: parsedStock,
      isDelisted: false,
      media: productMedia,
    };

    setProducts((prev) => [createdProduct, ...prev]);
    setProductFeedback({ type: 'success', message: `Product "${createdProduct.name}" added to inventory.` });
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdStock('');
    setProductMedia([]);
  };

  const toggleDelistStatus = (id: string) => {
    setProducts((prev) => prev.map((product) =>
      product.id === id ? { ...product, isDelisted: !product.isDelisted } : product
    ));
  };

  const handleSaveCharges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChargesFeedback(null);

    const parsedVat = parseRequiredNumber(vatRate);
    if (!Number.isFinite(parsedVat) || parsedVat < 0 || parsedVat > 100) {
      return setChargesFeedback({ type: 'error', message: 'VAT must be a number between 0 and 100.' });
    }

    const parsedDelivery = parseRequiredNumber(deliveryFee);
    if (!Number.isFinite(parsedDelivery) || parsedDelivery < 0) {
      return setChargesFeedback({ type: 'error', message: 'Delivery fee must be zero or higher.' });
    }

    setChargesFeedback({ type: 'success', message: 'Global charge settings saved.' });
  };

  const confirmPaymentReceived = (orderId: string) => {
    setOrderFeedback(null);
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: 'confirmed' } : order));
    setOrderFeedback({ type: 'success', message: 'Payment has been confirmed successfully.' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row text-black overflow-x-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-6 flex-shrink-0">
        <div className="font-bold text-xl mb-4 lg:mb-6 text-green-600 px-1 sm:px-4">SellerCenter</div>
        <div className="flex lg:block gap-2 overflow-x-auto pb-1 lg:space-y-2 lg:overflow-visible">
          {(['products', 'charges', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 lg:w-full text-left px-4 sm:px-5 py-3 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-green-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {tab} Control
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full min-w-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
          
          {/* TAB 1: PRODUCT LISTING MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">List New Product Item</h2>
              
              {productFeedback && (
                <div className={`p-4 rounded-2xl border text-sm font-medium ${productFeedback.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {productFeedback.type === 'error' ? '⚠️ ' : '✓ '} {productFeedback.message}
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input type="text" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Product Name" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />
                  <textarea value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} placeholder="Product Description (Min 10 characters)" rows={3} className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none resize-none text-black placeholder:text-gray-400" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="Price (₦)" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />
                    <input type="number" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="Stock Count" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />
                  </div>
                </div>
                <div className="space-y-4 flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.click()}
                    disabled={productMedia.length >= MAX_PRODUCT_MEDIA}
                    aria-describedby="product-media-help"
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-600 cursor-pointer flex flex-col items-center justify-center h-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-gray-300"
                  >
                    <span id="product-media-help" className="text-gray-500 text-sm block">
                      Upload Product Media Images (Max {MAX_PRODUCT_MEDIA}, {MAX_PRODUCT_MEDIA_MB}MB each)
                    </span>
                    <span className="text-sm text-gray-600 mt-3 block">{productMedia.length} / {MAX_PRODUCT_MEDIA} selected</span>
                    <input
                      ref={productInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProductMediaUpload}
                      className="hidden"
                    />
                  </button>
                  {productMedia.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {productMedia.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <Image
                            src={img}
                            alt={`Product media preview ${idx + 1}`}
                            fill
                            sizes="96px"
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Remove product media preview ${idx + 1}`}
                            onClick={() => handleRemoveProductMedia(idx)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors">Publish Product to Store</button>
                </div>
              </form>
              
              <hr className="border-gray-200 my-8" />
              
              <h3 className="text-xl font-semibold mb-4">Active Store Inventory</h3>
              
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map(n => <div key={n} className="h-24 bg-gray-100 rounded-2xl w-full" />)}
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6 border border-dashed border-gray-200 rounded-2xl">No products are currently cataloged on your digital store server database layout.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between bg-white shadow-xs">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 flex-shrink-0">📦</div>
                        <div className="min-w-0">
                          <h4 className={`font-semibold ${product.isDelisted ? 'line-through text-gray-400' : 'text-black'}`}>{product.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                          <p className="text-sm text-gray-500">₦{product.price.toLocaleString()} • Stock: {product.stock} units</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleDelistStatus(product.id)} className={`w-full sm:w-auto px-4 py-2 rounded-xl font-medium text-sm transition-colors ${product.isDelisted ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                        {product.isDelisted ? 'Relist Item' : 'Delist Item'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYSTEM SURCHARGES CONFIG */}
          {activeTab === 'charges' && (
            <form onSubmit={handleSaveCharges} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Additional Global Surcharges</h2>
              
              {chargesFeedback && (
                <div className={`p-4 rounded-2xl border text-sm font-medium max-w-md ${chargesFeedback.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {chargesFeedback.type === 'error' ? '⚠️ ' : '✓ '} {chargesFeedback.message}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4 max-w-md animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">VAT / Tax Percentage (%)</label>
                    <input type="number" step="0.1" value={vatRate} onChange={(e) => setVatRate(e.target.value)} placeholder="7.5" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Flat-Rate Logistics Delivery Fee (₦)</label>
                    <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="2000" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-2xl transition-colors">Save Global Rules</button>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: REALTIME LIVE INCOMING TRANSACTIONS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">Live Real-time Incoming Streams</h2>
                <span className={`h-3 w-3 rounded-full ${isLoading ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`}></span>
              </div>

              {orderFeedback && (
                <div className="p-4 rounded-2xl border text-sm font-medium bg-red-50 text-red-600 border-red-200 max-w-md mx-auto">
                  ⚠️ {orderFeedback.message}
                </div>
              )}
              
              {isLoading ? (
                <div className="h-64 bg-gray-100 rounded-2xl max-w-md mx-auto animate-pulse" />
              ) : orders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-12 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">No client payments or transfer transactions pending approval.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-gray-50 max-w-md mx-auto shadow-inner space-y-4">
                    <div className="text-center border-b border-dashed border-gray-300 pb-4 space-y-2">
                      <h3 className="font-bold text-base sm:text-lg uppercase tracking-wider">Transaction Invoice</h3>
                      <p className="text-xs text-gray-500">ScanCode Automated Ecosystem</p>
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium text-gray-600">Customer:</span> {order.customer}</p>
                      <p><span className="font-medium text-gray-600">Contact:</span> {order.phone}</p>
                    </div>

                    <div className="border-b border-t border-dashed border-gray-300 py-3 text-sm space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between gap-4">
                          <span className="min-w-0">{item.name} x{item.qty}</span>
                          <span className="whitespace-nowrap">₦{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm space-y-1 text-gray-600">
                      <div className="flex justify-between"><span>Surcharge VAT</span><span>+ ₦{order.vat}</span></div>
                      <div className="flex justify-between"><span>Logistics Delivery</span><span>+ ₦{order.delivery}</span></div>
                      <div className="flex justify-between gap-4 font-bold text-black text-base mt-2 pt-2 border-t border-gray-200">
                        <span>Grand Settlement Total</span><span>₦{order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {order.status === 'pending' ? (
                      <button type="button" onClick={() => confirmPaymentReceived(order.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors text-center mt-4">
                        Confirm Payment Received
                      </button>
                    ) : (
                      <div className="w-full bg-gray-200 text-gray-600 font-semibold py-4 rounded-2xl text-center mt-4 cursor-default">
                        ✓ Payment Processed
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
