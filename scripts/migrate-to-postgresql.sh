#!/bin/bash

# Life OS - SQLite to PostgreSQL Migration Script
# This script helps migrate from SQLite to PostgreSQL

set -e

echo "🚀 Starting SQLite to PostgreSQL migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from example..."
    cp .env.example .env
    print_warning "Please update .env file with your database credentials before continuing."
    exit 1
fi

# Start PostgreSQL container
print_status "Starting PostgreSQL container..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U postgres; do
    sleep 2
done

print_success "PostgreSQL is ready!"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Seed the database
print_status "Seeding the database..."
npx prisma db seed

print_success "Migration completed successfully!"
print_status "Your PostgreSQL database is ready at: postgresql://postgres:password@localhost:5432/life_os_dev"
print_status "PgAdmin is available at: http://localhost:8080 (admin@lifeos.com / admin123)"

echo ""
print_status "Next steps:"
echo "1. Update your .env file with the PostgreSQL connection string"
echo "2. Test your application"
echo "3. Remove the old SQLite database file (prisma/dev.db) if everything works"
echo ""
print_warning "Don't forget to backup your SQLite data before removing it!" 