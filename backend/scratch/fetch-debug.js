const http = require('http');

http.get('http://localhost:3000/api/health/db-debug', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      console.log('Response:', JSON.parse(data));
    } catch (e) {
      console.log('Response raw:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching health:', err);
});
