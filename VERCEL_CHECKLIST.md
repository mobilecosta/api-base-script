# Vercel Deployment Checklist

This checklist ensures your API is properly configured for Vercel deployment.

## Pre-Deployment

### Local Testing
- [ ] Run `npm install` to verify all dependencies resolve
- [ ] Run `npm run build` to verify TypeScript compilation succeeds
- [ ] Run `npm start` to verify the compiled app starts correctly
- [ ] Test API endpoints locally with Swagger UI
- [ ] Verify `.env` file has all required variables set locally
- [ ] Check `npm run type-check` passes without errors

### Code Quality
- [ ] Verify no hardcoded localhost URLs (use environment variables)
- [ ] Ensure `PORT` environment variable is read correctly
- [ ] Check for any browser-specific code (should be none in backend)
- [ ] Verify error handling covers all edge cases
- [ ] Check logs don't expose sensitive information

### Repository
- [ ] Commit all changes to git
- [ ] Push to remote repository (GitHub/GitLab/Bitbucket)
- [ ] Ensure `.env` is in `.gitignore` (don't commit secrets)
- [ ] Verify `.vercelignore` is committed
- [ ] Verify `vercel.json` is committed

## Vercel Configuration

### Environment Variables
Set these in Vercel project settings (Settings → Environment Variables):
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- [ ] `JWT_SECRET` - Secret key for JWT signing (strong random string, 32+ chars)
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- [ ] `NODE_ENV` - Set to "production"

### Vercel Project Setup
- [ ] Create/select project in Vercel dashboard
- [ ] Connect GitHub/GitLab/Bitbucket repository
- [ ] Select `api-base-script` as root directory
- [ ] Framework: "Other" (already configured in vercel.json)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

## Deployment

### First Deployment
```bash
# Option 1: Via CLI
vercel login
cd api-base-script
vercel --prod

# Option 2: Via Dashboard
# Go to vercel.com → New → Select Git repo → Configure
```

### After First Deployment
- [ ] Verify deployment succeeded (green checkmark in Vercel)
- [ ] Check deployment logs for any errors
- [ ] Note your Vercel deployment URL (e.g., api-auth-xyz.vercel.app)

## Post-Deployment Verification

### Test API Endpoints
- [ ] Health check: `curl https://your-domain.vercel.app/api/auth/health`
- [ ] Swagger docs: Visit `https://your-domain.vercel.app/api-docs`
- [ ] Test register: POST `/api/auth/register`
- [ ] Test login: POST `/api/auth/login`
- [ ] Test protected endpoint: GET `/api/auth/profile` with Bearer token
- [ ] Verify CORS headers in response

### Database Connectivity
- [ ] Verify Supabase tables exist (run `database-setup.sql` if not)
- [ ] Test creating a user via API
- [ ] Verify user data appears in Supabase dashboard
- [ ] Check that RLS policies are working

### Error Handling
- [ ] Trigger error scenarios (invalid token, wrong password, etc.)
- [ ] Verify error messages are helpful but don't leak secrets
- [ ] Check Vercel logs for any unexpected errors

## Frontend Integration

### Update Frontend Configuration
In `front_base_poui/src/app/config/environment.ts`:
```typescript
api: {
  baseUrl: 'https://your-vercel-domain.vercel.app',
  endpoints: {
    auth: '/api/auth',
    users: '/api/users'
  }
}
```

### Test Frontend Connection
- [ ] Frontend can connect to API
- [ ] Login works end-to-end
- [ ] User data loads correctly
- [ ] Logout works properly

## Production Monitoring

### Vercel Dashboard
- [ ] Review Deployments tab for successful builds
- [ ] Check Function Duration in Monitoring tab
- [ ] Monitor Error Rates and Status Codes
- [ ] Review Analytics for request patterns

### Database Monitoring
- [ ] Check Supabase Usage and Quotas
- [ ] Monitor database performance
- [ ] Review authentication logs

### Error Tracking (Optional)
- [ ] Set up error logging service (Sentry, LogRocket, etc.)
- [ ] Configure alerts for failures

## Scaling & Optimization

### If Experiencing Issues
- [ ] Increase Vercel plan if hitting limits
- [ ] Optimize database queries in Supabase
- [ ] Consider caching strategies
- [ ] Review cold start times

### Custom Domain (Optional)
- [ ] In Vercel Settings → Domains, add custom domain
- [ ] Update DNS records as instructed
- [ ] Verify custom domain works
- [ ] Update frontend configuration with custom domain

## Security Checklist

- [ ] Never commit `.env` file to git
- [ ] All secrets stored in Vercel (not in code)
- [ ] JWT_SECRET is long and random (32+ characters)
- [ ] CORS is properly configured
- [ ] No console.log of sensitive data
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Headers are secure (CORS, X-Frame-Options, etc.)
- [ ] Rate limiting is in place if needed

## Rollback Plan

If deployment has issues:
```bash
# View previous deployments
vercel deployments

# Rollback to previous version
vercel rollback
```

Or via Vercel dashboard:
- Go to Deployments tab
- Click the previous successful deployment
- Click "Make Production"

## Documentation Updates

- [ ] Update README.md with Vercel deployment URL
- [ ] Document any custom configuration
- [ ] Create runbook for common issues
- [ ] Document monitoring and alerting setup

## Completion

- [ ] All items above are checked
- [ ] Deployment is stable
- [ ] Monitoring is in place
- [ ] Team is notified of deployment
- [ ] Documentation is updated

---

**Notes:** Document any issues encountered and how they were resolved for future reference.
