import type { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { site } from '@/lib/site';
import type { Locale } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await safeFetch(getSitemapData, {
    departments: [],
    categories: [],
    products: [],
  });

  const entries: MetadataRoute.Sitemap = [];

  (['en', 'ar'] as Locale[]).forEach((locale) => {
    entries.push({
      url: `${site.url}/${locale}`,
      changeFrequency: 'daily',
      priority: 1,
    });

    data.departments.forEach((department) => {
      const slug = locale === 'ar' ? department.slug_ar : department.slug_en;
      entries.push({
        url: `${site.url}/${locale}/${encodeURIComponent(slug)}`,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });

    data.categories.forEach((category) => {
      const departmentSlug =
        locale === 'ar' ? category.department.slug_ar : category.department.slug_en;
      const slug = locale === 'ar' ? category.slug_ar : category.slug_en;
      entries.push({
        url: `${site.url}/${locale}/${encodeURIComponent(departmentSlug)}/${encodeURIComponent(slug)}`,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });

    data.products.forEach((product) => {
      const slug = locale === 'ar' ? product.slug_ar : product.slug_en;
      entries.push({
        url: `${site.url}/${locale}/products/${encodeURIComponent(slug)}`,
        changeFrequency: 'hourly',
        priority: 0.9,
      });
    });
  });

  return entries;
}
