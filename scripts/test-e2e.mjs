const BASE_URL = 'http://localhost:3000';

async function testSuite() {
  console.log(`Executing ResearchOS End-to-End HTTP Test Suite on ${BASE_URL}...\n`);

  // 1. Landing Page
  const landingRes = await fetch(`${BASE_URL}/`);
  if (landingRes.status !== 200) throw new Error(`Landing page returned status ${landingRes.status}`);
  console.log('✓ Public Landing Page [GET /] status 200 OK');

  // 2. Pricing Page
  const pricingRes = await fetch(`${BASE_URL}/pricing`);
  if (pricingRes.status !== 200) throw new Error(`Pricing page returned status ${pricingRes.status}`);
  console.log('✓ Pricing Matrix Page [GET /pricing] status 200 OK');

  // 3. Login Page
  const loginPageRes = await fetch(`${BASE_URL}/login`);
  if (loginPageRes.status !== 200) throw new Error(`Login page returned status ${loginPageRes.status}`);
  console.log('✓ Login Page [GET /login] status 200 OK');

  // 4. API Authentication Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@researchos.io',
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || !loginData.data.token) {
    throw new Error(`API login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  console.log(`✓ Auth API [POST /api/auth/login] Authenticated as "${loginData.data.user.name}" (${loginData.data.user.institution})`);

  // 5. Auth Me check
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  if (!meRes.ok || !meData.success || meData.data.user.email !== 'demo@researchos.io') {
    throw new Error('GET /api/auth/me failed');
  }
  console.log('✓ Session Verification [GET /api/auth/me] Validated session');

  // 6. Projects API
  const projRes = await fetch(`${BASE_URL}/api/projects`, { headers: authHeaders });
  const projData = await projRes.json();
  if (!projRes.ok || !projData.success) throw new Error('GET /api/projects failed');
  console.log(`✓ Projects API [GET /api/projects] Found ${projData.data.length} projects`);

  // 7. Create New Project
  const newProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Automated E2E Test: Synthetic Biology Chassis 2026',
      description: 'Evaluating minimal genome architectures for recombinant enzyme manufacturing.',
      color: '#06b6d4',
      status: 'ACTIVE',
      visibility: 'PRIVATE',
    }),
  });
  const newProjData = await newProjRes.json();
  if (!newProjRes.ok || !newProjData.success) throw new Error('POST /api/projects failed');
  const createdProjectId = newProjData.data.id;
  console.log(`✓ Project Creation [POST /api/projects] Created project ID: ${createdProjectId}`);

  // 8. Documents API
  const docsRes = await fetch(`${BASE_URL}/api/documents`, { headers: authHeaders });
  const docsData = await docsRes.json();
  if (!docsRes.ok || !docsData.success) throw new Error('GET /api/documents failed');
  console.log(`✓ Documents API [GET /api/documents] Retrieved ${docsData.data.length} literature records`);

  // 9. Notes API (Create Note)
  const newNoteRes = await fetch(`${BASE_URL}/api/notes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Thermodynamic Stability of Synthetic Operon RBS Sites',
      content: 'Calculated ribosome binding site delta-G translation initiation rates for orthogonal promoters.',
      projectId: createdProjectId,
      isPinned: true,
    }),
  });
  const newNoteData = await newNoteRes.json();
  if (!newNoteRes.ok || !newNoteData.success) throw new Error('POST /api/notes failed');
  console.log(`✓ Notes API [POST /api/notes] Authored note: "${newNoteData.data.title}"`);

  // 10. Collections API
  const colRes = await fetch(`${BASE_URL}/api/collections`, { headers: authHeaders });
  const colData = await colRes.json();
  if (!colRes.ok || !colData.success) throw new Error('GET /api/collections failed');
  console.log(`✓ Collections API [GET /api/collections] Found ${colData.data.length} collections`);

  // 11. Tags API
  const tagRes = await fetch(`${BASE_URL}/api/tags`, { headers: authHeaders });
  const tagData = await tagRes.json();
  if (!tagRes.ok || !tagData.success) throw new Error('GET /api/tags failed');
  console.log(`✓ Taxonomy API [GET /api/tags] Found ${tagData.data.length} tags`);

  // 12. Search API
  const searchRes = await fetch(`${BASE_URL}/api/search?q=CRISPR`, { headers: authHeaders });
  const searchData = await searchRes.json();
  if (!searchRes.ok || !searchData.success) throw new Error('GET /api/search failed');
  console.log(`✓ Search API [GET /api/search?q=CRISPR] Found ${searchData.data.totalCount} matches across entities`);

  // 13. Analytics API
  const analyticsRes = await fetch(`${BASE_URL}/api/analytics`, { headers: authHeaders });
  const analyticsData = await analyticsRes.json();
  if (!analyticsRes.ok || !analyticsData.success) throw new Error('GET /api/analytics failed');
  console.log(`✓ Analytics API [GET /api/analytics] Total projects: ${analyticsData.data.overview.totalProjects}, Vault storage: ${analyticsData.data.overview.formattedStorage}`);

  // 14. Activity API
  const actRes = await fetch(`${BASE_URL}/api/activity?limit=10`, { headers: authHeaders });
  const actData = await actRes.json();
  if (!actRes.ok || !actData.success) throw new Error('GET /api/activity failed');
  console.log(`✓ Activity Audit API [GET /api/activity] Retrieved ${actData.data.length} audit entries`);

  console.log('\n======================================================');
  console.log('✅ ALL RESEARCHOS END-TO-END HTTP TESTS PASSED 100%!');
  console.log('======================================================\n');
}

testSuite().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
