require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
