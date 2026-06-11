export interface BusinessProfile {
  name: string;
  description: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  images: string[];
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isDelisted: boolean;
  media: string[];
}

export interface CheckoutOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
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
}

const BUSINESS_PROFILE_KEY = 'scancode.businessProfile';
const STORE_PRODUCTS_KEY = 'scancode.storeProducts';
const CHECKOUT_ORDER_KEY = 'scancode.checkoutOrder';

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
    console.warn(`Unable to save ${key} to local storage.`, error);
  }
};

export const getBusinessProfile = () => readJson<BusinessProfile>(BUSINESS_PROFILE_KEY);
export const saveBusinessProfile = (profile: BusinessProfile) => writeJson(BUSINESS_PROFILE_KEY, profile);

export const getStoreProducts = () => readJson<StoreProduct[]>(STORE_PRODUCTS_KEY);
export const saveStoreProducts = (products: StoreProduct[]) => writeJson(STORE_PRODUCTS_KEY, products);

export const getCheckoutOrder = () => readJson<CheckoutOrder>(CHECKOUT_ORDER_KEY);
export const saveCheckoutOrder = (order: CheckoutOrder) => writeJson(CHECKOUT_ORDER_KEY, order);
export const clearCheckoutOrder = () => {
  if (canUseStorage()) window.localStorage.removeItem(CHECKOUT_ORDER_KEY);
};
