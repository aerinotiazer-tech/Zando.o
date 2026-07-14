import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zando — Marketplace Premium au Niger',
    template: '%s | Zando Niger',
  },
  description: 'Découvrez des produits de qualité et des vendeurs vérifiés à Niamey. Zando est la plateforme de commerce digital de confiance au Niger.',
  keywords: ['Zando', 'Marketplace Niger', 'Achat en ligne Niamey', 'Vendeurs vérifiés', 'E-commerce Niger', 'Produits de qualité Niger'],
  authors: [{ name: 'Zando Team' }],
  creator: 'Zando',
  publisher: 'Zando',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Zando — Marketplace Premium au Niger',
    description: 'Découvrez des produits de qualité et des vendeurs vérifiés à Niamey. L\'infrastructure de commerce digital de confiance.',
    url: 'https://zando.ne',
    siteName: 'Zando',
    locale: 'fr_NE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zando — Marketplace Premium au Niger',
    description: 'Découvrez des produits de qualité et des vendeurs vérifiés à Niamey.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zando',
    url: 'https://zando.ne',
    logo: 'https://zando.ne/logo.png', // Fallback URL
    description: 'Marketplace Premium au Niger',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Niamey',
      addressCountry: 'NE'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+227 00000000', // Update with real one if needed
      contactType: 'customer service'
    }
  };

  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

