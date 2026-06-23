import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir, filter, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
        walkDir(dirPath, filter, callback);
      }
    } else {
      if (filter(dirPath)) {
        callback(dirPath);
      }
    }
  });
}

console.log('Searching for files containing TRAINER or Coach/Trainer logic...');
walkDir('d:/sports-saas-platform/backend/src', (f) => f.endsWith('.ts'), (f) => {
  const content = fs.readFileSync(f, 'utf-8');
  if (content.includes('TRAINER') || content.includes('Trainer')) {
    console.log(`Backend file: ${f}`);
  }
});

walkDir('d:/sports-saas-platform/frontend/src', (f) => f.endsWith('.ts') || f.endsWith('.tsx'), (f) => {
  const content = fs.readFileSync(f, 'utf-8');
  if (content.includes('TRAINER') || content.includes('Trainer') || content.includes('coach')) {
    console.log(`Frontend file: ${f}`);
  }
});
