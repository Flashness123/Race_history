# 🚀 Migration Guide: Vercel + Railway + Supabase

This guide will help you migrate your Downhill Race History application from localhost to production with minimal changes.

## 📋 Prerequisites

- [x] Database exports ready (`database_full.sql`, `database_schema.sql`, `database_data.sql`)
- [x] Backend configuration updated for production
- [x] Railway deployment files created

## 🗄️ Phase 1: Database Migration (Supabase)

### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project name**: `downhill-race-history`
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing plan**: Free tier
4. Wait for project creation (2-3 minutes)

### Step 1.2: Get Connection Details
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

### Step 1.3: Import Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the contents of `database_schema.sql`
3. Click **Run** to create all tables and indexes

### Step 1.4: Import Data
1. In **SQL Editor**, copy and paste the contents of `database_data.sql`
2. Click **Run** to import all your data
3. Verify data import by checking table counts

### Step 1.5: Enable PostGIS Extension
```sql
-- Run this in SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

## 🚂 Phase 2: Backend Deployment (Railway)

### Step 2.1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2.2: Deploy Backend
1. Click **New Project** → **Deploy from GitHub repo**
2. Select your `Race_history` repository
3. Choose the `backend` folder as the root directory
4. Railway will automatically detect it's a Python project

### Step 2.3: Configure Environment Variables
In Railway dashboard, go to **Variables** and add:

```bash
DATABASE_URL=postgresql+psycopg://postgres:[YOUR_PASSWORD]@[SUPABASE_HOST]:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALG=HS256
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

### Step 2.4: Deploy
1. Railway will automatically deploy when you push to main branch
2. Or click **Deploy** in the dashboard
3. Wait for deployment to complete
4. Copy the generated URL (e.g., `https://your-app-name.railway.app`)

## 🌐 Phase 3: Frontend Deployment (Vercel)

### Step 3.1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3.2: Set Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_BASE=https://your-railway-app.railway.app
```

### Step 3.3: Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Copy the generated URL (e.g., `https://your-app.vercel.app`)

## 📁 Phase 4: Static Files Migration

### Option A: Supabase Storage (Recommended)
1. In Supabase dashboard, go to **Storage**
2. Create buckets:
   - `event-images`
   - `profile-images`
   - `submission-images`
3. Upload your static files from `backend/app/static/uploads/`
4. Update file URLs in your application

### Option B: Railway Static Files
1. Keep files in the backend
2. Update file serving configuration
3. Files will be served from Railway URL

## 🔧 Phase 5: Update Configuration

### Backend (Railway)
Update CORS_ORIGINS to include your Vercel domain:
```bash
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### Frontend (Vercel)
Update API base URL:
```bash
NEXT_PUBLIC_API_BASE=https://your-railway-app.railway.app
```

## ✅ Phase 6: Testing

### Test Checklist
- [ ] Database connection working
- [ ] User authentication working
- [ ] Race events loading on map
- [ ] Event submission working
- [ ] Admin dashboard accessible
- [ ] File uploads working
- [ ] Video functionality working
- [ ] All API endpoints responding

### Test URLs
- Frontend: `https://your-app.vercel.app`
- Backend Health: `https://your-railway-app.railway.app/health`
- API Docs: `https://your-railway-app.railway.app/docs`

## 🚨 Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS_ORIGINS environment variable
2. **Database connection**: Verify DATABASE_URL format
3. **File uploads**: Check file storage configuration
4. **Authentication**: Verify JWT_SECRET is set

### Rollback Plan
If anything goes wrong:
1. Keep your local setup running
2. Revert environment variables
3. Test locally first
4. Re-deploy with fixes

## 📊 Cost Estimation

### Free Tiers
- **Supabase**: 500MB database, 1GB bandwidth
- **Railway**: $5 credit monthly (usually enough for small apps)
- **Vercel**: 100GB bandwidth, unlimited static hosting

### Expected Monthly Cost
- **Small usage**: $0-5
- **Medium usage**: $5-15
- **High usage**: $15-30

## 🎉 Success!

Once everything is working:
1. Update your domain DNS (if using custom domain)
2. Set up monitoring and alerts
3. Configure backups
4. Document your production setup

---

**Need help?** Check the troubleshooting section or create an issue in your repository.
