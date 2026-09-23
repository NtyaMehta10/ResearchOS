#!/usr/bin/env node
import { randomBytes } from 'crypto';

const BASE_URL = 'http://localhost:3000';
let passCount = 0;
let failCount = 0;

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

async function fetchWithCookie(url, options = {}, cookie = '') {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set('Cookie', cookie);
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, data, headers: res.headers };
}

async function registerUser() {
  const email = `test.phase3.${Date.now()}.${randomBytes(4).toString('hex')}@researchos.io`;
  const { status, headers } = await fetchWithCookie('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Phase3 Tester',
      email,
      password: 'Password123!',
    }),
  });
  
  assert(status === 201, `Failed to register user: ${status}`);
  
  const cookies = headers.get('set-cookie');
  assert(cookies, 'No set-cookie header received');
  
  const tokenCookie = cookies.split(',').find(c => c.includes('researchos_token='));
  return tokenCookie.split(';')[0];
}

async function main() {
  let cookieA = '';

  await test('Auth: register user A', async () => {
    cookieA = await registerUser();
  });

  let projectId = '';
  await test('Projects: create project', async () => {
    const res = await fetchWithCookie('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task Test Project' })
    }, cookieA);
    assert(res.status === 201, 'Failed to create project');
    projectId = res.data.data.id;
  });

  let taskId = '';
  await test('Tasks: create task', async () => {
    const res = await fetchWithCookie('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ 
        title: 'Complete Phase 3 Testing',
        description: 'Verify all backend endpoints',
        priority: 'HIGH',
        projectId,
      })
    }, cookieA);
    assert(res.status === 201, `Failed to create task: ${res.status}`);
    assert(res.data.data.title === 'Complete Phase 3 Testing', 'Task title mismatch');
    taskId = res.data.data.id;
  });

  await test('Tasks: get tasks', async () => {
    const res = await fetchWithCookie('/api/tasks', {}, cookieA);
    assert(res.status === 200, 'Failed to get tasks');
    assert(res.data.data.length === 1, 'Should have 1 task');
  });

  await test('Tasks: update task', async () => {
    const res = await fetchWithCookie(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' })
    }, cookieA);
    assert(res.status === 200, 'Failed to update task');
    assert(res.data.data.status === 'COMPLETED', 'Status not updated');
  });

  await test('Projects: check task stats', async () => {
    const res = await fetchWithCookie(`/api/projects/${projectId}/stats`, {}, cookieA);
    assert(res.status === 200, 'Failed to get stats');
    assert(res.data.data.taskCount === 1, 'Task count mismatch');
    assert(res.data.data.completedTaskCount === 1, 'Completed count mismatch');
  });

  await test('Tasks: delete task', async () => {
    const res = await fetchWithCookie(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    }, cookieA);
    assert(res.status === 200, 'Failed to delete task');
  });

  console.log(`\n${passCount + failCount} tests run: ${passCount} passed, ${failCount} failed`);
  if (failCount > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
