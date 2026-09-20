import {
  emptyPage,
  getBrands,
  getColors,
  getSeasons,
  getSizes,
} from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import type { Brand, Category, Color, Department, Season, Size } from '@/lib/types';

export function sizeGroupForDepartment(department: Pick<Department, 'slug_en' | 'name_en'>) {
  const slug = department.slug_en.toLowerCase();
  const name = department.name_en.toLowerCase();
  if (slug.startsWith('women') || name.startsWith('women')) return 'women';
  if (slug.startsWith('kid') || name.startsWith('kid')) return 'kids';
  if (slug.startsWith('men') || name.startsWith('men')) return 'men';
  return undefined;
}

export function categoriesForDepartment(
  categories: Category[],
  departmentId: string,
) {
  return categories.filter((category) => category.department_id === departmentId);
}

export function groupCategories(categories: Category[]) {
  const parents = categories.filter((category) => !category.parent_id);
  const parentIds = new Set(parents.map((category) => category.id));
  const childrenByParent = new Map<string, Category[]>();
  const orphans: Category[] = [];

  for (const category of categories) {
    if (!category.parent_id) continue;
    if (!parentIds.has(category.parent_id)) {
      orphans.push(category);
      continue;
    }
    const list = childrenByParent.get(category.parent_id) || [];
    list.push(category);
    childrenByParent.set(category.parent_id, list);
  }

  return {
    parents: [...parents, ...orphans],
    childrenByParent,
  };
}

export async function getFilterFacets(sizeGroup?: string): Promise<{
  colors: Color[];
  sizes: Size[];
  brands: Brand[];
  seasons: Season[];
}> {
  const [colors, sizes, brands, seasons] = await Promise.all([
    safeFetch(() => getColors(24), emptyPage<Color>(24)),
    safeFetch(() => getSizes(50, sizeGroup), emptyPage<Size>(50)),
    safeFetch(() => getBrands(50), emptyPage<Brand>(50)),
    safeFetch(() => getSeasons(24), emptyPage<Season>(24)),
  ]);

  // Prefer Spring / Summer / Winter; if those are missing, keep whatever the API returned.
  const preferredSeason = new Set(['Summer', 'Winter', 'Spring']);
  const preferred = seasons.results.filter((season) =>
    preferredSeason.has(season.name_en),
  );
  const sortedSeasons = (preferred.length ? preferred : seasons.results)
    .slice()
    .sort((a, b) => {
      const order = ['Spring', 'Summer', 'Winter'];
      const ai = order.indexOf(a.name_en);
      const bi = order.indexOf(b.name_en);
      if (ai === -1 && bi === -1) return a.name_en.localeCompare(b.name_en);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  return {
    colors: colors.results,
    sizes: sizes.results.filter((size) => size.code !== 'XXS' && size.code !== '3XL'),
    brands: brands.results,
    seasons: sortedSeasons,
  };
}
