import {
  emptyPage,
  getBrands,
  getColors,
  getSeasons,
  getSizes,
} from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import type { Brand, Color, Season, Size } from '@/lib/types';

export async function getFilterFacets(): Promise<{
  colors: Color[];
  sizes: Size[];
  brands: Brand[];
  seasons: Season[];
}> {
  const [colors, sizes, brands, seasons] = await Promise.all([
    safeFetch(() => getColors(50), emptyPage<Color>(50)),
    safeFetch(() => getSizes(50), emptyPage<Size>(50)),
    safeFetch(() => getBrands(50), emptyPage<Brand>(50)),
    safeFetch(() => getSeasons(50), emptyPage<Season>(50)),
  ]);
  return {
    colors: colors.results,
    sizes: sizes.results,
    brands: brands.results,
    seasons: seasons.results,
  };
}
