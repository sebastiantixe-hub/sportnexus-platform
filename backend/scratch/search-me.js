import * as fs from 'fs';

const content = fs.readFileSync('d:/sports-saas-platform/frontend/src/pages/dashboard/HealthView.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Me') || line.includes(' me ')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
