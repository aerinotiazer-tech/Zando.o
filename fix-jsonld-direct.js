const fs = require('fs');

const file = 'components/PublicViews.tsx';
let content = fs.readFileSync(file, 'utf8');

const productRegex = /{currentSubView === 'product' && currentProduct && \([\s\S]*?<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">/;
if (content.match(productRegex)) {
  const match = content.match(productRegex)[0];
  const replacement = `{currentSubView === 'product' && currentProduct && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            />`;
  content = content.replace(productRegex, replacement);
}

const shopRegex = /{currentSubView === 'shop' && currentSeller && \([\s\S]*?<div className="w-full">/;
if (content.match(shopRegex)) {
  const match = content.match(shopRegex)[0];
  const replacement = `{currentSubView === 'shop' && currentSeller && (
        <div className="w-full">
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
            />`;
  content = content.replace(shopRegex, replacement);
}

fs.writeFileSync(file, content);
