export type BusinessVertical = 'hospitality' | 'retail' | 'services' | 'digital';

export interface CustomCategory {
  id: string;
  name: string;
  icon?: string; // Made optional so vendors can create simple text categories
}

export interface BusinessProfile {
  id?: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  images: string[];
  vertical?: BusinessVertical;
  fulfillmentOptions?: string[];
  estimatedTime?: string;
  locationContext?: string;
  categories?: CustomCategory[]; // CHANGED: Added to track a vendor's categories inside their profile
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isDelisted: boolean;
  media: string[];
  collectionId?: string;
  metaFlags?: string[];
  category?: string; // Holds the category ID assigned to this product
  isPopular?: boolean;  
}

export interface CheckoutOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  customNote?: string;
}

export interface CheckoutOrder {
  id: string;
  businessName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  items: CheckoutOrderItem[];
  subtotal: number;
  vat: number;
  delivery: number;
  total: number;
  status: 'pending' | 'customer_notified' | 'confirmed';
  currentMilestoneIndex?: number;
  milestones?: string[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

const BUSINESS_PROFILE_KEY = 'scancode.businessProfile';
const STORE_PRODUCTS_KEY = 'scancode.storeProducts';
const CHECKOUT_ORDER_KEY = 'scancode.checkoutOrder';
const CATEGORY_KEY = 'scancode.vendorCategories'; // Kept for backwards compatibility / quick lookups

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readJson = <T>(key: string): T | null => {
  if (!canUseStorage()) return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.warn(`Unable to read ${key} from local storage.`, error);
    return null;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write ${key} to local storage.`, error);
  }
};

export const getBusinessProfile = () => readJson<BusinessProfile>(BUSINESS_PROFILE_KEY);
export const saveBusinessProfile = (data: BusinessProfile) => writeJson(BUSINESS_PROFILE_KEY, data);

export const getStoreProducts = () => readJson<StoreProduct[]>(STORE_PRODUCTS_KEY);
export const saveStoreProducts = (data: StoreProduct[]) => writeJson(STORE_PRODUCTS_KEY, data);

export const getCheckoutOrder = () => readJson<CheckoutOrder>(CHECKOUT_ORDER_KEY);
export const saveCheckoutOrder = (data: CheckoutOrder | null) => writeJson(CHECKOUT_ORDER_KEY, data);

// CHANGED: Replaced hardcoded food items with a clean, universally applicable fallback category
const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'general', name: 'General', icon: '📦' }
];

// CHANGED: Cleaned up to use your safe readJson/writeJson helpers to prevent Next.js SSR hydration bugs
export const getVendorCategories = (): CustomCategory[] => {
  const stored = readJson<CustomCategory[]>(CATEGORY_KEY);
  if (!stored) {
    writeJson(CATEGORY_KEY, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return stored;
};

// CHANGED: Cleaned up to use your safe writeJson helper
export const saveVendorCategories = (categories: CustomCategory[]): void => {
  writeJson(CATEGORY_KEY, categories);
};