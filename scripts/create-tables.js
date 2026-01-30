const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.POSTGRES_URL
});

async function createTables() {
    try {
        console.log('Creating tables...');

        // Execute SQL directly
        await prisma.$executeRawUnsafe(`
      -- Create User table
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT,
          "username" TEXT UNIQUE,
          "email" TEXT UNIQUE,
          "emailVerified" TIMESTAMP(3),
          "image" TEXT,
          "languages" JSONB,
          "isOnboarded" BOOLEAN NOT NULL DEFAULT false
      );
    `);
        console.log('✓ User table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          "refresh_token" TEXT,
          "access_token" TEXT,
          "expires_at" INTEGER,
          "token_type" TEXT,
          "scope" TEXT,
          "id_token" TEXT,
          "session_state" TEXT,
          CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
          CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
      );
    `);
        console.log('✓ Account table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionToken" TEXT NOT NULL UNIQUE,
          "userId" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
        console.log('✓ Session table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
          "identifier" TEXT NOT NULL,
          "token" TEXT NOT NULL UNIQUE,
          "expires" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
      );
    `);
        console.log('✓ VerificationToken table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Post" (
          "id" SERIAL PRIMARY KEY,
          "content" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "authorId" TEXT NOT NULL,
          CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")
      );
    `);
        console.log('✓ Post table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Comment" (
          "id" SERIAL PRIMARY KEY,
          "text" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "authorId" TEXT NOT NULL,
          "postId" INTEGER NOT NULL,
          "replyToId" INTEGER,
          CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id"),
          CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id")
      );
    `);
        console.log('✓ Comment table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Like" (
          "id" SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          "postId" INTEGER NOT NULL,
          CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
          CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id"),
          CONSTRAINT "Like_userId_postId_key" UNIQUE ("userId", "postId")
      );
    `);
        console.log('✓ Like table created');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Follow" (
          "id" SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "followerId" TEXT NOT NULL,
          "followingId" TEXT NOT NULL,
          CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id"),
          CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id"),
          CONSTRAINT "Follow_followerId_followingId_key" UNIQUE ("followerId", "followingId")
      );
    `);
        console.log('✓ Follow table created');

        console.log('\n✅ All tables created successfully!');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTables();
