const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  const email = 'testuser@example.com';
  const name = 'Test User';
  const password = 'password123';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', existing.id);
    process.exit(0);
  }
  const user = await prisma.user.create({ data: { email, name } });
  const hashed = await bcrypt.hash(password, 10);
  await prisma.account.create({ data: { userId: user.id, type: 'credentials', provider: 'credentials', providerAccountId: user.id, refresh_token: hashed } });
  console.log('Created user', user.id);
  await prisma.$disconnect();
})();
