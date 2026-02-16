# 🚀 Vercel Deployment - Quick Start

Deploy your Authentication API to Vercel in 5 minutes!

## ⚡ Ultra-Quick Start (3 steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd api-base-script
vercel --prod
```

Done! Your API is live. 🎉

---

## 📋 Complete Deployment Process

### Prerequisites
- ✅ Node.js installed
- ✅ Git repository created
- ✅ Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- ✅ Vercel account created

### Step-by-Step

#### 1. Verify Local Build Works
```bash
npm install
npm run build
npm start
```
Visit `http://localhost:3000` and `http://localhost:3000/api-docs` to verify.

#### 2. Create/Update vercel.json
```bash
# Already done! Check that these files exist:
ls vercel.json       # ✅ Exists
ls .vercelignore     # ✅ Exists
```

#### 3. Set Environment Variables in Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Create new project or select existing
3. Settings → Environment Variables
4. Add these variables:
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=your-key` (marked as Secret)
   - `JWT_SECRET=your-random-secret` (32+ chars, marked as Secret)
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`

**Option B: Via Vercel CLI**
```bash
vercel env add SUPABASE_URL
# Paste your value: https://your-project.supabase.co
# ✓ Environment variable added

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your value
# ✓ Environment variable added

vercel env add JWT_SECRET
# Paste your value (32+ random characters)
# ✓ Environment variable added
```

#### 4. Deploy to Production
```bash
vercel --prod
```

**Output should look like:**
```
✅ Production: https://your-api.vercel.app [in 2s]
```

#### 5. Test Your API
```bash
# Test health endpoint
curl https://your-api.vercel.app/api/auth/health

# View Swagger UI
https://your-api.vercel.app/api-docs
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Step 6: Update Frontend Configuration

In `front_base_poui/src/app/config/environment.ts`:

```typescript
export const environment = {
  api: {
    baseUrl: 'https://your-api.vercel.app',  // ← Update this
    endpoints: {
      auth: '/api/auth',
      users: '/api/users'
    }
  },
  // ... rest of config
};
```

Then test login and all features work!

---

## 🛠️ Using Helper Scripts

### Linux/Mac
```bash
chmod +x deploy.sh    # Make executable
./deploy.sh           # Run script
```

### Windows
```bash
deploy.bat            # Just run it
```

The script will:
1. Install dependencies if needed
2. Build TypeScript project
3. Ask if you want to deploy to preview or production
4. Handle the deployment

---

## 📊 Verifying Deployment

### 1. Check Status
```bash
vercel deployments
```

### 2. View Logs
```bash
vercel logs
```

### 3. Check Environment Variables
```bash
vercel env list
```

### 4. Test Endpoints

**Register User**
```bash
curl -X POST https://your-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123",
    "name":"John Doe"
  }'
```

**Login**
```bash
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123"
  }'
```

**Get Profile (use token from login response)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api.vercel.app/api/auth/profile
```

---

## ⚙️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` locally, then push to git |
| Build fails | Check build log: `vercel logs --follow` |
| 401 Unauthorized | Verify JWT_SECRET in environment variables |
| CORS errors | Check CORS configuration in src/index.ts |
| Timeout errors | Check Supabase connectivity |

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed troubleshooting.

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Secrets stored only in Vercel dashboard (not code)
- [ ] JWT_SECRET is long and random (32+ characters)
- [ ] SUPABASE_SERVICE_ROLE_KEY marked as secret
- [ ] Frontend domain configured in CORS if needed
- [ ] HTTPS is enabled (automatic with Vercel)

---

## 📈 Next Steps

1. ✅ Deploy API to Vercel
2. ✅ Update frontend configuration
3. ✅ Test end-to-end authentication flow
4. ⏭️ Monitor API performance in Vercel dashboard
5. ⏭️ Set up custom domain (optional)
6. ⏭️ Enable analytics and error tracking (optional)

---

## 📚 Full Documentation

- **Deployment Details:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Pre-Deployment Checklist:** [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md)
- **Environment Variables:** [.env.vercel](./.env.vercel)
- **Project README:** [README.md](./README.md)

---

## 💬 Need Help?

1. Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) troubleshooting section
2. View live logs: `vercel logs --follow`
3. Vercel docs: https://vercel.com/docs
4. Supabase docs: https://supabase.com/docs

---

**Your API will be live in minutes! 🚀**

Happy deploying! 🎉
