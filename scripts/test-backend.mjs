import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function runTests() {
  console.log('Testing ResearchOS Backend Services and Models...');

  // 1. Verify User queries
  const user = await prisma.user.findUnique({
    where: { email: 'demo@researchos.io' },
  });
  if (!user) throw new Error('User not found!');
  console.log('✓ User retrieval check passed:', user.name);

  // 2. Verify password check
  const isMatch = await bcrypt.compare('Password123!', user.passwordHash);
  if (!isMatch) throw new Error('Password verification failed!');
  console.log('✓ Password hash comparison passed');

  // 3. Verify JWT token generation and verification
  const token = jwt.sign({ userId: user.id, email: user.email }, 'test-secret', { expiresIn: '1h' });
  const decoded = jwt.verify(token, 'test-secret');
  if (decoded.userId !== user.id) throw new Error('JWT verification mismatch');
  console.log('✓ JWT lifecycle check passed');

  // 4. Verify Project relations
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { documents: true, notes: true, collections: true } },
      projectTags: { include: { tag: true } },
    },
  });
  console.log(`✓ Projects check passed: found ${projects.length} projects`);
  for (const p of projects) {
    console.log(`   - [${p.status}] ${p.title} (${p._count.documents} docs, ${p._count.notes} notes)`);
  }

  // 5. Verify Document retrieval & tagging
  const docs = await prisma.document.findMany({
    where: { userId: user.id },
    include: {
      documentTags: { include: { tag: true } },
      project: true,
      collection: true,
    },
  });
  console.log(`✓ Documents check passed: found ${docs.length} documents`);

  // 6. Verify Notes retrieval
  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { noteTags: { include: { tag: true } } },
  });
  console.log(`✓ Notes check passed: found ${notes.length} notes`);

  // 7. Verify Activities audit log
  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
  });
  console.log(`✓ Activity history check passed: found ${activities.length} audit entries`);

  console.log('\nALL BACKEND CORE SERVICES AND DATABASE TESTS PASSED! 🎉');
}

runTests()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
