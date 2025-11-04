# Database Migration Changes: Users → Profiles

## 🔄 Table Rename

**Changed**: `users` → `profiles`

## 📋 Key Changes Made

### 1. Table Structure Update
- **Before**: `users` table with auth fields
- **After**: `profiles` table linked to Supabase auth

### 2. Schema Updates

#### Profiles Table
```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull(), // Foreign key to Supabase auth.users.id
  username: varchar('username', { length: 100 }).unique().notNull(),
  // ... rest of profile fields
});
```

#### Foreign Key Updates
- `flags.userId` → `flags.profileId`
- `offers.senderId` → `offers.senderId` (references profiles)
- `offers.receiverId` → `offers.receiverId` (references profiles)
- `matches.userAId` → `matches.userAId` (references profiles)
- `matches.userBId` → `matches.userBId` (references profiles)
- `reviews.authorId` → `reviews.authorId` (references profiles)
- `reviews.targetId` → `reviews.targetId` (references profiles)

### 3. Zod Schemas
- `insertUserSchema` → `insertProfileSchema`
- `selectUserSchema` → `selectProfileSchema`

## 🔗 Supabase Integration

### Authentication Flow
1. **Supabase Auth**: Handles email/password, OAuth, session management
2. **Profiles Table**: Extended user data (Focus score, preferences, etc.)
3. **Link**: `profiles.userId` → `auth.users.id`

### Benefits
- ✅ No table name conflicts with Supabase auth
- ✅ Clean separation of auth vs profile data
- ✅ Can work with multiple auth providers
- ✅ Maintains all existing CoSnap functionality

## 🚀 Migration Steps

When ready to deploy:

1. **Generate migration**: `npm run db:generate`
2. **Review migration**: Check SQL for changes
3. **Apply migration**: `npm run db:migrate`

## 📄 Files Updated

- `app/db/schema.ts` - Main schema file
- `app/db/README.md` - Documentation updated