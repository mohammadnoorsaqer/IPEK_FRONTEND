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

  // Prefer everyday / current seasons near the top; keep Cruise as an empty test case.
  const preferredSeason = new Set([
    'All Season',
    'Essentials',
    'New Arrivals',
    'Spring/Summer 2026',
    'Fall/Winter 2026',
    'Ramadan',
    'Eid al-Fitr',
    'Summer',
    'Winter',
    'Autumn',
    'Spring',
    'Pre-Spring',
    'Wedding Season',
    'Cruise', // seeded with zero products on purpose
  ]);
  const sortedSeasons = [...seasons.results].sort((a, b) => {
    const ap = preferredSeason.has(a.name_en) ? 0 : 1;
    const bp = preferredSeason.has(b.name_en) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.name_en.localeCompare(b.name_en);
  });

  return {
    colors: colors.results,
    sizes: sizes.results.filter((size) => size.code !== 'XXS' && size.code !== '3XL'),
    brands: brands.results,
    seasons: sortedSeasons.slice(0, 16),
  };
}
