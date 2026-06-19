'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getBusinessProfile, saveBusinessProfile, getStoreProducts, saveStoreProducts, getCheckoutOrder, saveCheckoutOrder, CheckoutOrder, CustomCategory, getVendorCategories, saveVendorCategories, StoreProduct } from '@/lib/storeData';

const MAX_PRODUCT_MEDIA = 7;
const MAX_PRODUCT_MEDIA_BYTES = 5 * 1024 * 1024;

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

// Simulated Async Cloud Storage Service Engine
const uploadToCloudStorage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomId = Math.floor(400 + Math.random() * 500);
      resolve(`https://picsum.photos/id/${randomId}/500/500`);
    }, 1000);
  });
};

const INITIAL_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-1',
    name: 'ScanCode Smart Tag v2',
    description: 'Compact smart tag for payments and tracking.',
    price: 7500,
    stock: 42,
    isDelisted: false,
    media: [],
    category: 'gadgets',
    isPopular: true,
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'charges' | 'orders'>('products');
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const isLoading = false;

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [liveOrder, setLiveOrder] = useState<CheckoutOrder | null>(null);
  const [vendorCategories, setVendorCategories] = useState<CustomCategory[]>([]);

const [selectedCategory, setSelectedCategory] = useState<string>('');
const [newCategoryName, setNewCategoryName] = useState<string>(''); // For the custom category input field
const [isFeatured, setIsFeatured] = useState<boolean>(false);
  
  const [vatRate, setVatRate] = useState<string>('7.5');
  const [deliveryFee, setDeliveryFee] = useState<string>('2000');
  const [productMedia, setProductMedia] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

// 1. Sync products array adjustments to storage
  useEffect(() => {
    if (products.length > 0) saveStoreProducts(products);
  }, [products]);

  // 2. Sync dynamic category adjustments back to storage
  useEffect(() => {
    if (vendorCategories.length > 0) {
      saveVendorCategories(vendorCategories);
      const activeProfile = getBusinessProfile();
      if (activeProfile) {
        saveBusinessProfile({
          ...activeProfile,
          categories: vendorCategories,
        });
      }
    }
  }, [vendorCategories]);

  // 3. Hydrate all storage entries on initial screen render
  useEffect(() => {
    // Safely pull existing products
    const savedProducts = getStoreProducts();
    if (savedProducts) setProducts(savedProducts);

    // Safely pull vendor-defined category array
    const savedCats = getVendorCategories();
    if (savedCats) {
      setVendorCategories(savedCats);
      if (savedCats.length > 0) {
        setSelectedCategory(savedCats[0].id); // Default dropdown selection to their first category
      }
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'scancode.checkoutOrder') {
        setLiveOrder(e.newValue ? (JSON.parse(e.newValue) as CheckoutOrder) : null);
      }
    };

    const savedRules = localStorage.getItem('global_store_rules');
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules);
        if (parsed.vatRate !== undefined) setVatRate((parsed.vatRate * 100).toString());
        if (parsed.logisticsFee !== undefined) setDeliveryFee(parsed.logisticsFee.toString());
      } catch (e) {
        console.error("Error parsing configuration rules on mount", e);
      }
    }

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

const handleProductMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.currentTarget.files ?? []);
  if (files.length === 0) return;

  const remaining = MAX_PRODUCT_MEDIA - productMedia.length;
  if (remaining <= 0) {
    setProductFeedback({ 
      type: 'error', 
      message: `You can upload up to ${MAX_PRODUCT_MEDIA} product images.` 
    });
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
      const maxMb = (MAX_PRODUCT_MEDIA_BYTES / (1024 * 1024)).toFixed(0);
      rejectedFiles.push(`${file.name} exceeds the ${maxMb}MB size limit.`);
      continue;
    }

    if (acceptedFiles.length < remaining) {
      acceptedFiles.push(file);
    } else {
      rejectedFiles.push(`${file.name} skipped (max limit reached).`);
    }
  }

  // Handle case where NO files survived validation
  if (acceptedFiles.length === 0) {
    setProductFeedback({ 
      type: 'error', 
      message: rejectedFiles.slice(0, 2).join(' ') 
    });
    e.currentTarget.value = '';
    return;
  }

  setUploadingMedia(true);
  setProductFeedback(null);

  try {
    const uploadedUrls = await Promise.all(acceptedFiles.map(uploadToCloudStorage));
    setProductMedia((prev) => [...prev, ...uploadedUrls]);

    if (rejectedFiles.length > 0) {
      setProductFeedback({ 
        type: 'error', 
        message: rejectedFiles.slice(0, 2).join(' ') 
      });
    }
  } catch {
    setProductFeedback({ 
      type: 'error', 
      message: 'Unable to process selected image uploads.' 
    });
  } finally {
    setUploadingMedia(false);
    e.currentTarget.value = '';
  }
};

  const handleRemoveProductMedia = (idx: number) => {
    setProductMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdStock, setNewProdStock] = useState<string>('');

  const [productFeedback, setProductFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [chargesFeedback, setChargesFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleCreateCustomCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  
  const cleanName = newCategoryName.trim();
  if (!cleanName) return;

  // Check if category name already exists to prevent duplicates
  const categoryExists = vendorCategories.some(
    (cat) => cat.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (categoryExists) {
    return setProductFeedback({ type: 'error', message: `The category "${cleanName}" already exists.` });
  }

  const newCat: CustomCategory = {
    id: `cat-${Date.now()}`,
    name: cleanName,
    icon: '📦' // Standard clean default icon profile
  };

  setVendorCategories((prev) => [...prev, newCat]);
  setSelectedCategory(newCat.id); // Automatically focus the dropdown selection to the new item
  setNewCategoryName('');
  setProductFeedback({ type: 'success', message: `Category "${cleanName}" added to options list.` });
};

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductFeedback(null);

    if (!newProdName.trim()) {
      return setProductFeedback({ type: 'error', message: 'Product Name is a required parameter field.' });
    }

    if (!newProdDesc.trim() || newProdDesc.trim().length < 10) {
      return setProductFeedback({ type: 'error', message: 'Provide a complete technical description (Min 10 characters).' });
    }

    if (productMedia.length === 0) {
      return setProductFeedback({ type: 'error', message: 'Upload at least one product image before publishing this item.' });
    }

    const parsedPrice = parseRequiredNumber(newProdPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setProductFeedback({ type: 'error', message: 'Item valuation pricing must exceed ₦0.' });
    
    const parsedStock = parseRequiredInteger(newProdStock);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) return setProductFeedback({ type: 'error', message: 'Inventory volume must be a whole number of 0 units or more.' });

    const createdProduct: StoreProduct = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      description: newProdDesc.trim(),
      price: parsedPrice,
      stock: parsedStock,
      isDelisted: false,
      media: productMedia,
      category: selectedCategory, // Maps to your active category state string
      isPopular: isFeatured,}

    if (!selectedCategory) {
    return setProductFeedback({ type: 'error', message: 'Assign a product category profile before saving item.' });
    };

    setProducts((prev) => [createdProduct, ...prev]);
    setProductFeedback({ type: 'success', message: `Product "${createdProduct.name}" added to inventory.` });

    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdStock('');
    setProductMedia([]);
    setIsFeatured(false);
  };

  const toggleDelistStatus = (id: string) => {
    setProducts((prev) => prev.map((product) =>
      product.id === id 
    ? { ...product, isDelisted: !product.isDelisted } : product
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

    // Persist to storage layer matching storefront expectations
    localStorage.setItem('global_store_rules', JSON.stringify({
      vatRate: parsedVat / 100,
      logisticsFee: parsedDelivery
    }));

    setChargesFeedback({ type: 'success', message: 'Global charge settings saved and synced.' });
  };

  const confirmPaymentReceived = () => {
    if (!liveOrder) return;
    setOrderFeedback(null);

    const updated: CheckoutOrder = {
      ...liveOrder,
      status: 'confirmed',
      currentMilestoneIndex: 3
    };

    setLiveOrder(updated);
    saveCheckoutOrder(updated);
    setOrderFeedback({ type: 'success', message: 'Payment has been confirmed successfully.' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row text-black">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-6 flex-shrink-0">
        <div className="font-bold text-xl mb-4 lg:mb-6 text-green-600 px-1 sm:px-4">ScanCode Admin</div>
        <div className="flex lg:block gap-2 overflow-x-auto pb-1 lg:space-y-2 lg:overflow-visible scrollbar-hide">
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
      
      <div className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-[1600px] mx-auto">
          {/* Main Content Pane */}
          <div className="flex-1 p-6 md:p-8 lg:p-10 w-full min-w-0">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 lg:p-10 w-full">
              
              {/* TAB 1: PRODUCT LISTING MANAGER */}
              {activeTab === 'products' && (
                <div className="space-y-8">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">List New Product Item</h2>
                  
                  {productFeedback && (
                    <div className={`p-4 rounded-2xl border text-sm font-medium ${productFeedback.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      {productFeedback.type === 'error' ? '⚠️ ' : '✓ '} {productFeedback.message}
                    </div>
                  )}

                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <input 
                      type="text" 
                      value={newProdName} 
                      onChange={(e) => setNewProdName(e.target.value)} 
                      placeholder="Product Name" 
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />

                      <textarea 
                      value={newProdDesc} 
                      onChange={(e) => setNewProdDesc(e.target.value)} placeholder="Product Description (Min 10 characters)" 
                      rows={3} 
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none resize-none text-black placeholder:text-gray-400" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="Price (₦)" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />
                        
                        <input type="number" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="Stock Count" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Product Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black bg-white"
                          >
                            <option value="">Select a category</option>
                            {vendorCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <label className="block text-sm font-medium text-black">Add a new category</label>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="New category name"
                              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              onClick={handleCreateCustomCategory}
                              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-4 rounded-2xl transition-colors"
                            >
                              Add Category
                            </button>
                          </div>
                        </div>

                        {vendorCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {vendorCategories.map((category) => (
                              <span key={category.id} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                {category.icon ?? '📦'} {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4 flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => productInputRef.current?.click()}
                        disabled={productMedia.length >= MAX_PRODUCT_MEDIA || uploadingMedia}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-600 cursor-pointer flex flex-col items-center justify-center min-h-[220px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="text-gray-500 text-sm block">
                          {uploadingMedia ? 'Uploading to cloud...' : 'Upload Product Media Images'}
                        </span>
                        <span className="text-sm text-gray-600 mt-3 block">{productMedia.length} / {MAX_PRODUCT_MEDIA} uploaded</span>
                        <input ref={productInputRef} type="file" accept="image/*" multiple onChange={handleProductMediaUpload} className="hidden" />
                      </button>
                      {productMedia.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {productMedia.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                              <Image src={img} alt={`Preview ${idx + 1}`} fill sizes="96px" unoptimized className="object-cover" />
                              <button type="button" onClick={() => handleRemoveProductMedia(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors">Publish Product to Store</button>
                    </div>
                  </form>

                  <hr className="border-gray-200 my-8" />
                  <h3 className="text-xl font-semibold mb-4">Active Store Inventory</h3>
                  
                  {products.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6 border border-dashed border-gray-200 rounded-2xl">No products are currently cataloged.</p>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-4 bg-white"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 flex-shrink-0 relative overflow-hidden">
                              {product.media[0] ? (
                                <Image src={product.media[0]} alt="" fill unoptimized className="object-cover" />
                              ) : '📦'}
                            </div>
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
                      {chargesFeedback.message}
                    </div>
                  )}
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium mb-2">VAT / Tax Percentage (%)</label>
                      <input type="number" step="0.1" value={vatRate} onChange={(e) => setVatRate(e.target.value)} className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Flat-Rate Logistics Delivery Fee (₦)</label>
                      <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-green-600 outline-none text-black" />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-2xl transition-colors">Save Global Rules</button>
                  </div>
                </form>
              )}

              {/* TAB 3: REALTIME INCOMING TRANSACTIONS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold">Live Real-time Incoming Streams</h2>
                    <span className={`h-3 w-3 rounded-full ${!liveOrder ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`}></span>
                  </div>

                  {orderFeedback && (
                    <div className="p-4 rounded-2xl border text-sm font-medium bg-green-50 text-green-700 border-green-200 max-w-md mx-auto">
                      ✓ {orderFeedback.message}
                    </div>
                  )}
                  
                  {!liveOrder ? (
                    <p className="text-gray-400 text-sm text-center py-12 border border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">No client payments pending approval.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-gray-50 max-w-3xl mx-auto shadow-inner space-y-4">
                      <div className="text-center border-b border-dashed border-gray-300 pb-4 space-y-2">
                        <h3 className="font-bold text-base sm:text-lg uppercase tracking-wider">Transaction Invoice</h3>
                        <p className="text-xs text-gray-500 break-all">
                          ID: {liveOrder.id}
                        </p>
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-semibold ${liveOrder.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {liveOrder.status === 'customer_notified' ? 'Customer Flagged Sent' : liveOrder.status}
                        </span>
                      </div>
                      
                      <div className="border-b border-gray-300 pb-2 text-sm space-y-1">
                        {liveOrder.items.map((item, i) => (
                          <div key={i} className="flex flex-wrap justify-between gap-4">
                            <span>{item.name} x{item.qty}</span>
                            <span>₦{(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-sm font-bold text-black flex flex-wrap justify-between gap-2">
                        <span>Total Amount Transferred:</span>
                        <span>₦{liveOrder.total.toLocaleString()}</span>
                      </div>

                      {liveOrder.status !== 'confirmed' ? (
                        <button type="button" onClick={confirmPaymentReceived} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors text-center mt-4">
                          Confirm Payment Received
                        </button>
                      ) : (
                        <div className="w-full bg-gray-200 text-gray-600 font-semibold py-4 rounded-2xl text-center mt-4 cursor-default">
                          ✓ Payment Processed
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}