const fs = require('fs');

const files = ['components/UserDashboard.tsx', 'components/SellerDashboard.tsx', 'components/AdminDashboard.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (content.includes('<img') && !content.includes("import Image from 'next/image';")) {
    content = "import Image from 'next/image';\n" + content;
  }

  // Replace all generic <img src={src} alt={alt} className={className} /> patterns
  content = content.replace(/<img loading="lazy" decoding="async" src=\{([^}]+)\} className="([^"]+)" alt=\{?([^}]+)\}? \/>/g, 
    '<Image src={$1} alt={$3} fill referrerPolicy="no-referrer" sizes="100px" className="$2" />');
    
  content = content.replace(/<img loading="lazy" decoding="async" src=\{([^}]+)\} alt=\{?([^}]+)\}? className="([^"]+)" \/>/g, 
    '<Image src={$1} alt={$2} fill referrerPolicy="no-referrer" sizes="100px" className="$3" />');

  // Some components might have parent elements that need `relative`.
  // e.g. <div className="w-10 h-10 rounded-lg overflow-hidden border">
  // We need to ensure parents of these Images have 'relative'.
  content = content.replace(/(className="[^"]*w-\d+ h-\d+[^"]*)(")/g, function(match, p1, p2) {
    if (!p1.includes('relative') && !p1.includes('absolute')) {
      return p1 + ' relative' + p2;
    }
    return match;
  });

  fs.writeFileSync(file, content);
});
