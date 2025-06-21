# SQLite to PostgreSQL Migration Guide

## 📋 Overview

This guide documents the complete migration process from SQLite to PostgreSQL for the Life OS application. The migration includes setting up PostgreSQL with Docker, migrating the database schema, transferring data, and updating the application configuration.

## 🎯 Migration Goals

- Migrate from SQLite to PostgreSQL for better scalability and performance
- Preserve all existing data during migration
- Set up a robust development environment with Docker
- Configure proper database management tools (PgAdmin)
- Update application configuration for PostgreSQL

## 📋 Prerequisites

### Required Software
- **Docker Desktop** - For running PostgreSQL and PgAdmin containers
- **Node.js 18+** - For running the Next.js application
- **npm or yarn** - Package manager
- **Git** - Version control (optional but recommended)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: macOS, Windows, or Linux

## 🚀 Step-by-Step Migration Process

### Phase 1: Environment Setup

#### 1.1 Install Dependencies

```bash
# Install PostgreSQL dependencies
npm install pg @types/pg

# Verify installation
npm list pg
```

#### 1.2 Create Docker Compose Configuration

Create `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: life_os_postgres
    environment:
      POSTGRES_DB: life_os_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"  # Using 5433 to avoid conflicts with local PostgreSQL
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: life_os_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@lifeos.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 1.3 Create Database Initialization Script

Create `scripts/init.sql`:

```sql
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE life_os_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'life_os_dev')\gexec

-- Connect to the database
\c life_os_dev;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Phase 2: Prisma Schema Update

#### 2.1 Update Prisma Schema

Update `prisma/schema.prisma`:

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

// ... rest of your models remain the same
```

#### 2.2 Update Environment Variables

Update your `.env` file:

```env
# Database Configuration
# PostgreSQL (Production)
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"

# PostgreSQL (Development with Docker)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/life_os_dev?schema=public"

# PostgreSQL (Supabase/Neon/Other Cloud Provider)
# DATABASE_URL="postgresql://username:password@host:port/database?schema=public&sslmode=require"

# Environment
NODE_ENV=development

# Next.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Phase 3: Database Migration

#### 3.1 Start PostgreSQL Container

```bash
# Start PostgreSQL and PgAdmin containers
docker compose up -d

# Verify containers are running
docker compose ps
```

Expected output:
```
NAME               IMAGE                   COMMAND                  SERVICE    CREATED          STATUS                    PORTS
life_os_pgadmin    dpage/pgadmin4:latest   "/entrypoint.sh"         pgadmin    14 seconds ago   Up 4 seconds              443/tcp, 0.0.0.0:8080->80/tcp
life_os_postgres   postgres:15-alpine      "docker-entrypoint.s…"   postgres   21 minutes ago   Up 21 minutes (healthy)   0.0.0.0:5433->5432/tcp
```

#### 3.2 Test Database Connection

```bash
# Test connection using psql
docker exec -it life_os_postgres psql -U postgres -d life_os_dev -c "\l"
```

#### 3.3 Clear Old Migrations

```bash
# Remove old SQLite migrations
rm -rf prisma/migrations
```

#### 3.4 Generate New PostgreSQL Migrations

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

Expected output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "life_os_dev", schema "public" at "localhost:5433"

Applying migration `20250621083732_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250621083732_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.10.0) to ./node_modules/@prisma/client in 227ms
```

#### 3.5 Seed the Database

```bash
# Run database seeding
npx prisma db seed
```

Expected output:
```
Environment variables loaded from .env
Running seed command `node prisma/seed.js` ...
Default user created: {
  id: 'd8e48612-8594-4e23-9658-90abb70ce684',
  email: 'default@example.com',
  name: 'Default User',
  createdAt: 2025-06-21T08:37:38.027Z,
  updatedAt: 2025-06-21T08:37:38.027Z
}
Default user preferences created
Default categories created: 12

🌱  The seed command has been executed.
```

### Phase 4: Data Migration (If Needed)

#### 4.1 Export SQLite Data (Optional)

If you have existing data in SQLite that needs to be migrated:

```bash
# Create data export script
cat > scripts/export-sqlite-data.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./prisma/dev.db');

// Export Users
db.all("SELECT * FROM User", [], (err, rows) => {
  if (err) throw err;
  fs.writeFileSync('./data/users.json', JSON.stringify(rows, null, 2));
  console.log('Users exported:', rows.length);
});

// Export Goals
db.all("SELECT * FROM Goal", [], (err, rows) => {
  if (err) throw err;
  fs.writeFileSync('./data/goals.json', JSON.stringify(rows, null, 2));
  console.log('Goals exported:', rows.length);
});

// Export Tasks
db.all("SELECT * FROM Task", [], (err, rows) => {
  if (err) throw err;
  fs.writeFileSync('./data/tasks.json', JSON.stringify(rows, null, 2));
  console.log('Tasks exported:', rows.length);
});

db.close();
EOF

# Run export script
node scripts/export-sqlite-data.js
```

#### 4.2 Import Data to PostgreSQL (Optional)

```bash
# Create data import script
cat > scripts/import-postgres-data.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  try {
    // Import Users
    const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log('Users imported:', users.length);

    // Import Goals
    const goals = JSON.parse(fs.readFileSync('./data/goals.json', 'utf8'));
    for (const goal of goals) {
      await prisma.goal.upsert({
        where: { id: goal.id },
        update: goal,
        create: goal,
      });
    }
    console.log('Goals imported:', goals.length);

    // Import Tasks
    const tasks = JSON.parse(fs.readFileSync('./data/tasks.json', 'utf8'));
    for (const task of tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: task,
        create: task,
      });
    }
    console.log('Tasks imported:', tasks.length);

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
EOF

# Run import script
node scripts/import-postgres-data.js
```

### Phase 5: Application Testing

#### 5.1 Start Development Server

```bash
# Start the application
npm run dev
```

Expected output:
```
> life-os@0.1.0 dev
> next dev
 ⚠ Port 3000 is in use, using available port 3001 instead.
   ▲ Next.js 15.3.3
   - Local:        http://localhost:3001
   - Network:      http://192.168.0.164:3001
   - Environments: .env
 ✓ Starting...
 ✓ Ready in 1262ms
```

#### 5.2 Test Application Features

1. **Access the application**: http://localhost:3001
2. **Test user authentication**: Login with default credentials
3. **Create test data**: Add goals, tasks, and weekly plans
4. **Verify data persistence**: Check that data is saved and retrieved correctly

### Phase 6: Database Management Setup

#### 6.1 Access PgAdmin

1. **Open PgAdmin**: http://localhost:8080
2. **Login credentials**:
   - Email: `admin@lifeos.com`
   - Password: `admin123`

#### 6.2 Configure Database Connection

1. **Register new server**:
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab**: Name = "Life OS"
   - **Connection Tab**:
     - Host: `postgres` (Docker service name)
     - Port: `5432`
     - Database: `life_os_dev`
     - Username: `postgres`
     - Password: `password`

2. **Alternative connection** (if Docker networking fails):
   - Host: `localhost`
   - Port: `5433`
   - Database: `life_os_dev`
   - Username: `postgres`
   - Password: `password`

#### 6.3 Verify Database Structure

1. **Browse tables**: Expand `Servers > Life OS > Databases > life_os_dev > Schemas > public > Tables`
2. **View data**: Right-click any table → "View/Edit Data" → "All Rows"
3. **Run queries**: Use Query Tool to execute SQL commands

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Conflicts

**Problem**: Port 5432 is already in use
**Solution**: 
```bash
# Check what's using port 5432
lsof -i :5432

# Use port 5433 in docker-compose.yml
ports:
  - "5433:5432"
```

#### Issue 2: Docker Connection Problems

**Problem**: Can't connect to PostgreSQL from PgAdmin
**Solution**:
```bash
# Restart containers
docker compose down
docker compose up -d

# Check container logs
docker compose logs postgres
```

#### Issue 3: Migration Provider Switch Error

**Problem**: `P3019` error about provider mismatch
**Solution**:
```bash
# Remove old migrations
rm -rf prisma/migrations

# Create new migration
npx prisma migrate dev --name init
```

#### Issue 4: Environment Variable Issues

**Problem**: Wrong database URL format
**Solution**: Ensure `.env` has correct format:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"
```

#### Issue 5: Permission Denied

**Problem**: Docker permission errors
**Solution**:
```bash
# Fix Docker permissions
sudo chown $USER:$USER ~/.docker -R
sudo chmod 666 /var/run/docker.sock
```

### Verification Commands

#### Check Database Status
```bash
# Check if PostgreSQL is running
docker exec -it life_os_postgres pg_isready -U postgres

# Check database connection
docker exec -it life_os_postgres psql -U postgres -d life_os_dev -c "SELECT version();"

# List all tables
docker exec -it life_os_postgres psql -U postgres -d life_os_dev -c "\dt"
```

#### Check Application Status
```bash
# Test Prisma connection
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status
```

## 📊 Migration Checklist

### Pre-Migration
- [ ] Backup existing SQLite database
- [ ] Install PostgreSQL dependencies
- [ ] Create Docker Compose configuration
- [ ] Update Prisma schema
- [ ] Update environment variables

### Migration
- [ ] Start PostgreSQL container
- [ ] Test database connection
- [ ] Clear old migrations
- [ ] Generate new migrations
- [ ] Seed database
- [ ] Export/import data (if needed)

### Post-Migration
- [ ] Test application functionality
- [ ] Verify data integrity
- [ ] Set up PgAdmin access
- [ ] Update documentation
- [ ] Test all CRUD operations

## 🎯 Best Practices

### Database Management
1. **Regular backups**: Set up automated database backups
2. **Version control**: Keep migration files in version control
3. **Environment separation**: Use different databases for dev/staging/prod
4. **Connection pooling**: Implement connection pooling for production

### Development Workflow
1. **Migration testing**: Always test migrations on a copy of production data
2. **Rollback plan**: Have a rollback strategy for failed migrations
3. **Documentation**: Keep migration logs and documentation updated
4. **Monitoring**: Set up database monitoring and alerting

### Security
1. **Strong passwords**: Use strong passwords for database users
2. **Network security**: Restrict database access to necessary IPs
3. **SSL connections**: Use SSL for production database connections
4. **Regular updates**: Keep PostgreSQL and dependencies updated

## 📚 Additional Resources

### Documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PgAdmin Documentation](https://www.pgadmin.org/docs/)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [DBeaver](https://dbeaver.io/) - Universal database tool
- [TablePlus](https://tableplus.com/) - Modern database GUI

### Monitoring
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - Query statistics
- [pgAdmin](https://www.pgadmin.org/) - Database administration
- [Grafana](https://grafana.com/) - Database monitoring

---

## 🎉 Migration Complete!

After following this guide, you should have:
- ✅ PostgreSQL database running in Docker
- ✅ PgAdmin web interface accessible
- ✅ Application connected to PostgreSQL
- ✅ All data migrated and verified
- ✅ Development environment fully functional

Your Life OS application is now running on a robust PostgreSQL database with proper management tools and monitoring capabilities! 