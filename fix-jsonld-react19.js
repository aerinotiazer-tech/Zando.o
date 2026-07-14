const fs = require('fs');

const file = 'components/PublicViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove next/head import if it exists
content = content.replace("import Head from 'next/head';\n", "");

// Replace <Head> tags with nothing (unwrap them)
content = content.replace(/<Head>/g, "");
content = content.replace(/<\/Head>/g, "");

fs.writeFileSync(file, content);
