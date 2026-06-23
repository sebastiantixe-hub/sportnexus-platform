import * as fs from 'fs';

const content = fs.readFileSync('d:/sports-saas-platform/frontend/dist/assets/index-DVzfuXt-.js', 'utf-8');

// Let's find index: 135770
// Since the file is minified, index-DVzfuXt-.js has a few lines or a single huge line.
// Let's print characters from 135700 to 135900.
console.log('Snippet around 135770:');
console.log(content.substring(135500, 136000));
