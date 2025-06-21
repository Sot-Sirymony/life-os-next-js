# Life OS Deployment Guide - Vercel + PostgreSQL

## 📋 Overview

This guide covers the complete deployment process for the Life OS application to Vercel with a PostgreSQL database. You'll learn how to set up production environments, configure databases, and deploy your full-stack application.

## 🎯 Deployment Architecture

```
Production Environment:
├── Vercel (Frontend + API Routes)
│   ├── Next.js Application
│   ├── API Routes (/api/*)
│   └── Static Assets
└── PostgreSQL Database
    ├── Neon (Recommended)
    ├── Supabase
    └── Railway
```

## 🚀 Prerequisites

### Required Accounts
- **Vercel Account**: [vercel.com](https://vercel.com)
- **GitHub Account**: [github.com](https://github.com)
- **Database Provider**: Neon, Supabase, or Railway

### Required Software
- **Git**: Version control
- **Node.js 18+**: Local development
- **Vercel CLI**: Optional but recommended

## 📦 Database Setup

### Option 1: Neon (Recommended)

#### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project

#### 1.2 Create Database
```bash
# Neon will provide these details
Database Name: life_os_prod
User: your_username
Password: auto-generated
Host: your-project.neon.tech
Port: 5432
```

#### 1.3 Get Connection String
```bash
# Format: postgresql://username:password@host/database?sslmode=require
DATABASE_URL="postgresql://your_username:password@your-project.neon.tech/life_os_prod?sslmode=require"
```

### Option 2: Supabase

#### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for setup to complete

#### 2.2 Get Connection Details
```bash
# Go to Settings > Database
Host: db.your-project.supabase.co
Database: postgres
User: postgres
Password: your-database-password
Port: 5432
```

#### 2.3 Connection String
```bash
DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres?sslmode=require"
```

### Option 3: Railway

#### 3.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service

#### 3.2 Get Connection Details
```bash
# Railway provides connection details in the service dashboard
DATABASE_URL="postgresql://postgres:password@containers-us-west-XX.railway.app:5432/railway"
```

## 🔧 Local Development Setup

### 1. Environment Configuration

Create `.env.local` for local development:

```env
# Local Development
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"

# Production Database (for testing)
# DATABASE_URL="postgresql://username:password@your-db-host/database?sslmode=require"

# Next.js
NEXTAUTH_SECRET=your-development-secret-key
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 2. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations on production database
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### 3. Test Production Database

```bash
# Test connection
npx prisma db pull

# Verify schema
npx prisma studio
```

## 🚀 Vercel Deployment

### 1. Prepare Your Repository

#### 1.1 Update package.json
```json
{
  "name": "life-os",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

#### 1.2 Create vercel.json (Optional)
```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

#### 1.3 Update .gitignore
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.sqlite
```

### 2. Deploy to Vercel

#### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

#### 2.2 Configure Project
```
Project Name: life-os
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run vercel-build
Output Directory: .next
Install Command: npm install
```

#### 2.3 Environment Variables
Add these environment variables in Vercel dashboard:

```env
# Database
DATABASE_URL=postgresql://username:password@your-db-host/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

#### 2.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Check deployment logs for any errors

### 3. Post-Deployment Setup

#### 3.1 Run Database Migrations
```bash
# Connect to your Vercel project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

#### 3.2 Seed Production Database
```bash
# Seed the database
npx prisma db seed
```

## 🔐 Environment Variables Management

### 1. Vercel Environment Variables

#### 1.1 Production Variables
```env
# Database
DATABASE_URL=postgresql://username:password@your-db-host/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-super-secret-production-key
NEXTAUTH_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

#### 1.2 Preview Variables (Optional)
```env
# For preview deployments
DATABASE_URL=postgresql://username:password@your-staging-db-host/database?sslmode=require
NEXTAUTH_SECRET=your-staging-secret-key
NEXTAUTH_URL=https://your-app-git-main-your-username.vercel.app
```

### 2. Secret Management

#### 2.1 Generate Secure Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 2.2 Vercel CLI Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local
```

## 🗄️ Database Management

### 1. Production Database Setup

#### 1.1 Run Migrations
```bash
# Set production database URL
export DATABASE_URL="postgresql://username:password@your-db-host/database?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

#### 1.2 Seed Production Data
```bash
# Run seed script
npx prisma db seed

# Verify data
npx prisma studio
```

### 2. Database Monitoring

#### 2.1 Connection Pooling
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling for production
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 2.2 Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      },
      { status: 500 }
    )
  }
}
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions (Optional)

#### 1.1 Create .github/workflows/deploy.yml
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npx tsc --noEmit
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### 2. Vercel Auto-Deploy

#### 2.1 Configure Auto-Deploy
1. Go to Vercel project settings
2. Enable "Auto Deploy" for main branch
3. Configure preview deployments for pull requests

#### 2.2 Branch Protection
1. Go to GitHub repository settings
2. Add branch protection rules for main branch
3. Require status checks to pass before merging

## 🧪 Testing Deployment

### 1. Pre-Deployment Checklist

- [ ] **Database Connection**: Test production database connection
- [ ] **Environment Variables**: Verify all required variables are set
- [ ] **Migrations**: Run and verify database migrations
- [ ] **Build Process**: Test build locally with production settings
- [ ] **API Endpoints**: Test all API routes locally
- [ ] **Authentication**: Verify NextAuth configuration

### 2. Post-Deployment Testing

#### 2.1 Health Check
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health
```

#### 2.2 Database Connection
```bash
# Test database connection
curl https://your-app.vercel.app/api/goals?userId=test
```

#### 2.3 Authentication Flow
1. Visit your app URL
2. Test user registration/login
3. Verify protected routes work
4. Test CRUD operations

### 3. Performance Testing

#### 3.1 Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test
cat > load-test.yml << EOF
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/health"
      - get:
          url: "/api/goals"
EOF

# Run load test
artillery run load-test.yml
```

## 🔍 Monitoring and Debugging

### 1. Vercel Analytics

#### 1.1 Enable Analytics
1. Go to Vercel project dashboard
2. Navigate to Analytics tab
3. Enable Web Analytics
4. Add analytics script to your app

#### 1.2 Performance Monitoring
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Monitoring

#### 2.1 Vercel Error Tracking
```typescript
// lib/error-tracking.ts
export function logError(error: Error, context?: any) {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
  
  // Send to external service if needed
  // Sentry.captureException(error, { extra: context })
}
```

#### 2.2 API Error Handling
```typescript
// app/api/goals/route.ts
import { logError } from '@/lib/error-tracking'

export async function GET(request: NextRequest) {
  try {
    // ... existing code
  } catch (error) {
    logError(error, { endpoint: '/api/goals', method: 'GET' })
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### Issue 1: Database Connection Failed
**Problem**: `P1001: Can't reach database server`
**Solution**:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection locally
npx prisma db pull

# Verify SSL mode
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

#### Issue 2: Build Failed
**Problem**: Prisma client generation failed
**Solution**:
```bash
# Update build command in package.json
"vercel-build": "prisma generate && prisma migrate deploy && next build"

# Check Prisma schema
npx prisma validate
```

#### Issue 3: Environment Variables Missing
**Problem**: `DATABASE_URL is not defined`
**Solution**:
1. Check Vercel environment variables
2. Verify variable names match exactly
3. Redeploy after adding variables

#### Issue 4: Migration Failed
**Problem**: `Migration failed to apply`
**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (development only)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate deploy
```

### Debug Commands

```bash
# Check Vercel deployment logs
vercel logs

# Pull environment variables
vercel env pull .env.local

# Test database connection
npx prisma db pull

# Check build locally
npm run build

# Run production build
npm run vercel-build
```

## 📊 Performance Optimization

### 1. Database Optimization

#### 1.1 Connection Pooling
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
    // Connection pooling
    log: ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

#### 1.2 Query Optimization
```typescript
// Optimize queries with select and include
const goals = await prisma.goal.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    status: true,
    progress: true,
    tasks: {
      select: {
        id: true,
        title: true,
        status: true
      }
    }
  }
})
```

### 2. Caching Strategy

#### 2.1 API Response Caching
```typescript
// app/api/goals/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.json(goals)
  
  // Cache for 5 minutes
  response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate')
  
  return response
}
```

#### 2.2 Static Generation
```typescript
// app/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  // Fetch data at build time
  const goals = await prisma.goal.findMany()
  
  return (
    <div>
      {/* Render static content */}
    </div>
  )
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit secrets to version control
- Use Vercel's environment variable management
- Rotate secrets regularly
- Use different secrets for different environments

### 2. Database Security
- Use SSL connections (`sslmode=require`)
- Implement connection pooling
- Use least privilege database users
- Regular security updates

### 3. API Security
```typescript
// app/api/goals/route.ts
import { getServerSession } from 'next-auth/next'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... rest of the code
}
```

## 📈 Scaling Considerations

### 1. Database Scaling
- Monitor database performance
- Consider read replicas for heavy read loads
- Implement proper indexing
- Use connection pooling

### 2. Application Scaling
- Vercel automatically scales based on traffic
- Use edge functions for global performance
- Implement proper caching strategies
- Monitor and optimize API response times

### 3. Cost Optimization
- Monitor Vercel usage and costs
- Optimize database queries
- Use appropriate database plans
- Implement proper caching to reduce database calls

---

## 🎉 Deployment Complete!

After following this guide, you should have:

- ✅ **Production Database**: PostgreSQL running in the cloud
- ✅ **Vercel Deployment**: Application deployed and accessible
- ✅ **Environment Variables**: Properly configured
- ✅ **Database Migrations**: Applied to production
- ✅ **Monitoring**: Health checks and error tracking
- ✅ **Security**: SSL connections and proper authentication

Your Life OS application is now live and ready for production use! 🚀

### Next Steps:
1. **Monitor Performance**: Use Vercel Analytics and logs
2. **Set Up Alerts**: Configure error notifications
3. **Backup Strategy**: Implement database backups
4. **CI/CD**: Set up automated testing and deployment
5. **Documentation**: Keep deployment docs updated 