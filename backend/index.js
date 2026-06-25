// backend/index.js
// Server entry point — loads env and starts Express.

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ MindWell backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
