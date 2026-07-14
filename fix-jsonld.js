const fs = require('fs');

const file = 'components/PublicViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// Inject next/head
if (!content.includes("import Head from 'next/head';")) {
  content = "import Head from 'next/head';\n" + content;
}

// Product JSON-LD
const productRegex = /{currentSubView === 'product' && currentProduct && \(\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">/;
if (content.match(productRegex)) {
  const productReplacement = `{currentSubView === 'product' && currentProduct && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Head>
            <title>{currentProduct.name} | Zando</title>
            <meta name="description" content={currentProduct.description} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org/',
                  '@type': 'Product',
                  name: currentProduct.name,
                  image: currentProduct.images,
                  description: currentProduct.description,
                  brand: {
                    '@type': 'Brand',
                    name: currentProduct.sellerName
                  },
                  offers: {
                    '@type': 'Offer',
                    url: 'https://zando.ne/?view=product&id=' + currentProduct.id,
                    priceCurrency: 'XOF',
                    price: currentProduct.price,
                    itemCondition: 'https://schema.org/NewCondition',
                    availability: currentProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                  }
                })
              }}
            />
          </Head>`;
  content = content.replace(productRegex, productReplacement);
}

// Shop JSON-LD
const shopRegex = /{currentSubView === 'shop' && currentSeller && \(\s*<div className="w-full">/;
if (content.match(shopRegex)) {
  const shopReplacement = `{currentSubView === 'shop' && currentSeller && (
        <div className="w-full">
          <Head>
            <title>{currentSeller.name} | Boutique sur Zando</title>
            <meta name="description" content={currentSeller.description} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'LocalBusiness',
                  name: currentSeller.name,
                  image: currentSeller.logo,
                  description: currentSeller.description,
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: currentSeller.location,
                    addressCountry: 'NE'
                  },
                  url: 'https://zando.ne/?view=shop&id=' + currentSeller.id
                })
              }}
            />
          </Head>`;
  content = content.replace(shopRegex, shopReplacement);
}

fs.writeFileSync(file, content);
