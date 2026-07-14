const fs = require('fs');

const files = [
  'components/AdminDashboard.tsx',
  'components/PublicViews.tsx',
  'components/SellerDashboard.tsx',
  'components/UserDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes("import Image from 'next/image';\n'use client';")) {
    content = content.replace("import Image from 'next/image';\n'use client';", "'use client';\nimport Image from 'next/image';");
  } else if (content.startsWith("import Image from 'next/image';\n")) {
    content = content.replace("import Image from 'next/image';\n", "");
    content = content.replace("'use client';\n", "'use client';\nimport Image from 'next/image';\n");
  }
  
  fs.writeFileSync(file, content);
});
