import { apiUrl } from './site';
import { ApiError, authGet, authSend, publicGet, setTokens } from './http';
import type {
  AppNotification,
  AuthTokens,
  Brand,
  Cart,
  Category,
  Color,
  Department,
  Favorite,
  Locale,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Season,
  Size,
  SitemapPayload,
  User,
} from './types';

export const emptyPage = <T,>(limit = 12): Paginated<T> => ({
  results: [],
  page: 1,
  limit,
  total: 0,
  totalPages: 0,
});

function setQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    query.set(key, String(value));
  }
  return query;
}

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
  const query = setQuery({
    department_slug: params.department_slug,
    locale: params.locale,
    limit: params.limit || 50,
  });
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

export function getProducts(params: ProductQuery = {}) {
  const query = setQuery({
    locale: params.locale,
    department_slug: params.department_slug,
    category_slug: params.category_slug,
    sort: params.sort,
    search: params.search,
    min_price: params.min_price,
    max_price: params.max_price,
    color_id: params.color_id,
    size_id: params.size_id,
    brand_id: params.brand_id,
    season_id: params.season_id,
    limit: params.limit || 12,
    page: params.page || 1,
  });
  return publicGet<Paginated<Product>>(`/products?${query.toString()}`);
}

export function getProductBySlug(locale: Locale, slug: string) {
  return publicGet<Product>(
    `/products/slug/${locale}/${encodeURIComponent(slug)}`,
  );
}

export function getColors(limit = 50) {
  return publicGet<Paginated<Color>>(`/colors?limit=${limit}`);
}

export function getSizes(limit = 50) {
  return publicGet<Paginated<Size>>(`/sizes?limit=${limit}`);
}

export function getBrands(limit = 50) {
  return publicGet<Paginated<Brand>>(`/brands?limit=${limit}`);
}

export function getSeasons(limit = 50) {
  return publicGet<Paginated<Season>>(`/seasons?limit=${limit}`);
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

export function getFavorites(limit = 50) {
  return authGet<Paginated<Favorite>>(`/favorites?limit=${limit}`);
}

export function toggleFavorite(product_id: string) {
  return authSend<{ favorited: boolean; product_id?: string; favorite?: Favorite }>(
    '/favorites/toggle',
    'POST',
    { product_id },
  );
}

export function removeFavorite(id: string) {
  return authSend<{ id: string }>(`/favorites/${id}`, 'DELETE');
}

export function getNotifications(params: { limit?: number; is_read?: boolean } = {}) {
  const query = setQuery({
    limit: params.limit || 50,
    is_read: params.is_read === undefined ? undefined : String(params.is_read),
  });
  return authGet<Paginated<AppNotification>>(`/notifications?${query.toString()}`);
}

export function markNotificationRead(id: string) {
  return authSend<AppNotification>(`/notifications/${id}/read`, 'PATCH', {});
}
