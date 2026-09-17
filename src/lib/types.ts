export type Locale = 'en' | 'ar';

export type Paginated<T> = {
  results: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User = {
  id: string;
  username: string | null;
  username_ar: string;
  email: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  gender?: 'male' | 'female' | null;
  role: 'user' | 'superadmin';
};

export type AuthTokens = {
  access: { token: string; expires: number };
  refresh: { token: string; expires: number };
};

export type Department = {
  id: string;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  is_visible: boolean;
};

export type Category = {
  id: string;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  department_id: string;
  department?: Department;
};

export type ProductImage = {
  id: string;
  image_key: string;
  image_url: string | null;
  is_primary: boolean;
  color_id: string | null;
};

export type ProductVariant = {
  id: string;
  stock_quantity: number;
  price_override: string | null;
  color?: { id: string; name_en: string; name_ar: string; hex_code: string };
  size?: { id: string; code: string; name_en: string; name_ar: string };
};

export type Product = {
  id: string;
  sku: string;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  base_price: string | number;
  current_price?: string | number;
  current_discount?: {
    discount_type: 'percentage' | 'fixed';
    value: string | number;
  } | null;
  is_active: boolean;
  sales_count: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
};

export type NamedItem = {
  id: string;
  name_en: string;
  name_ar: string;
};

export type Color = NamedItem & { hex_code: string };
export type Size = NamedItem & { code: string; size_group?: string };
export type Brand = NamedItem;
export type Season = NamedItem;

export type ProductQuery = {
  locale?: Locale;
  department_slug?: string;
  category_slug?: string;
  sort?: 'best_selling' | 'newest';
  search?: string;
  min_price?: number;
  max_price?: number;
  color_id?: string;
  size_id?: string;
  brand_id?: string;
  season_id?: string;
  limit?: number;
  page?: number;
};

export type Favorite = {
  id: string;
  product_id: string;
  product?: Product | null;
};

export type AppNotification = {
  id: string;
  title_en: string;
  title_ar: string;
  message_en: string;
  message_ar: string;
  is_read: boolean;
  redirect_type?: 'order' | 'product' | 'discount' | 'favorite' | null;
  redirect_id?: string | null;
  created_at?: string;
};

export type CartLine = {
  id: string;
  product_variant_id: string;
  quantity: number;
  variant?: ProductVariant & {
    product?: Product;
  };
};

export type Cart = {
  id: string;
  user_id: string;
  items: CartLine[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  unit_price?: string | number;
  variant?: ProductVariant & { product?: Product };
};

export type Order = {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cliq' | 'cash';
  street_address: string;
  total_amount: string | number;
  created_at?: string;
  items?: OrderItem[];
};

export type SitemapPayload = {
  departments: Department[];
  categories: Array<Category & { department: Department }>;
  products: Product[];
};

export function localizedName(
  item: { name_en: string; name_ar: string },
  locale: Locale,
) {
  return locale === 'ar' ? item.name_ar : item.name_en;
}

export function localizedSlug(
  item: { slug_en: string; slug_ar: string },
  locale: Locale,
) {
  return locale === 'ar' ? item.slug_ar : item.slug_en;
}
