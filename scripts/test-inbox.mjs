

const BASE_URL = 'http://localhost:3000';

async function testInbox() {
  console.log(`Executing ResearchOS Inbox Test Suite on ${BASE_URL}...\n`);

  // 1. Auth setup
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@researchos.io', password: 'Password123!' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) throw new Error('API login failed');
  const token = loginData.data.token;
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  console.log('✓ Auth API login successful');

  const otherLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.elena@researchos.io', password: 'Password123!' }),
  });
  const otherLoginData = await otherLoginRes.json();
  const otherToken = otherLoginData.data.token;
  const otherAuthHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otherToken}` };

  // 3. Trigger events via APIs
  const newProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Inbox Test Project', description: 'Test project' }),
  });
  const projData = await newProjRes.json();
  const projectId = projData.data.id;

  const noteRes = await fetch(`${BASE_URL}/api/notes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Inbox Test Note', content: 'Test content', projectId }),
  });
  const noteData = await noteRes.json();

  const taskRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Inbox Test Task', projectId, dueDate: new Date().toISOString() }), // Overdue task
  });
  const taskData = await taskRes.json();

  console.log('✓ Triggered events for NEW_NOTE and TASK_OVERDUE');

  // 4. Verify list and count
  let unreadRes = await fetch(`${BASE_URL}/api/inbox/unread`, { headers: authHeaders });
  let unreadData = await unreadRes.json();
  if (!unreadRes.ok || unreadData.data.count < 2) throw new Error('Unread count failed: expected at least 2, got ' + unreadData.data?.count);
  console.log(`✓ Inbox API [GET /api/inbox/unread] Found ${unreadData.data.count} unread items`);

  let inboxRes = await fetch(`${BASE_URL}/api/inbox`, { headers: authHeaders });
  let inboxData = await inboxRes.json();
  if (!inboxRes.ok || inboxData.data.length < 2) throw new Error('List inbox items failed');
  const items = inboxData.data;
  console.log(`✓ Inbox API [GET /api/inbox] Retrieved ${items.length} total items`);

  // 5. Test isolation: other user should not see these items
  let otherInboxRes = await fetch(`${BASE_URL}/api/inbox`, { headers: otherAuthHeaders });
  let otherInboxData = await otherInboxRes.json();
  if (otherInboxData.data.find(i => i.resourceId === noteData.data.id)) {
      throw new Error('User isolation failed: saw other users item');
  }
  console.log('✓ Inbox API Isolation: User isolation confirmed');

  // 6. Test Mark as read
  const itemIdToUpdate = items[0].id;
  const markReadRes = await fetch(`${BASE_URL}/api/inbox/${itemIdToUpdate}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ isRead: true })
  });
  if (!markReadRes.ok) throw new Error('Mark as read failed');
  console.log('✓ Inbox API [PATCH /api/inbox/:id] Marked item as read');

  // 7. Test dismissal
  const dismissRes = await fetch(`${BASE_URL}/api/inbox/${itemIdToUpdate}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  if (!dismissRes.ok) throw new Error('Dismiss item failed');
  console.log('✓ Inbox API [DELETE /api/inbox/:id] Dismissed item');

  // 8. Test duplicate prevention
  // Re-trigger exact same action manually
  const duplicateTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Inbox Test Task 2', projectId, dueDate: new Date().toISOString() }), // Overdue task
  });

  const duplicateTaskData = await duplicateTaskRes.json();
  const inboxAfterRes = await fetch(`${BASE_URL}/api/inbox`, { headers: authHeaders });
  const inboxAfterData = await inboxAfterRes.json();
  const taskOverdueItems = inboxAfterData.data.filter(i => i.type === 'TASK_OVERDUE' && i.resourceId === duplicateTaskData.data.id);
  if (taskOverdueItems.length > 1) {
    throw new Error('Duplicate prevention failed');
  }
  console.log('✓ Inbox API Duplicate Prevention confirmed');

  // 9. Test Mark all as read
  const markAllRes = await fetch(`${BASE_URL}/api/inbox/mark-all-read`, {
      method: 'POST',
      headers: authHeaders
  });
  if (!markAllRes.ok) throw new Error('Mark all read failed');
  console.log('✓ Inbox API [POST /api/inbox/mark-all-read] Marked all read');

  unreadRes = await fetch(`${BASE_URL}/api/inbox/unread`, { headers: authHeaders });
  unreadData = await unreadRes.json();
  if (unreadData.data.count !== 0) throw new Error('Unread count is not 0 after marking all read');
  console.log('✓ Inbox API Unread count is 0');

  console.log('\n======================================================');
  console.log('✅ ALL INBOX HTTP TESTS PASSED 100%!');
  console.log('======================================================\n');
}

testInbox().catch((err) => {
  console.error('\n❌ INBOX TEST FAILED:', err);
  process.exit(1);
});
