import { MetadataRoute } from 'next';
import { api } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zando.ne';
  
  const products = await api.getProducts();
  const sellers = await api.getSellers();
  
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/?view=product&id=${product.id}`,
    lastModified: product.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const sellerEntries: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${baseUrl}/?view=shop&id=${seller.id}`,
    lastModified: seller.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/?view=marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productEntries,
    ...sellerEntries,
  ];
}
