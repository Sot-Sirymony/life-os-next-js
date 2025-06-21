# Life OS - Personal Life Management System

A comprehensive life management application built with Next.js, Prisma, and PostgreSQL. Manage your goals, tasks, weekly planning, and personal development in one place.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd life-os
npm install
```

2. **Choose your database setup:**

#### Option A: Docker PostgreSQL (Recommended for Development)
```bash
# Start Docker PostgreSQL
docker-compose up -d

# Setup Docker database
npm run db:setup:docker

# Start development server with Docker database
npm run dev:docker
```

#### Option B: Local PostgreSQL
```bash
# Setup local database
npm run db:setup:local

# Start development server with local database
npm run dev:local
```

## 🌐 Access URLs

### Application
- **Life OS App**: [http://localhost:3001](http://localhost:3001) *(Note: Uses port 3001 if 3000 is busy)*
- **Default User**: `default@example.com` / `password`

### Database Management
- **PgAdmin**: [http://localhost:8080](http://localhost:8080)
  - Email: `admin@lifeos.com`
  - Password: `admin123`

## 🗄️ Dual Database Setup

This project supports both Docker and Local PostgreSQL databases for flexibility.

### Database 1: Docker PostgreSQL (Port 5433)
- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `life_os_dev`
- **Username**: `postgres`
- **Password**: `password`
- **Connection String**: `postgresql://postgres:password@localhost:5433/life_os_dev?schema=public`
- **Use for**: Development and testing

### Database 2: Local PostgreSQL (Port 5432)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `life_os_local`
- **Username**: `postgres`
- **Password**: `Mony@1144`
- **Connection String**: `postgresql://postgres:Mony%401144@localhost:5432/life_os_local?schema=public`
- **Use for**: Local development and other projects

## 🔧 Database Management Scripts

### Docker PostgreSQL Commands
```bash
npm run dev:docker              # Start dev server with Docker database
npm run db:setup:docker         # Setup Docker database (generate, migrate, seed)
npm run db:migrate:docker       # Run migrations on Docker database
npm run db:seed:docker          # Seed Docker database
npm run db:studio:docker        # Open Prisma Studio for Docker database
```

### Local PostgreSQL Commands
```bash
npm run dev:local               # Start dev server with local database
npm run db:setup:local          # Setup local database (generate, migrate, seed)
npm run db:migrate:local        # Run migrations on local database
npm run db:seed:local           # Seed local database
npm run db:studio:local         # Open Prisma Studio for local database
```

### General Commands
```bash
npm run dev                     # Start development server (uses current .env)
npm run build                   # Build for production
npm run start                   # Start production server
npm run db:start                # Start Docker PostgreSQL
npm run db:stop                 # Stop Docker PostgreSQL
npm run db:reset                # Reset Docker database
```

## 🗄️ Database Access

### DBeaver Connection Setup

#### Connection 1: Docker PostgreSQL
```
Name: Life OS - Docker
Host: localhost
Port: 5433
Database: life_os_dev
Username: postgres
Password: password
```

#### Connection 2: Local PostgreSQL
```
Name: Life OS - Local
Host: localhost
Port: 5432
Database: life_os_local
Username: postgres
Password: Mony@1144
```

### PgAdmin Setup (Docker)
1. Open [http://localhost:8080](http://localhost:8080)
2. Login with `admin@lifeos.com` / `admin123`
3. Right-click "Servers" → "Register" → "Server"
4. **General Tab**: Name = "Life OS"
5. **Connection Tab**:
   - Host: `postgres` (Docker service name)
   - Port: `5432`
   - Database: `life_os_dev`
   - Username: `postgres`
   - Password: `password`

### Command Line Access

#### Docker PostgreSQL
```bash
# Connect to Docker PostgreSQL
docker exec -it life_os_postgres psql -U postgres -d life_os_dev

# Useful psql commands:
\dt                    # List all tables
\d "User"             # Show User table structure
SELECT * FROM "User"; # View User data
\q                    # Exit psql
```

#### Local PostgreSQL
```bash
# Connect to local PostgreSQL
psql -U postgres -h localhost -p 5432 -d life_os_local

# Or with connection string
psql "postgresql://postgres:Mony%401144@localhost:5432/life_os_local"
```

## 📁 Project Structure

```
life-os/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── goals/          # Goals pages
│   ├── tasks/          # Tasks pages
│   └── weekly-planner/ # Weekly planner
├── components/         # React components
├── lib/               # Utility functions
├── prisma/            # Database schema and migrations
├── scripts/           # Database migration scripts
├── .env.docker        # Docker database configuration
├── .env.local         # Local database configuration
└── docker-compose.yml # PostgreSQL and PgAdmin setup
```

## 🎯 Features

- **Goal Management**: Create, track, and manage life goals
- **Task Management**: Organize tasks with categories and priorities
- **Weekly Planner**: Drag-and-drop weekly scheduling
- **Progress Tracking**: Visual progress indicators
- **Responsive Design**: Works on desktop and mobile
- **Alert System**: User feedback for CRUD operations
- **Dual Database Support**: Docker and Local PostgreSQL

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Docker Compose

## 📝 Environment Variables

### Docker Environment (.env.docker)
```env
# Docker PostgreSQL (Life OS Development)
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"

# Next.js
NEXTAUTH_SECRET=your-development-secret-key
NEXTAUTH_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### Local Environment (.env.local)
```env
# Local PostgreSQL (Life OS Local)
DATABASE_URL="postgresql://postgres:Mony%401144@localhost:5432/life_os_local?schema=public"

# Next.js
NEXTAUTH_SECRET=your-local-secret-key
NEXTAUTH_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

## 🔄 Migration Notes

- **From SQLite to PostgreSQL**: Successfully migrated with data preservation
- **Dual Database Setup**: Supports both Docker (port 5433) and Local (port 5432) PostgreSQL
- **Port Configuration**: Docker PostgreSQL runs on port 5433 to avoid conflicts
- **Default Data**: Seeded with default user, categories, and preferences

## 🚨 Troubleshooting

### Port Conflicts
- If port 3000 is busy, Next.js automatically uses 3001
- If port 5432 is busy, Docker PostgreSQL uses 5433
- Local PostgreSQL uses port 5432

### Database Issues
```bash
# Reset Docker database
npm run db:reset

# Reset local database
npx prisma migrate reset
npx prisma db seed

# Regenerate Prisma client
npx prisma generate
```

### Docker Issues
```bash
# Restart containers
docker-compose down
docker-compose up -d

# View logs
docker-compose logs postgres
```

### Connection Issues
```bash
# Check if databases are running
lsof -i :5432  # Local PostgreSQL
lsof -i :5433  # Docker PostgreSQL

# Test connections
npx prisma db pull  # Tests current DATABASE_URL
```

## 🔄 Switching Between Databases

### Quick Switch Commands
```bash
# Switch to Docker database
npm run dev:docker

# Switch to Local database
npm run dev:local

# Open Prisma Studio for specific database
npm run db:studio:docker
npm run db:studio:local
```

### Manual Switch
```bash
# Copy environment file to activate specific database
cp .env.docker .env    # Use Docker database
cp .env.local .env     # Use Local database
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Note**: This project uses dual PostgreSQL setup - Docker on port 5433 and Local on port 5432. Always check the terminal output for the correct URLs when starting the development server. Use the appropriate scripts to manage each database separately.




