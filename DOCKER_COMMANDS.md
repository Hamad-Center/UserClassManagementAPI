# Docker Commands Reference
**User Class Management API - Phase 1**

## 🎯 **Answer: YES, the Docker convenience scripts are essential!**

As you discovered:
- ❌ `npx prisma db seed` (outside container) → Can't connect to `pg:5432`
- ✅ `docker-compose exec api npx prisma db seed` (inside container) → Works perfectly

## 🚀 **Updated Package.json Scripts**

### 🐳 Docker Database Commands (Use These!)
```bash
# Generate Prisma client (inside container)
npm run docker:db:generate

# Create and apply migration (inside container)  
npm run docker:db:migrate

# Seed database with test data (inside container)
npm run docker:db:seed

# Reset database (development only, inside container)
npm run docker:db:reset

# Open Prisma Studio (inside container)
npm run docker:db:studio

# Complete database setup (generate + migrate + seed)
npm run docker:db:init

# Complete project setup (env + docker + database)
npm run docker:setup
```

### 🏠 Local Database Commands (For Reference)
```bash
# These work only if PostgreSQL is running locally
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:reset
npm run db:studio
```

## 💡 **Why Docker Scripts Are Better**

| Aspect | Local Commands | Docker Commands |
|--------|----------------|-----------------|
| **Database Connection** | ❌ `localhost:5432` (fails) | ✅ `pg:5432` (works) |
| **Environment Consistency** | ❌ Depends on local setup | ✅ Guaranteed consistency |
| **Container Network** | ❌ Can't access Docker network | ✅ Native Docker network access |
| **Team Collaboration** | ❌ Different local setups | ✅ Same environment for everyone |

## 🔄 **Recommended Workflow**

### 1. Initial Setup
```bash
# One-time complete setup
npm run docker:setup
```

### 2. Daily Development
```bash
# Start infrastructure
npm run docker:up

# Run database operations as needed
npm run docker:db:migrate    # When schema changes
npm run docker:db:seed       # To refresh test data
npm run docker:db:studio     # To browse data

# Stop infrastructure
npm run docker:down
```

### 3. Database Schema Changes
```bash
# After modifying prisma/schema.prisma
npm run docker:db:migrate    # Creates and applies migration
npm run docker:db:seed       # Refreshes test data
```

## 📋 **Complete Command Reference**

### Infrastructure Management
```bash
npm run docker:up            # Start all services (PostgreSQL + Redis + API)
npm run docker:down          # Stop all services
npm run docker:logs          # View all logs
npm run docker:logs:api      # View API logs only
npm run docker:logs:db       # View PostgreSQL logs only
npm run docker:logs:redis    # View Redis logs only
npm run docker:clean         # Clean all data and volumes
npm run docker:rebuild       # Stop, clean, and rebuild everything
```

### Database Operations (Docker)
```bash
npm run docker:db:generate   # Generate Prisma client
npm run docker:db:migrate    # Create and apply migration
npm run docker:db:seed       # Populate with test data
npm run docker:db:reset      # Reset entire database
npm run docker:db:studio     # Open database browser
npm run docker:db:init       # Complete setup (generate + migrate + seed)
```

### Quick Setup Commands
```bash
npm run docker:setup         # Complete project setup
npm run setup:env           # Copy environment template
npm run setup               # Local setup (alternative)
```

## ✅ **Verification Steps**

After running your successful seed command:

```bash
# Test the seeded data
curl -s http://localhost:3000/users | jq
curl -s http://localhost:3000/classes | jq

# Verify user counts by role
curl -s "http://localhost:3000/users?role=ADMIN" | jq length
curl -s "http://localhost:3000/users?role=ENGINEER" | jq length  
curl -s "http://localhost:3000/users?role=INTERN" | jq length

# Test assignment endpoints
curl -s http://localhost:3000/classes/assignments/users/1 | jq
curl -s http://localhost:3000/classes/1/assignments | jq
```

## 🎯 **Summary**

**You absolutely need the Docker convenience scripts because:**

1. **Container Networking**: Only Docker commands can access the `pg:5432` database
2. **Consistency**: Everyone on your team uses the same environment
3. **Convenience**: `npm run docker:db:seed` vs `docker-compose exec api npx prisma db seed`
4. **Integration**: Scripts work seamlessly with the Docker infrastructure

**Your seeding was successful! You now have:**
- ✅ 10 users (3 ADMIN, 4 ENGINEER, 3 INTERN)
- ✅ 5 classes with capacity management
- ✅ 10 user-class assignments with realistic distribution
- ✅ Fully operational Phase 1 infrastructure

**Phase 1 is now 100% complete and ready for Phase 2!** 🎉 