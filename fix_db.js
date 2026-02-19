const fs = require('fs');

// Read the file
let content = fs.readFileSync('d:/appointmentstd2/appointmentstd2/stdapp2/src/lib/db_fixed.ts', 'utf8');

// Replace all HTML entities (with and without spaces)
content = content.replace(/&\s*lt\s*;/g, '<');
content = content.replace(/&\s*gt\s*;/g, '>');
content = content.replace(/&\s*amp\s*;/g, '&');
content = content.replace(/=\s*&\s*gt\s*;/g, '=>');

// Write the corrected content
fs.writeFileSync('d:/appointmentstd2/appointmentstd2/stdapp2/src/lib/db.ts', content, 'utf8');

console.log('File fixed successfully!');
console.log('Replaced HTML entities with proper TypeScript syntax.');
