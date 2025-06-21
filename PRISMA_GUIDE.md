# Prisma in Life OS - Complete Guide

## 📋 Overview

This guide explains how Prisma ORM is integrated and used throughout the Life OS application. You'll learn about the database structure, file organization, API patterns, and how Prisma connects with Next.js for a complete full-stack application.

## 🏗️ Project Structure

```
life-os/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.js               # Database seeding script
│   └── migrations/           # Database migration files
├── lib/
│   └── prisma.ts            # Prisma client singleton
├── app/
│   ├── api/                 # Next.js API routes
│   │   ├── goals/
│   │   ├── tasks/
│   │   └── users/
│   └── (pages)/             # Next.js app pages
└── components/              # React components
```

## 🗄️ Database Schema (prisma/schema.prisma)

### Complete Schema Overview

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  goals     Goal[]
  tasks     Task[]
  preferences UserPreference?

  @@map("User")
}

model UserPreference {
  id           String @id @default(cuid())
  userId       String @unique
  theme        String @default("light")
  notifications Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("UserPreference")
}

model Goal {
  id          String   @id @default(cuid())
  title       String
  description String?
  targetDate  DateTime?
  status      GoalStatus @default(IN_PROGRESS)
  priority    Priority @default(MEDIUM)
  category    String?
  progress    Int      @default(0)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks  Task[]

  @@map("Goal")
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority @default(MEDIUM)
  category    String?
  dueDate     DateTime?
  completedAt DateTime?
  goalId      String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal  Goal? @relation(fields: [goalId], references: [id], onDelete: SetNull)

  @@map("Task")
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  ON_HOLD
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Key Schema Concepts

#### 1. **Models and Tables**
- Each `model` in Prisma becomes a table in PostgreSQL
- `@@map("TableName")` specifies the actual table name in the database
- Fields become columns with specific data types

#### 2. **Relationships**
- **One-to-Many**: User → Goals, User → Tasks
- **One-to-One**: User → UserPreference
- **Many-to-One**: Tasks → Goal (optional)

#### 3. **Enums**
- `GoalStatus`, `TaskStatus`, `Priority` are PostgreSQL enums
- Provide type safety and data consistency

#### 4. **Timestamps**
- `createdAt` and `updatedAt` are automatically managed
- `@default(now())` and `@updatedAt` handle timestamps

## 🔧 Prisma Client Setup (lib/prisma.ts)

### Singleton Pattern

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Why Singleton Pattern?

1. **Development**: Prevents multiple Prisma Client instances during hot reloads
2. **Performance**: Reuses database connections
3. **Memory**: Reduces memory usage
4. **Connection Pooling**: Better connection management

## 🚀 API Integration Patterns

### 1. Goals API (app/api/goals/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/goals - Fetch all goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
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

// POST /api/goals - Create new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, targetDate, priority, category, userId } = body

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || 'MEDIUM',
        category,
        userId
      },
      include: {
        tasks: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
```

### 2. Individual Goal API (app/api/goals/[id]/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/goals/[id] - Fetch single goal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: {
        tasks: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

// PUT /api/goals/[id] - Update goal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, targetDate, status, priority, category, progress } = body

    const goal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        status,
        priority,
        category,
        progress
      },
      include: {
        tasks: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Delete goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.goal.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
```

### 3. Tasks API (app/api/tasks/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - Fetch all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const goalId = searchParams.get('goalId')
    const status = searchParams.get('status')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const where: any = { userId }
    
    if (goalId) where.goalId = goalId
    if (status) where.status = status

    const tasks = await prisma.task.findMany({
      where,
      include: {
        goal: {
          select: { title: true, id: true }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, category, dueDate, goalId, userId } = body

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        goalId: goalId || null,
        userId
      },
      include: {
        goal: {
          select: { title: true, id: true }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
```

## 🎯 Frontend Integration

### 1. React Hooks for Data Fetching

```typescript
// hooks/useGoals.ts
import { useState, useEffect } from 'react'

interface Goal {
  id: string
  title: string
  description?: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  progress: number
  targetDate?: string
  category?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export function useGoals(userId: string) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [userId])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/goals?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }
      
      const data = await response.json()
      setGoals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goalData, userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create goal')
      }
      
      const newGoal = await response.json()
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update goal')
      }
      
      const updatedGoal = await response.json()
      setGoals(prev => prev.map(goal => 
        goal.id === id ? updatedGoal : goal
      ))
      return updatedGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete goal')
      }
      
      setGoals(prev => prev.filter(goal => goal.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  }
}
```

### 2. Component Usage Example

```typescript
// components/GoalsList.tsx
'use client'

import { useGoals } from '@/hooks/useGoals'
import { useState } from 'react'

interface GoalsListProps {
  userId: string
}

export default function GoalsList({ userId }: GoalsListProps) {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals(userId)
  const [newGoalTitle, setNewGoalTitle] = useState('')

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalTitle.trim()) return

    try {
      await createGoal({
        title: newGoalTitle,
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        progress: 0
      })
      setNewGoalTitle('')
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: string) => {
    try {
      await updateGoal(goalId, { status: newStatus as any })
    } catch (error) {
      console.error('Failed to update goal status:', error)
    }
  }

  if (loading) return <div>Loading goals...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateGoal} className="flex gap-2">
        <input
          type="text"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          placeholder="Enter goal title..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Goal
        </button>
      </form>

      <div className="space-y-2">
        {goals.map((goal) => (
          <div key={goal.id} className="p-4 border rounded">
            <h3 className="font-semibold">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
            <div className="flex gap-2 mt-2">
              <select
                value={goal.status}
                onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <span className="text-sm text-gray-500">
                Progress: {goal.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🌱 Database Seeding (prisma/seed.js)

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'default@example.com' },
    update: {},
    create: {
      email: 'default@example.com',
      name: 'Default User'
    }
  })

  console.log('Default user created:', defaultUser)

  // Create user preferences
  await prisma.userPreference.upsert({
    where: { userId: defaultUser.id },
    update: {},
    create: {
      userId: defaultUser.id,
      theme: 'light',
      notifications: true
    }
  })

  console.log('Default user preferences created')

  // Create default categories
  const categories = [
    'Personal Development',
    'Career',
    'Health & Fitness',
    'Relationships',
    'Finance',
    'Learning',
    'Travel',
    'Hobbies',
    'Home & Family',
    'Spiritual',
    'Social',
    'Other'
  ]

  // Create sample goals
  const sampleGoals = [
    {
      title: 'Learn Next.js',
      description: 'Master Next.js framework for full-stack development',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'Learning',
      progress: 60,
      userId: defaultUser.id
    },
    {
      title: 'Exercise Regularly',
      description: 'Build a consistent workout routine',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      category: 'Health & Fitness',
      progress: 0,
      userId: defaultUser.id
    }
  ]

  for (const goalData of sampleGoals) {
    await prisma.goal.create({
      data: goalData
    })
  }

  console.log('Sample goals created')

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Complete Prisma tutorial',
      description: 'Finish the Prisma getting started guide',
      status: 'TODO',
      priority: 'HIGH',
      category: 'Learning',
      userId: defaultUser.id
    },
    {
      title: 'Set up PostgreSQL database',
      description: 'Configure PostgreSQL with Docker',
      status: 'COMPLETED',
      priority: 'HIGH',
      category: 'Learning',
      userId: defaultUser.id
    }
  ]

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: taskData
    })
  }

  console.log('Sample tasks created')
  console.log('Default categories created:', categories.length)
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 🔄 Database Migrations

### Understanding Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_user_preferences

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Migration File Structure

```
prisma/migrations/
├── 20250621083732_init/
│   └── migration.sql
├── 20250621090000_add_user_preferences/
│   └── migration.sql
└── migration_lock.toml
```

### Example Migration File

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
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 🛠️ Development Tools

### 1. Prisma Studio

```bash
# Open Prisma Studio for database management
npx prisma studio
```

Prisma Studio provides a web interface to:
- Browse and edit data
- View relationships
- Execute queries
- Manage database schema

### 2. Database Introspection

```bash
# Pull existing database schema
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

### 3. Environment Variables

```env
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"
```

## 🎯 Best Practices

### 1. Error Handling

```typescript
// Always wrap Prisma operations in try-catch
try {
  const result = await prisma.user.findUnique({
    where: { id: userId }
  })
  return result
} catch (error) {
  console.error('Database error:', error)
  throw new Error('Failed to fetch user')
}
```

### 2. Type Safety

```typescript
// Use Prisma generated types
import { User, Goal, Task } from '@prisma/client'

// For relations, use Prisma's utility types
import { Prisma } from '@prisma/client'

type GoalWithTasks = Prisma.GoalGetPayload<{
  include: { tasks: true }
}>
```

### 3. Query Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
    // Don't select password or sensitive fields
  }
})

// Use include for relations
const goalsWithTasks = await prisma.goal.findMany({
  include: {
    tasks: true,
    user: {
      select: { name: true, email: true }
    }
  }
})
```

### 4. Transaction Support

```typescript
// Use transactions for related operations
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com', name: 'John' }
  })
  
  const preference = await tx.userPreference.create({
    data: {
      userId: user.id,
      theme: 'dark'
    }
  })
  
  return { user, preference }
})
```

## 🔍 Debugging and Monitoring

### 1. Query Logging

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### 2. Performance Monitoring

```typescript
// Measure query performance
const start = Date.now()
const result = await prisma.user.findMany()
const duration = Date.now() - start
console.log(`Query took ${duration}ms`)
```

### 3. Database Health Checks

```typescript
// Health check endpoint
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

## 📚 Key Concepts Summary

### 1. **Schema Definition**
- Models define database tables
- Fields become columns
- Relations connect tables
- Enums provide type safety

### 2. **Client Usage**
- Singleton pattern prevents multiple instances
- Type-safe database operations
- Automatic connection management

### 3. **API Integration**
- RESTful endpoints with CRUD operations
- Error handling and validation
- Relationship management
- Query optimization

### 4. **Frontend Integration**
- Custom hooks for data fetching
- State management with React
- Real-time updates
- Error handling and loading states

### 5. **Database Management**
- Migrations for schema changes
- Seeding for initial data
- Studio for visual management
- Monitoring and debugging tools

---

## 🎉 Understanding Complete!

You now have a comprehensive understanding of how Prisma is used in the Life OS project:

- ✅ **Database Schema**: Complete model definitions and relationships
- ✅ **API Integration**: Full CRUD operations with error handling
- ✅ **Frontend Integration**: React hooks and component patterns
- ✅ **Development Tools**: Studio, migrations, and debugging
- ✅ **Best Practices**: Type safety, performance, and error handling

This guide serves as your complete reference for working with Prisma in the Life OS application! 🚀 