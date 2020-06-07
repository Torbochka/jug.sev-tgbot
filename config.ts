import axios from 'axios';
import https from 'https';

export const axiosInstance = axios.create({
  baseURL: 'https://hw.shri.yandex/api/',
  timeout: 30000 * 60,
  headers: {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export default axiosInstance;
