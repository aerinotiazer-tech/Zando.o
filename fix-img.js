const fs = require('fs');

const file = 'components/PublicViews.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import Image from 'next/image';")) {
  content = "import Image from 'next/image';\n" + content;
}

// 1. seller banner
content = content.replace(/<img loading="lazy" decoding="async" \s*src=\{seller\.banner\}\s*alt=\{seller\.name\}\s*className="([^"]+)"\s*\/>/g, 
  '<Image src={seller.banner} alt={seller.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="$1" />');

// 2. product image grid 1
content = content.replace(/<img loading="lazy" decoding="async" \s*src=\{product\.images\[0\]\}\s*alt=\{product\.name\}\s*className="([^"]+)"\s*\/>/g, 
  '<Image src={product.images[0]} alt={product.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="$1" />');

// 3. product image 526
content = content.replace(/<img loading="lazy" decoding="async" src=\{currentProduct\.images\[0\]\} alt=\{currentProduct\.name\} className="([^"]+)" \/>/g,
  '<Image src={currentProduct.images[0]} alt={currentProduct.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 50vw" className="$1" />');

// 4. product previews 532
content = content.replace(/<img loading="lazy" decoding="async" src=\{img\} alt=\{`Preview \$\{idx\}`\} className="([^"]+)" \/>/g,
  '<Image src={img} alt={`Preview ${idx}`} fill referrerPolicy="no-referrer" sizes="25vw" className="$1" />');

// 5. seller logo 554
content = content.replace(/<img loading="lazy" decoding="async" src=\{currentSeller\.logo\} alt=\{currentSeller\.name\} className="([^"]+)" \/>/g,
  '<Image src={currentSeller.logo} alt={currentSeller.name} fill referrerPolicy="no-referrer" sizes="100px" className="$1" />');

// 6. seller logo 788
content = content.replace(/<img loading="lazy" decoding="async" src=\{currentSeller\.logo\} alt=\{currentSeller\.name\} className="([^"]+)" \/>/g,
  '<Image src={currentSeller.logo} alt={currentSeller.name} fill referrerPolicy="no-referrer" sizes="100px" className="$1" />');

fs.writeFileSync(file, content);
