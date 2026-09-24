#!/usr/bin/env node
// ResearchOS Phase 2 Security Tests
import { randomBytes } from 'crypto';
import http from 'http';

const BASE_URL = 'http://localhost:3000';
let passCount = 0;
let failCount = 0;

async function fetchWithRetry(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
      throw new Error('Connection refused (server not running)');
    }
    throw err;
  }
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const ts = Date.now();
  const userA = { email: `a_${ts}@test.com`, password: 'password123', name: 'User A' };
  const userB = { email: `b_${ts}@test.com`, password: 'password123', name: 'User B' };
  
  let tokenA = '';
  let tokenB = '';
  let projectAId = '';

  await test('Unauthenticated access returns 401', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/projects`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Auth: register user A', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA)
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    tokenA = data.data.token;
  });

  await test('Auth: register user B', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB)
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    tokenB = data.data.token;
  });

  await test('Cross-user isolation: User A creates project', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Secret Project A', description: 'desc' })
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    projectAId = data.data.id;
  });

  await test('Cross-user isolation: User B cannot access User A project', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/projects/${projectAId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await test('File upload: oversized file rejected', async () => {
    // Generate a 11MB string
    const largeContent = 'a'.repeat(11 * 1024 * 1024);
    
    // We would need to build a multipart form body manually for fetch,
    // but conceptually testing the error response when we try to upload too much.
    // For simplicity, we can simulate standard boundary.
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nTestDoc\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n${largeContent}\r\n--${boundary}--\r\n`;

    const res = await fetchWithRetry(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    assert(res.status === 400 || res.status === 413, `Expected 400/413, got ${res.status}`);
    const json = await res.json();
    assert(json.error.includes('10MB'), 'Expected 10MB error message');
  });

  await test('File upload: disallowed MIME type rejected', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nTestDoc\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.exe"\r\nContent-Type: application/x-msdownload\r\n\r\nfake-exe-content\r\n--${boundary}--\r\n`;

    const res = await fetchWithRetry(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const json = await res.json();
    assert(json.error.includes('not allowed'), 'Expected type not allowed error');
  });

  await test('Auth endpoints: logout flow', async () => {
    const res = await fetchWithRetry(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log(`\n${passCount + failCount} tests run: ${passCount} passed, ${failCount} failed`);
  if (failCount > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
