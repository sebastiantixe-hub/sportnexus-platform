import * as fs from 'fs';
const content = fs.readFileSync('d:/sports-saas-platform/backend/prisma/schema.prisma', 'utf-8');
const lines = content.split('\n');
let insideUser = false;
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('model user')) {
    insideUser = true;
  }
  if (insideUser) {
    console.log(`Line ${i + 1}: ${line}`);
    if (line.trim() === '}') {
      insideUser = false;
    }
  }
});
