const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find components -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('<img') && !content.includes('import Image from \'next/image\'')) {
    content = 'import Image from \'next/image\';\n' + content;
  }
  
  // Replace <img ... className="XYZ" /> with <Image ... className="XYZ" fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" />
  // We need to be careful with parent containers which must have 'relative' class.
  // Actually, replacing <img with <Image ... fill /> will break if the parent doesn't have `relative` or `w-.. h-..`.
  // Wait, Next.js Image also supports `width` and `height`.
  // The easiest is just <Image src={...} alt={...} width={400} height={400} className="..." referrerPolicy="no-referrer" />
  // But since the original classes control dimensions (w-full h-full, w-10 h-10), we can just inject `width={100} height={100}` as a default, and let Tailwind handle the display if `style={{ objectFit: 'cover' }}` is used. Wait, `next/image` requires width/height unless `fill` is used. If `fill` is used, parent must be `relative`.
  // Let's manually replace them since there aren't too many.
});
