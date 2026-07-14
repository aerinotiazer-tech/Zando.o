import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/seller/'],
    },
    sitemap: 'https://zando.ne/sitemap.xml',
  };
}
