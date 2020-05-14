const config = require('axios');
const https = require('https');

const axiosInstance = config.create({
  baseURL: process.env.URL,
  timeout: 30000 * 60,
  headers: {
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

module.exports = axiosInstance;
