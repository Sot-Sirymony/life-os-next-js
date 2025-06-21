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

2. **Start PostgreSQL database:**
```bash
docker-compose up -d
```

3. **Set up database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

4. **Start development server:**
```bash
npm run dev
```

## 🌐 Access URLs

### Application
- **Life OS App**: [http://localhost:3001](http://localhost:3001) *(Note: Uses port 3001 if 3000 is busy)*
- **Default User**: `default@example.com` / `password`

### Database Management
- **PgAdmin**: [http://localhost:5050](http://localhost:5050)
  - Email: `admin@admin.com`
  - Password: `admin`

### Database Connection Details
- **Host**: `localhost`
- **Port**: `5433` *(Changed from 5432 to avoid conflicts)*
- **Database**: `life_os_dev`
- **Username**: `postgres`
- **Password**: `password`
- **Connection String**: `postgresql://postgres:password@localhost:5433/life_os_dev?schema=public`

## 🗄️ Database Access

### PgAdmin Setup
1. Open [http://localhost:5050](http://localhost:5050)
2. Login with `admin@admin.com` / `admin`
3. Right-click "Servers" → "Register" → "Server"
4. **General Tab**: Name = "Life OS"
5. **Connection Tab**:
   - Host: `localhost`
   - Port: `5433`
   - Database: `life_os_dev`
   - Username: `postgres`
   - Password: `password`

### Command Line Access
```bash
# Connect to PostgreSQL
docker exec -it life_os_postgres psql -U postgres -d life_os_dev

# Useful psql commands:
\dt                    # List all tables
\d "User"             # Show User table structure
SELECT * FROM "User"; # View User data
\q                    # Exit psql
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
└── docker-compose.yml # PostgreSQL and PgAdmin setup
```

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run db:migrate-to-postgres  # Migrate from SQLite to PostgreSQL
npx prisma studio        # Open Prisma Studio
npx prisma db seed       # Seed database with default data
```

## 🎯 Features

- **Goal Management**: Create, track, and manage life goals
- **Task Management**: Organize tasks with categories and priorities
- **Weekly Planner**: Drag-and-drop weekly scheduling
- **Progress Tracking**: Visual progress indicators
- **Responsive Design**: Works on desktop and mobile
- **Alert System**: User feedback for CRUD operations

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Docker Compose

## 📝 Environment Variables

Create a `.env` file with:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_os_dev?schema=public"

# Environment
NODE_ENV=development

# Next.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## 🔄 Migration Notes

- **From SQLite to PostgreSQL**: Successfully migrated with data preservation
- **Port Configuration**: PostgreSQL runs on port 5433 to avoid conflicts
- **Default Data**: Seeded with default user, categories, and preferences

## 🚨 Troubleshooting

### Port Conflicts
- If port 3000 is busy, Next.js automatically uses 3001
- If port 5432 is busy, PostgreSQL uses 5433

### Database Issues
```bash
# Reset database
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

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Note**: This project uses PostgreSQL on port 5433 and the app typically runs on port 3001. Always check the terminal output for the correct URLs when starting the development server.

PgAdmin is running on port 8080, not 5050.
To view your database, open your browser and go to:
http://localhost:8080
Login credentials:
Email: admin@lifeos.com
Password: admin123
Let me know if you can access it now! If you want to use a different port or credentials, I can help you update the configuration.