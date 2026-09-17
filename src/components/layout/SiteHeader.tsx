import { getDepartments } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { safeFetch } from '@/lib/safe';

export async function SiteHeader() {
  const data = await safeFetch(getDepartments, {
    results: [],
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  return <Header departments={data.results.filter((item) => item.is_visible !== false)} />;
}
