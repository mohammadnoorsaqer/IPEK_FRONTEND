export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'IPEK',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  phone: process.env.NEXT_PUBLIC_PHONE || '+962790000000',
  address: process.env.NEXT_PUBLIC_ADDRESS || 'Amman, Jordan',
  currency: 'JOD',
};

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const revalidateSeconds = 300;
