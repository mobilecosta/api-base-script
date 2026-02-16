# Vercel Deployment Guide

This guide explains how to deploy the Authentication API to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- Vercel CLI installed (`npm i -g vercel`)
- Git repository initialized and pushed
- Supabase credentials

## Deployment Steps

### 1. Prepare Environment Variables

Before deploying, you need to configure environment variables in Vercel:

```bash
# Required variables for Vercel:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### 2. Deploy Using Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to the api-base-script directory
cd api-base-script

# Deploy to production
vercel --prod
```

### 3. Deploy Using Vercel Dashboard

Alternatively, deploy through the Vercel web interface:

1. Go to https://vercel.com/new
2. Import your GitHub/GitLab/Bitbucket repository
3. Select the `api-base-script` directory as the root directory
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Click "Deploy"

### 4. Configure Environment Variables in Vercel

After the first deployment:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add each variable you need (from .env.example)
4. Trigger a redeployment

## Vercel Configuration

The `vercel.json` file contains:

- **buildCommand**: Compiles TypeScript to JavaScript
- **devCommand**: Runs the development server locally
- **routes**: Maps all incoming requests to the Express server
- **env**: Default environment variables

## Post-Deployment

### 1. Test the API

```bash
# Get your Vercel deployment URL (e.g., https://api-auth-xyz.vercel.app)
# Test health endpoint
curl https://api-auth-xyz.vercel.app/api/auth/health

# Test Swagger documentation
https://api-auth-xyz.vercel.app/api-docs
```

### 2. Update Frontend Configuration

In your frontend application (`front_base_poui`), update the API URL:

**src/app/config/environment.ts:**
```typescript
export const environment = {
  api: {
    baseUrl: 'https://your-vercel-domain.vercel.app',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users'
    }
  },
  // ... rest of config
};
```

### 3. Enable Production Database

Ensure your Supabase database tables are created:

```bash
# Connect to Supabase and run the SQL setup script
# See database-setup.sql
```

## Troubleshooting

### Build Fails

If the build fails:

1. Ensure `build` script in `package.json` works locally:
   ```bash
   npm run build
   ```

2. Check that all dependencies are listed in `package.json`

3. Verify TypeScript compiles without errors:
   ```bash
   npx tsc --noEmit
   ```

### "Cannot find module" errors

- Ensure all imports use correct relative paths
- Check that `dist/` directory is created during build
- Verify `tsconfig.json` has correct `outDir` settings

### Environment Variables Not Loaded

1. Verify variables are set in Vercel dashboard
2. Restart the deployment after adding/updating variables
3. Check variable names match exactly (case-sensitive)

### CORS Issues

If frontend can't connect to API:

1. Check CORS configuration in `src/index.ts`
2. Verify the frontend domain is properly configured
3. Update CORS origin in `src/index.ts`:
   ```typescript
   app.use(cors({
     origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

### Database Connection Issues

1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
2. Ensure the Supabase project is accessible
3. Check network connectivity in Vercel's monitoring tab
4. Verify RLS policies allow the service role to access tables

## Vercel vs Local Development

| Aspect | Local | Vercel |
|--------|-------|--------|
| PORT | 3000 | Auto-assigned |
| Environment | development | production |
| Database | Local Supabase | Cloud Supabase |
| Logs | Terminal | Vercel Logs |
| Secrets | .env file | Vercel dashboard |

## Monitoring

### View Deployment Logs

```bash
# Using Vercel CLI
vercel logs

# Or view in Vercel dashboard:
# Project → Deployments → Select deployment → Logs
```

### Monitor API Performance

- Go to Vercel dashboard → Project → Monitoring
- Check function duration and cold starts
- Monitor error rates and status codes

## Custom Domain

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records according to Vercel's instructions
4. Update frontend configuration with the new domain

## Scaling & Limits

Vercel's default Node.js environment:
- Max function runtime: 60 seconds (Free plan) / 900 seconds (Pro)
- Cold start: ~1-2 seconds
- Memory: 1024 MB
- Concurrent executions: Unlimited

For high-traffic applications, consider upgrading your Vercel plan.

## Cost Estimation

- **Free tier**: 100 GB bandwidth/month, limited builds
- **Pro tier**: $20/month + usage (recommended for production)

## Next Steps

1. Deploy to Vercel
2. Update frontend `environment.ts` with Vercel API URL
3. Test authentication flow end-to-end
4. Configure custom domain (optional)
5. Monitor logs and performance

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Express.js Documentation: https://expressjs.com
