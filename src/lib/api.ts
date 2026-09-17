import { apiUrl } from './site';
import { ApiError, authGet, authSend, publicGet, setTokens } from './http';
import type {
  AuthTokens,
  Cart,
  Category,
  Department,
  Locale,
  Order,
  Paginated,
  Product,
  SitemapPayload,
  User,
} from './types';

export function getDepartments() {
  return publicGet<Paginated<Department>>('/departments?limit=50');
}

export function getDepartmentBySlug(locale: Locale, slug: string) {
  return publicGet<Department>(
    `/departments/slug/${locale}/${encodeURIComponent(slug)}`,
  );
}

export function getCategories(params: {
  department_slug?: string;
  locale?: Locale;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.department_slug) query.set('department_slug', params.department_slug);
  if (params.locale) query.set('locale', params.locale);
  query.set('limit', String(params.limit || 50));
  return publicGet<Paginated<Category>>(`/categories?${query.toString()}`);
}

export function getCategoryBySlug(
  locale: Locale,
  slug: string,
  departmentSlug: string,
) {
  return publicGet<Category>(
    `/categories/slug/${locale}/${encodeURIComponent(slug)}?department_slug=${encodeURIComponent(departmentSlug)}`,
  );
}

export function getProducts(params: {
  locale?: Locale;
  department_slug?: string;
  category_slug?: string;
  sort?: 'best_selling' | 'newest';
  search?: string;
  limit?: number;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params.locale) query.set('locale', params.locale);
  if (params.department_slug) query.set('department_slug', params.department_slug);
  if (params.category_slug) query.set('category_slug', params.category_slug);
  if (params.sort) query.set('sort', params.sort);
  if (params.search) query.set('search', params.search);
  query.set('limit', String(params.limit || 12));
  query.set('page', String(params.page || 1));
  return publicGet<Paginated<Product>>(`/products?${query.toString()}`);
}

export function getProductBySlug(locale: Locale, slug: string) {
  return publicGet<Product>(
    `/products/slug/${locale}/${encodeURIComponent(slug)}`,
  );
}

export function getSitemapData() {
  return publicGet<SitemapPayload>('/seo/sitemap');
}

async function authForm<T>(path: string, body: unknown) {
  const res = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message?.en || json.message || 'Request failed',
      json.message?.ar || json.message_ar,
    );
  }
  if (json.token) setTokens(json.token as AuthTokens);
  return json.data as T;
}

export function login(email: string, password: string) {
  return authForm<User>('/auth/login', { email, password });
}

export function register(payload: {
  username: string;
  username_ar?: string;
  email: string;
  password: string;
  phone_number?: string;
}) {
  return authForm<User>('/auth/register', payload);
}

export async function logout() {
  try {
    await authSend('/auth/logout', 'POST', {});
  } catch {
    // still clear local session
  }
}

export function getMe() {
  return authGet<User>('/users/me');
}

export function updateMe(payload: Partial<User> & { password?: string }) {
  return authSend<User>('/users/me', 'PUT', payload);
}

export function getCart() {
  return authGet<Cart>('/carts');
}

export function addCartItem(product_variant_id: string, quantity = 1) {
  return authSend<Cart>('/carts/items', 'POST', {
    product_variant_id,
    quantity,
  });
}

export function updateCartItem(id: string, quantity: number) {
  return authSend<Cart>(`/carts/items/${id}`, 'PUT', { quantity });
}

export function removeCartItem(id: string) {
  return authSend<Cart>(`/carts/items/${id}`, 'DELETE');
}

export function getOrders() {
  return authGet<Paginated<Order>>('/orders?limit=50');
}

export function getOrder(id: string) {
  return authGet<Order>(`/orders/${id}`);
}

export function createOrder(payload: {
  street_address: string;
  payment_method: 'cliq' | 'cash';
}) {
  return authSend<Order>('/orders', 'POST', payload);
}

export function toggleFavorite(product_id: string) {
  return authSend<{ favorited: boolean }>('/favorites/toggle', 'POST', {
    product_id,
  });
}
