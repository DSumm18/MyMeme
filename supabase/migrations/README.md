# Supabase Migrations

This directory contains the database schema and migrations for the MyMeme application.

## Migration Files

### 001_initial_schema.sql
- Creates `profiles`, `albums`, and `creations` tables
- Sets up Row Level Security (RLS) policies for each table
- Creates `handle_new_user()` trigger to auto-create profiles on signup

### 002_add_user_credits.sql
- Creates `user_credits` table with atomic deduction/addition functions
- Implements `deduct_credits()` and `add_credits()` RPC functions
- Both functions use `SECURITY DEFINER` for transactional integrity
- Includes comprehensive RLS policies for secure access

## IMPORTANT MIGRATION CLEANUP

The following files contain duplicate migrations and should be **DELETED**:

- `001_mymeme_setup.sql` - DUPLICATE (creates user_credits in public schema)
- `001_user_credits.sql` - DUPLICATE (creates user_credits in mymeme schema)

These duplicates will cause schema conflicts if run. The proper migration is `002_add_user_credits.sql`.

## Running Migrations

Use Supabase CLI to apply migrations:

```bash
supabase migration up
```

Or manually in Supabase SQL Editor, run the files in order:
1. 001_initial_schema.sql
2. 002_add_user_credits.sql

## Key Security Considerations

### Atomic Transactions
- `deduct_credits()` uses `FOR UPDATE` to prevent race conditions
- All operations are atomic to prevent double-spend vulnerabilities

### Row Level Security (RLS)
- Users can only access their own data
- Service role has full access for webhook handlers
- All RPC functions use `SECURITY DEFINER` to bypass RLS safely

### Credit System
- Credits are decremented BEFORE any expensive operations
- Webhook handlers use service role for secure credit additions
- Failed operations log credit deductions for manual review
