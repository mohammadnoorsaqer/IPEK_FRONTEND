# Frontend Build Instructions — Next.js, EN/AR, SEO-first

Give this to Cursor to scaffold the customer-facing storefront. This is a
**separate project** from the Express/Sequelize backend — it only ever talks
to it through the API.

## Stack

- Next.js (App Router), TypeScript
- Locales: **English and Arabic only**
- `next-intl` for i18n routing: `/en/...` and `/ar/...`
- TanStack Query for data fetching/caching against the Express API
- Tailwind CSS
- `next/image` for all product photography
- Skeleton loading on every list and detail route
