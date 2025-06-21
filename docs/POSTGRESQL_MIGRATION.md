# PostgreSQL Migration Guide

This guide will help you migrate your Life OS application from SQLite to PostgreSQL.

## 🎯 Why PostgreSQL?

- **Better Performance**: Optimized for complex queries and large datasets
- **ACID Compliance**: Full transaction support and data integrity
- **Advanced Features**: JSON support, full-text search, and more
- **Scalability**: Better suited for production environments
- **Concurrent Access**: Multiple users can access the database simultaneously

## 📋 Prerequisites

- Docker installed and running
- Node.js and npm
- Your existing SQLite database with data

## 🚀 Quick Migration

### Option 1: Automated Migration (Recommended)

1. **Run the migration script:**
   ```bash
   npm run db:migrate-to-postgres
   ```

2. **Update your .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/life_os_dev?schema=public"
   ```

3. **Test your application:**
   ```bash
   npm run dev
   ```

### Option 2: Manual Migration

1. **Export your SQLite data:**
   ```bash
   npm run db:export
   ```

2. **Start PostgreSQL:**
   ```bash
   npm run db:start
   ```

3. **Run migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

## 🔧 Configuration

### Environment Variables

Update your `.env` file with the PostgreSQL connection string:

```env
# Development (Docker)
DATABASE_URL="postgresql://postgres:password@localhost:5432/life_os_dev?schema=public"

# Production (Example with Supabase)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public&sslmode=require"
```

### Docker Compose Services

The `docker-compose.yml` file includes:

- **PostgreSQL 15**: Main database
- **PgAdmin**: Web-based database management tool

Access PgAdmin at: http://localhost:8080
- Email: `admin@lifeos.com`
- Password: `admin123`

## 📊 Database Schema Changes

### Key Improvements

1. **Better Table Names**: Using snake_case for PostgreSQL conventions
2. **Cascade Deletes**: Proper foreign key constraints
3. **UUID Support**: Native PostgreSQL UUID extension
4. **JSON Support**: Better handling of JSON fields
5. **Indexes**: Automatic index creation for better performance

### New Fields Added

- `Task.day`: For weekly planner (0-6, Monday-Sunday)
- `Task.startTime`: For weekly planner (HH:MM format)
- `Task.endTime`: For weekly planner (HH:MM format)

## 🛠️ Available Commands

```bash
# Database Management
npm run db:start          # Start PostgreSQL container
npm run db:stop           # Stop PostgreSQL container
npm run db:reset          # Reset database (removes all data)
npm run db:migrate        # Run Prisma migrations
npm run db:generate       # Generate Prisma client
npm run db:seed           # Seed database with initial data
npm run db:studio         # Open Prisma Studio
npm run db:export         # Export SQLite data
npm run db:migrate-to-postgres  # Full migration script
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Docker is running
   - Check if PostgreSQL container is started: `docker ps`

2. **Migration Errors**
   - Reset the database: `npm run db:reset`
   - Check Prisma schema syntax

3. **Data Loss**
   - Always backup your SQLite data before migration
   - Use the export script: `npm run db:export`

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove old SQLite database
rm prisma/dev.db

# Start fresh
npm run db:start
npm run db:migrate
npm run db:seed
```

## 🚀 Production Deployment

### Cloud Providers

1. **Supabase** (Recommended for Next.js)
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```

2. **Neon**
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

3. **Railway**
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
   ```

### Environment Variables for Production

```env
# Database
DATABASE_URL="your-production-postgresql-url"

# Next.js
NODE_ENV=production
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=https://yourdomain.com
```

## 📈 Performance Optimizations

### PostgreSQL Features

1. **JSON Operations**: Better performance for JSON fields
2. **Full-Text Search**: Built-in search capabilities
3. **Indexing**: Automatic index creation
4. **Connection Pooling**: Better connection management

### Recommended Settings

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set timezone
SET timezone = 'UTC';
```

## 🔒 Security Considerations

1. **Use Environment Variables**: Never hardcode database credentials
2. **SSL in Production**: Always use SSL for production connections
3. **Connection Pooling**: Use connection pooling for better performance
4. **Regular Backups**: Set up automated backups

## 📚 Additional Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)

## ✅ Migration Checklist

- [ ] Install PostgreSQL dependencies
- [ ] Update Prisma schema
- [ ] Create Docker Compose configuration
- [ ] Export SQLite data (backup)
- [ ] Start PostgreSQL container
- [ ] Run migrations
- [ ] Seed database
- [ ] Test application
- [ ] Update environment variables
- [ ] Remove old SQLite database
- [ ] Deploy to production

## 🎉 Migration Complete!

Your Life OS application is now running on PostgreSQL with:
- ✅ Better performance
- ✅ Improved scalability
- ✅ Enhanced features
- ✅ Production-ready setup

Happy coding! 🚀 