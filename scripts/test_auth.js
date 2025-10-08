const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  
  console.log('🧪 Testing Authentication Setup\n');
  
  try {
    // 1. Check database connection
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 2. Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}\n`);
    
    // 3. List all users with their accounts
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });
    
    if (users.length === 0) {
      console.log('⚠️  No users found!\n');
      console.log('Creating test user...');
      
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const user = await prisma.user.create({
        data: { email: testEmail, name: 'Test User' }
      });
      
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          refresh_token: hashedPassword,
        },
      });
      
      console.log('✅ Test user created:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}\n`);
    } else {
      console.log('📋 User List:\n');
      
      for (const user of users) {
        console.log(`User ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name || 'N/A'}`);
        
        const credAccount = user.accounts.find(acc => acc.provider === 'credentials');
        if (credAccount) {
          console.log(`  ✅ Has credentials account`);
          console.log(`  Password hash: ${credAccount.refresh_token ? 'Set' : 'Missing'}`);
          
          // Test password verification
          if (credAccount.refresh_token) {
            const testPasswords = ['password123', 'test123', 'admin123'];
            for (const pwd of testPasswords) {
              const isMatch = await bcrypt.compare(pwd, credAccount.refresh_token);
              if (isMatch) {
                console.log(`  🔑 Password matches: "${pwd}"`);
              }
            }
          }
        } else {
          console.log(`  ⚠️  No credentials account found`);
        }
        console.log('');
      }
    }
    
    // 4. Check environment variables
    console.log('🔧 Environment Variables:');
    console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Missing'}`);
    console.log(`  DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    
    if (!process.env.NEXTAUTH_SECRET) {
      console.log('\n⚠️  NEXTAUTH_SECRET is missing!');
      console.log('   Generate one with: openssl rand -base64 32');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();