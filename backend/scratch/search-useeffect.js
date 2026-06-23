import * as fs from 'fs';
const content = fs.readFileSync('d:/sports-saas-platform/frontend/src/pages/dashboard/Dashboard.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('role') || line.includes('Role')) {
    console.log(`Line ${i + 1}: ${line}`);
  }
});
