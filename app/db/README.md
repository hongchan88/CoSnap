# Database Setup with Drizzle ORM

## 📋 Overview

This directory contains the Drizzle ORM configuration and database schema for the CoSnap application.

## 🗄️ Database Schema

Based on the CoSnap data model, we have the following tables:

- **profiles**: Extended user profile data (separate from Supabase auth users table)
  - Linked to Supabase auth.users via userId foreign key
  - Contains Focus scores, roles, camera gear, preferences, etc.
- **flags**: Travel plans and visibility settings
- **offers**: Communication between users for potential matches
- **matches**: Confirmed CoSnap meetings between users
- **reviews**: Feedback after completed matches

## 🛠️ Available Scripts

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to the database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 📁 File Structure

```
app/db/
├── schema.ts      # Database table definitions
├── db.ts          # Database connection and client
├── migrations/    # Generated migration files
└── README.md      # This file
```

## 🔧 Configuration

- **drizzle.config.ts**: Drizzle Kit configuration
- **.env**: Database connection string (create from .env.example)

## 📦 Dependencies

- `drizzle-orm`: Core ORM functionality
- `postgres`: PostgreSQL driver
- `drizzle-kit`: CLI tools for migrations and studio
- `drizzle-zod`: Schema validation with Zod
- `zod`: Runtime type validation

## 🚀 Getting Started

1. Set up your PostgreSQL database
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`
3. Run `npm run db:generate` to create initial migrations
4. Run `npm run db:migrate` to apply migrations to your database
5. Run `npm run db:studio` to explore your database with the GUI