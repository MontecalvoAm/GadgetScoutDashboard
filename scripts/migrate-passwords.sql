-- Database Migration Script for Phase 1 Security Hardening
-- This script updates the database schema to support password hashing

-- Step 1: Add PasswordHash column to M_Users table
ALTER TABLE M_Users ADD COLUMN PasswordHash VARCHAR(255) NULL AFTER Password;

-- Step 2: If Password column exists and has data, we'll need to handle migration
-- For new installations, we can drop the old Password column
-- For existing data, we'll need to update PasswordHash with hashed passwords

-- Step 3: Update existing records (if any) - This requires manual handling
-- WARNING: This will require users to reset their passwords
-- UPDATE M_Users SET PasswordHash = [hashed_version_of_existing_passwords] WHERE Password IS NOT NULL;

-- Step 4: Make PasswordHash NOT NULL after migration
-- ALTER TABLE M_Users MODIFY PasswordHash VARCHAR(255) NOT NULL;

-- Step 5: Drop old Password column after successful migration
-- ALTER TABLE M_Users DROP COLUMN Password;

-- Step 6: Ensure RoleName column exists in M_Roles (for registration fix)
-- This should already exist, but just in case:
-- ALTER TABLE M_Roles ADD COLUMN RoleName VARCHAR(50) NOT NULL UNIQUE;

-- Step 7: Verify data integrity
SELECT
    COUNT(*) as total_users,
    COUNT(PasswordHash) as users_with_hash,
    COUNT(Password) as users_with_plaintext
FROM M_Users;

-- Step 8: Test query for new authentication system
SELECT ID, Firstname, LastName, Email, PasswordHash, RoleID
FROM M_Users
WHERE Email = 'test@example.com' AND IsActive = 1;