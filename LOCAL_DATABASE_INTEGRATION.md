# Local Database Integration Guide

## 📋 Overview

This guide explains how to integrate your Life OS application with a local PostgreSQL database. You'll learn about the setup process, configuration, and how the integration works under the hood.

## 🎯 Why Local Database Integration?

### Benefits of Local Database:
- **Faster Development**: No Docker overhead
- **Direct Access**: Connect directly with database tools
- **Persistent Data**: Data survives system restarts
- **Multiple Projects**: Use same PostgreSQL for other projects
- **Better Performance**: Direct connection without containerization

## 🚀 Prerequisites

### Required Software:
- **PostgreSQL**: Installed locally (version 15+ recommended)
- **Node.js**: 18+ for the application
- **DBeaver**: For database management (optional but recommended)

### System Requirements:
- **macOS**: PostgreSQL installed via Homebrew or official installer
- **Windows**: PostgreSQL installed via official installer
- **Linux**: PostgreSQL installed via package manager

## 🔧 Local PostgreSQL Setup

### 1. Install PostgreSQL

#### macOS (Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database user (if needed)
createuser -s postgres
```

#### macOS (Official Installer):
1. Download from [postgresql.org](https://www.postgresql.org/download/macosx/)
2. Run the installer
3. Set password during installation
4. PostgreSQL starts automatically

#### Windows:
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Set password for `postgres` user
4. PostgreSQL starts as a service

### 2. Verify Installation

```bash
# Check if PostgreSQL is running
psql --version

# Connect to PostgreSQL
psql -U postgres -h localhost

# List databases
\l

# Exit psql
\q
```

## 📁 Environment Configuration

### 1. Create Environment Files

#### `.env.local` (Local Database Configuration):
```env
# Local PostgreSQL (Life OS Local)
DATABASE_URL="postgresql://postgres:Mony%401144@localhost:5432/life_os_local?schema=public"

# Next.js Configuration
NEXTAUTH_SECRET=your-local-secret-key
NEXTAUTH_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

#### `.env.docker` (Docker Database Configuration):
```env
# Docker PostgreSQL (Life OS Development)
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"

# Next.js Configuration
NEXTAUTH_SECRET=your-development-secret-key
NEXTAUTH_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### 2. Connection String Breakdown

```env
DATABASE_URL="postgresql://postgres:Mony%401144@localhost:5432/life_os_local?schema=public"
```

**Components:**
- `postgresql://` - Protocol
- `postgres` - Username
- `Mony%401144` - Password (URL encoded: `Mony@1144`)
- `localhost` - Host
- `5432` - Port
- `life_os_local` - Database name
- `?schema=public` - Schema

### 3. Password URL Encoding

If your password contains special characters:
```bash
# Original password: Mony@1144
# URL encoded: Mony%401144

# Common encodings:
# @ becomes %40
# # becomes %23
# % becomes %25
# + becomes %2B
# / becomes %2F
# : becomes %3A
```

## 🔄 Integration Process

### 1. How Environment Switching Works

When you run `npm run dev:local`:

```bash
npm run dev:local
# ↓
cp .env.local .env && next dev
```

**What happens:**
1. `.env.local` is copied to `.env`
2. Next.js loads environment variables from `.env`
3. Prisma reads `DATABASE_URL` from environment
4. Application connects to local PostgreSQL

### 2. Prisma Client Integration

#### `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Creates Prisma client using DATABASE_URL from environment
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

**Integration Flow:**
1. **Environment Load**: Next.js loads `.env` file
2. **Prisma Client**: Creates connection using `DATABASE_URL`
3. **Connection Pool**: Manages database connections
4. **API Usage**: All API routes use this client

### 3. API Route Integration

#### Example: `app/api/goals/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Uses Prisma client connected to local database
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}
```

## 🗄️ Database Setup Commands

### 1. Package.json Scripts

```json
{
  "scripts": {
    "dev:local": "cp .env.local .env && next dev",
    "db:setup:local": "cp .env.local .env && prisma generate && prisma migrate deploy && prisma db seed",
    "db:migrate:local": "cp .env.local .env && prisma migrate deploy",
    "db:seed:local": "cp .env.local .env && prisma db seed",
    "db:studio:local": "cp .env.local .env && prisma studio"
  }
}
```

### 2. Setup Process

#### Initial Setup:
```bash
# Setup local database (generate, migrate, seed)
npm run db:setup:local
```

**What this does:**
1. **Copy Environment**: `.env.local` → `.env`
2. **Generate Client**: Creates Prisma client for local database
3. **Run Migrations**: Creates tables in `life_os_local`
4. **Seed Data**: Inserts default data

#### Database Operations:
```bash
# Run migrations only
npm run db:migrate:local

# Seed data only
npm run db:seed:local

# Open Prisma Studio
npm run db:studio:local
```

## 📊 Database Schema Integration

### 1. Prisma Schema to PostgreSQL

#### Prisma Schema (`prisma/schema.prisma`):
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  goals     Goal[]
  tasks     Task[]
  preferences UserPreference?

  @@map("User")
}
```

#### Generated PostgreSQL Table:
```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### 2. Migration Process

#### Migration File (`prisma/migrations/xxx_init/migration.sql`):
```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 🔍 Database Management Tools

### 1. DBeaver Integration

#### Connection Setup:
```
Name: Life OS - Local
Host: localhost
Port: 5432
Database: life_os_local
Username: postgres
Password: Mony@1144
```

#### Useful Queries:
```sql
-- View all tables
\dt

-- View table structure
\d "User"

-- View data
SELECT * FROM "User";
SELECT * FROM "Goal";
SELECT * FROM "Task";

-- Count records
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Goal";
SELECT COUNT(*) FROM "Task";

-- View relationships
SELECT 
    u.name as user_name,
    g.title as goal_title,
    COUNT(t.id) as task_count
FROM "User" u
LEFT JOIN "Goal" g ON u.id = g."userId"
LEFT JOIN "Task" t ON g.id = t."goalId"
GROUP BY u.id, u.name, g.id, g.title;
```

### 2. Prisma Studio

#### Open Prisma Studio:
```bash
npm run db:studio:local
```

**Features:**
- Visual database browser
- Edit data directly
- View relationships
- Execute queries

### 3. Command Line Access

#### Connect via psql:
```bash
# Connect to database
psql -U postgres -h localhost -p 5432 -d life_os_local

# Or with connection string
psql "postgresql://postgres:Mony%401144@localhost:5432/life_os_local"
```

#### Useful psql Commands:
```sql
-- List databases
\l

-- Connect to database
\c life_os_local

-- List tables
\dt

-- Describe table
\d "User"

-- View data
SELECT * FROM "User";

-- Exit
\q
```

## 🔄 Real-time Data Flow

### 1. Application to Database Flow

```
1. User creates goal in app
   ↓
2. Frontend sends POST request to /api/goals
   ↓
3. API route calls prisma.goal.create()
   ↓
4. Prisma executes SQL: INSERT INTO "Goal" (...)
   ↓
5. Data saved to local PostgreSQL
   ↓
6. Response sent back to frontend
   ↓
7. UI updates to show new goal
```

### 2. Database to DBeaver Flow

```
1. Data saved to PostgreSQL
   ↓
2. DBeaver maintains active connection
   ↓
3. DBeaver can view data immediately
   ↓
4. Refresh tables to see latest data
```

## 🚨 Troubleshooting

### 1. Connection Issues

#### Problem: "Connection refused"
```bash
# Check if PostgreSQL is running
lsof -i :5432

# Start PostgreSQL (macOS)
brew services start postgresql@15

# Start PostgreSQL (Windows)
# Check Services app for PostgreSQL service
```

#### Problem: "Authentication failed"
```bash
# Check username/password
psql -U postgres -h localhost

# Reset password if needed
psql -U postgres -h localhost
ALTER USER postgres PASSWORD 'new_password';
```

#### Problem: "Database does not exist"
```sql
-- Connect to postgres database
psql -U postgres -h localhost

-- Create database
CREATE DATABASE life_os_local;

-- Connect to new database
\c life_os_local
```

### 2. Environment Issues

#### Problem: "DATABASE_URL is not defined"
```bash
# Check if .env file exists
ls -la .env

# Copy environment file
cp .env.local .env

# Verify content
cat .env
```

#### Problem: "Wrong database connected"
```bash
# Check current DATABASE_URL
echo $DATABASE_URL

# Switch to local database
npm run dev:local

# Or manually copy
cp .env.local .env
```

### 3. Migration Issues

#### Problem: "Migration failed"
```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run setup again
npm run db:setup:local
```

#### Problem: "Schema out of sync"
```bash
# Pull current schema
npx prisma db pull

# Generate client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

## 📈 Performance Optimization

### 1. Connection Pooling

#### Optimized Prisma Client:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling for production
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

### 2. Query Optimization

#### Efficient Queries:
```typescript
// Good: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})

// Good: Use include for relationships
const goalsWithTasks = await prisma.goal.findMany({
  include: {
    tasks: true,
    user: {
      select: { name: true, email: true }
    }
  }
})

// Good: Use where for filtering
const userGoals = await prisma.goal.findMany({
  where: { userId: 'user-id' }
})
```

## 🔒 Security Considerations

### 1. Password Security

#### Environment Variables:
- Never commit passwords to version control
- Use `.env.local` for local development
- Use `.env.docker` for Docker development
- Use environment variables in production

#### Password Encoding:
```env
# Original: Mony@1144
# Encoded: Mony%401144
DATABASE_URL="postgresql://postgres:Mony%401144@localhost:5432/life_os_local?schema=public"
```

### 2. Database Security

#### PostgreSQL Configuration:
```sql
-- Create dedicated user (optional)
CREATE USER life_os_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE life_os_local TO life_os_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO life_os_user;
```

## 🎯 Best Practices

### 1. Development Workflow

#### Daily Workflow:
```bash
# Start development with local database
npm run dev:local

# Make database changes
# Edit prisma/schema.prisma

# Run migrations
npm run db:migrate:local

# Seed data if needed
npm run db:seed:local

# View data in DBeaver or Prisma Studio
npm run db:studio:local
```

#### Switching Databases:
```bash
# Switch to local database
npm run dev:local

# Switch to Docker database
npm run dev:docker

# Check which database is active
cat .env | grep DATABASE_URL
```

### 2. Data Management

#### Backup Strategy:
```bash
# Backup local database
pg_dump -U postgres -h localhost life_os_local > backup.sql

# Restore database
psql -U postgres -h localhost life_os_local < backup.sql
```

#### Data Migration:
```bash
# Export data from one database
npx prisma db pull

# Import to another database
npx prisma db push
```

## 📚 Additional Resources

### Documentation:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

### Tools:
- [DBeaver](https://dbeaver.io/) - Database management
- [Prisma Studio](https://www.prisma.io/studio) - Visual database browser
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL administration

---

## 🎉 Integration Complete!

You now have a complete understanding of how local database integration works in your Life OS application:

- ✅ **Environment Configuration**: Multiple `.env` files for different databases
- ✅ **Prisma Integration**: Automatic connection management
- ✅ **API Integration**: Seamless database operations
- ✅ **Database Management**: Tools for viewing and managing data
- ✅ **Troubleshooting**: Solutions for common issues
- ✅ **Best Practices**: Optimized development workflow

Your local database integration is now fully functional and ready for development! 🚀 