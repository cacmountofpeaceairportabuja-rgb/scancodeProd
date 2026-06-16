// Central API client for communicating with the Spring Boot backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

// ─── Token Management ───
const TOKEN_KEY = 'scancode.jwt';
const USER_KEY = 'scancode.user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): ApiUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const setStoredUser = (user: ApiUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const isLoggedIn = (): boolean => !!getToken();

// ─── Types ───
export interface ApiUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface StorefrontResponse {
  id: number;
  userId: number;
  businessType: string;
  slug: string;
  publicUrl: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  data: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: number;
  storefrontId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isDelisted: boolean;
  mediaUrls: string[];
  category: string;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: number;
  storefrontId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderItems: string; // JSON string
  subtotal: number;
  vat: number;
  delivery: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreConfigResponse {
  id: number | null;
  storefrontId: number;
  vatRate: number;
  deliveryFee: number;
}

// ─── HTTP Helpers ───
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {}
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Auth API ───
export const api = {
  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async register(username: string, email: string, password: string): Promise<{ message: string }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async resendOtp(email: string): Promise<{ message: string }> {
    return request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async getMe(): Promise<ApiUser> {
    return request('/api/auth/me');
  },

  // Storefronts
  async createStorefront(data: {
    businessType: string;
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    data: Record<string, unknown>;
  }): Promise<StorefrontResponse> {
    return request('/api/business/storefronts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyStorefronts(): Promise<StorefrontResponse[]> {
    return request('/api/business/storefronts/my');
  },

  async getStorefrontBySlug(slug: string): Promise<StorefrontResponse> {
    return request(`/api/business/storefronts/${slug}`);
  },

  // Products
  async createProduct(storefrontId: number, data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    mediaUrls?: string[];
    category?: string;
    isPopular?: boolean;
  }): Promise<ProductResponse> {
    return request(`/api/storefronts/${storefrontId}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProducts(storefrontId: number): Promise<ProductResponse[]> {
    return request(`/api/storefronts/${storefrontId}/products`);
  },

  async getAllProducts(storefrontId: number): Promise<ProductResponse[]> {
    return request(`/api/storefronts/${storefrontId}/products/all`);
  },

  async toggleDelistProduct(storefrontId: number, productId: number): Promise<ProductResponse> {
    return request(`/api/storefronts/${storefrontId}/products/${productId}/toggle-delist`, {
      method: 'PATCH',
    });
  },

  async deleteProduct(storefrontId: number, productId: number): Promise<void> {
    return request(`/api/storefronts/${storefrontId}/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async createOrder(storefrontId: number, data: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: { id: string; name: string; qty: number; price: number }[];
    subtotal: number;
    vat: number;
    delivery: number;
    total: number;
  }): Promise<OrderResponse> {
    return request(`/api/storefronts/${storefrontId}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOrders(storefrontId: number): Promise<OrderResponse[]> {
    return request(`/api/storefronts/${storefrontId}/orders`);
  },

  async getOrderById(orderId: number): Promise<OrderResponse> {
    return request(`/api/orders/${orderId}`);
  },

  async updateOrderStatus(storefrontId: number, orderId: number, status: string): Promise<OrderResponse> {
    return request(`/api/storefronts/${storefrontId}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateOrderStatusPublic(orderId: number, status: string): Promise<OrderResponse> {
    return request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Store Config
  async getStoreConfig(storefrontId: number): Promise<StoreConfigResponse> {
    return request(`/api/storefronts/${storefrontId}/config`);
  },

  async saveStoreConfig(storefrontId: number, data: {
    vatRate: number;
    deliveryFee: number;
  }): Promise<StoreConfigResponse> {
    return request(`/api/storefronts/${storefrontId}/config`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
