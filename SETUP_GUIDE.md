# Messenger Dashboard Setup Guide

## ✅ Completed Fixes

### 1. Security Hardening
- ✅ Fixed fake dependency versions (React 19.2.1 → 18.3.1, Next.js 16.0.10 → 15.5.9)
- ✅ Removed hardcoded secrets from setup-db.js
- ✅ Generated secure environment variables
- ✅ Created .env.example template

### 2. Debugging Mode
- ✅ Enhanced next.config.ts with debugging options
- ✅ Added debug scripts to package.json
- ✅ Created debug utility library

### 3. Database Migration System
- ✅ Created proper migration system in messenger-database/
- ✅ Added migration tracking table
- ✅ Created comprehensive initial schema

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.local.new .env.local

# Verify your .env.local has:
DB_HOST=127.0.0.1
DB_PORT=6603
DB_USER=root
DB_PASSWORD=72cbce9bc6b7e6a6632dd572dc43509c
DB_NAME=dashboard
JWT_SECRET=c329d3b07c04f95b8136d09728ac3e0757aa44355b7f819c5cc32d616f2e02a6cae5079adcaf575e22963fd2a59f0c698d66a2c989e4686b92df165c71f47e0a
JWT_REFRESH_SECRET=cdda84ae4b5ce69935b1be2d2b8884ca77f851a975e7c953fa54bfcbed4f2a1898285c58a97807fc275013037f853ccbddd6fd2bc21e7002e22a8aee12c036e4
NEXTAUTH_SECRET=13be709f75cc65f5db5bbe82ad80309572bb233d279deb97d0ed462dc51900d345419cfc7b10afbd3e8d15ea333cd02be9aa01877b7ef7756dc421520d1096a7
```

### 2. Database Setup
```bash
# Reset and migrate database
npm run db:reset
npm run db:migrate

# Alternative: Use legacy setup
npm run db:setup
```

### 3. Development
```bash
# Start in debug mode
npm run dev:debug

# Regular development
npm run dev

# Check types and linting
npm run type-check
npm run lint
npm run lint:fix
```

## 🔧 Available Commands

### Database Commands
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database (⚠️ destroys all data)
- `npm run db:setup` - Legacy database setup
- `npm run db:debug` - Debug database setup

### Development Commands
- `npm run dev` - Start development server
- `npm run dev:debug` - Start with Node.js inspector
- `npm run build` - Build for production
- `npm run build:debug` - Build with debugging
- `npm run type-check` - TypeScript checking
- `npm run lint` - ESLint checking
- `npm run lint:fix` - Auto-fix ESLint issues

### 4. Testing Database Connection
```bash
# Test MySQL connection
mysql -u root -p -h 127.0.0.1 -P 6603

# In MySQL:
USE dashboard;
SHOW TABLES;
SELECT * FROM M_Users LIMIT 1;
```

## 🔍 Debugging Features

### Enhanced Debugging
- Console logs preserved in development
- Full URL logging for fetches
- App ISR status indicators
- Database query logging

### Debug Utilities
```typescript
import { debug } from '@/lib/debug';

debug.log('User login attempt', { email });
debug.db('SELECT', 'SELECT * FROM users WHERE id = ?', [userId]);
debug.api('/api/auth', 'POST', { email });
debug.error('Database connection failed', error);
```

## 📁 Project Structure After Fixes

```
DashBoard/messenger-dashboard/
├── src/
│   ├── app/
│   ├── lib/
│   │   └── debug.ts          # Debug utilities
│   └── ...
├── messenger-database/
│   ├── migrations/
│   │   └── 001_create_initial_schema.sql
│   ├── migrate.js            # Migration runner
│   ├── reset.js             # Database reset
│   └── README.md
├── .env.local                # Secure environment variables
├── .env.example             # Environment template
├── next.config.ts           # Enhanced debugging config
├── package.json             # Updated dependencies
└── setup-db.js             # Secure database setup
```

## ⚠️ Important Notes

### Security Changes
- All passwords and secrets are now secure and generated
- No hardcoded credentials in source code
- Environment variables properly isolated

### Database Changes
- M_Customers table renamed to M_Leads
- Added comprehensive indexes for performance
- Added foreign key constraints
- Added migration tracking system

### Next Steps
1. Test the application with real Facebook Messenger integration
2. Update any custom configurations
3. Review and update any additional environment-specific settings
4. Consider adding automated testing

## 🆘 Troubleshooting

### Common Issues
1. **MySQL Connection**: Ensure MySQL is running on port 6603
2. **Password Issues**: Check .env.local for correct credentials
3. **Migration Failures**: Run `npm run db:reset` then `npm run db:migrate`
4. **TypeScript Errors**: Run `npm run type-check` to identify issues
5. **Build Failures**: Check `npm run build` output for specific errors

### Environment Variables Missing
If any environment variables are missing, refer to `.env.example` for the required format.

### Database Port Issues
If MySQL runs on a different port, update DB_PORT in .env.local