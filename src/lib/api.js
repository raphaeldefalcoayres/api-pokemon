import 'dotenv/config';
import axios from 'axios';
import http from 'http';
import https from 'https';
const api = axios.create({
  baseURL: process.env.API_URL,

  //60 sec timeout
  timeout: 60000,

  //keepAlive pools and reuses TCP connections, so it's faster
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  //follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,

  //cap the maximum content length we'll accept to 50MBs, just in case
  maxContentLength: 50 * 1000 * 1000,
});

export default api;
