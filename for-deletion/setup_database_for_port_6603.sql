-- SETUP DATABASE WITH YOUR PORT 6603 CONFIGURATION
-- Run these commands in SQLYog to set up everything

-- Step 1: Create and use your database
CREATE DATABASE IF NOT EXISTS dashboard;
USE dashboard;

-- Step 2: Run the CREATE TABLE statements from dashboard_schema_create_tables.sql
-- You can copy/paste each CREATE TABLE query or run the entire file

-- Step 3: Update all table creation to use the dashboard database

-- After running the CREATE TABLE statements, test with:
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'dashboard';
SHOW TABLES IN dashboard;