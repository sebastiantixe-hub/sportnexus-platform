import * as fs from 'fs';
import * as path from 'path';

function walk(dir, callback) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(fullPath);
    }
  });
}

walk('d:/sports-saas-platform/frontend/src', (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const matches = line.match(/\bMe\b/);
    if (matches) {
      console.log(`${file}:${idx + 1}: ${line.trim()}`);
    }
  });
});
