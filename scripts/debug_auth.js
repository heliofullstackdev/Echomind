const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  
  console.log('🔍 Checking database setup...\n');
  
  try {
    // Check if we can connect
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        include: {
          accounts: true,
        },
      });
      
      console.log('\nUser details:');
      users.forEach(user => {
        console.log(`\n- ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name || 'N/A'}`);
        console.log(`  Accounts: ${user.accounts.length}`);
        user.accounts.forEach(acc => {
          console.log(`    - Provider: ${acc.provider}`);
        });
      });
    } else {
      console.log('\n⚠️  No users found. Run: node scripts/create_test_user.js');
    }
    
    // Check environment variables
    console.log('\n🔧 Environment Check:');
    console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Missing'}`);
    console.log(`DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`GITHUB_ID: ${process.env.GITHUB_ID ? '✅ Set' : '⚠️  Not set (optional)'}`);
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '⚠️  Not set'}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n💡 Try running: npx prisma migrate dev --name init');
  } finally {
    await prisma.$disconnect();
  }
})();