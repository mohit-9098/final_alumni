const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YEL = '\x1b[33m';
const RESET = '\x1b[0m';

function logPass(name, extra) {
  console.log(`${GRN}PASS${RESET} - ${name}${extra ? ' - ' + extra : ''}`);
}

function logFail(name, extra) {
  console.log(`${RED}FAIL${RESET} - ${name}${extra ? ' - ' + extra : ''}`);
}

async function request({ method = 'get', url, token, data, validateStatus }) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return axios({
    method,
    url,
    headers,
    data,
    validateStatus: validateStatus || (() => true),
    timeout: 15000,
  });
}

async function testHealth() {
  const name = 'GET /api/health returns 200';
  const res = await request({ method: 'get', url: `${BASE_URL}/api/health` });
  if (res.status === 200 && res.data?.message === 'Server is running') {
    logPass(name);
    return true;
  }
  logFail(name, `status=${res.status}, body=${JSON.stringify(res.data)}`);
  return false;
}

async function testAdminLoginSuccess() {
  const name = 'POST /api/auth/admin-login success';
  const res = await request({
    method: 'post',
    url: `${BASE_URL}/api/auth/admin-login`,
    data: { email: 'admin@mohit.com', password: 'admin123' },
  });

  if (res.status === 200 && res.data?.token && res.data?.user?.role === 'admin') {
    logPass(name);
    return res.data.token;
  }

  logFail(name, `status=${res.status}, body=${JSON.stringify(res.data)}`);
  return null;
}

async function testAdminLoginFailure() {
  const name = 'POST /api/auth/admin-login rejects wrong password';
  const res = await request({
    method: 'post',
    url: `${BASE_URL}/api/auth/admin-login`,
    data: { email: 'admin@mohit.com', password: 'wrong-password' },
  });

  if (res.status >= 400 && (res.data?.message || res.data?.errors)) {
    logPass(name);
    return true;
  }
  logFail(name, `status=${res.status}, body=${JSON.stringify(res.data)}`);
  return false;
}

async function testAuthMe(token) {
  const name = 'GET /api/auth/me returns user with token';
  const res = await request({
    method: 'get',
    url: `${BASE_URL}/api/auth/me`,
    token,
  });

  if (res.status === 200 && res.data?._id && res.data?.role === 'admin') {
    logPass(name);
    return true;
  }

  logFail(name, `status=${res.status}, body=${JSON.stringify(res.data)}`);
  return false;
}

async function testUnauthorizedMe() {
  const name = 'GET /api/auth/me rejects without token';
  const res = await request({
    method: 'get',
    url: `${BASE_URL}/api/auth/me`,
  });

  if (res.status === 401) {
    logPass(name);
    return true;
  }

  logFail(name, `status=${res.status}, body=${JSON.stringify(res.data)}`);
  return false;
}

async function run() {
  console.log(`${YEL}Running API validation suite...${RESET}`);
  const results = [];

  const okHealth = await testHealth();
  results.push({ name: 'health', ok: okHealth });

  const okFailLogin = await testAdminLoginFailure();
  results.push({ name: 'admin login failure', ok: okFailLogin });

  const token = await testAdminLoginSuccess();
  results.push({ name: 'admin login success', ok: !!token });

  const okUnauthorized = await testUnauthorizedMe();
  results.push({ name: 'me without token', ok: okUnauthorized });

  const okMe = token ? await testAuthMe(token) : false;
  results.push({ name: 'me with token', ok: okMe });

  const passed = results.filter(r => r.ok).length;
  const total = results.length;

  console.log('');
  console.log(`${passed}/${total} checks passed.`);

  if (passed !== total) {
    process.exit(1);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

