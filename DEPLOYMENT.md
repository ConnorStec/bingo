# Bingo Party - Deployment Guide

This guide walks through deploying the Bingo Party app to Railway with a custom domain via AWS Route53.

## Prerequisites

- GitHub repository (private or public)
- Railway account (https://railway.app)
- AWS account with Route53 access
- Custom domain managed in Route53

## Deployment Steps

### 1. Set Up Railway Project

1. **Sign in to Railway**
   - Go to https://railway.app
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `bingo` repository
   - Railway will auto-detect the configuration from `nixpacks.toml`

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a PostgreSQL instance
   - The `DATABASE_URL` environment variable will be automatically set

### 2. Configure Environment Variables

In your Railway service settings, add these environment variables:

```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=https://your-domain.com
```

**Note:** Replace `your-domain.com` with your actual domain.

Railway automatically provides:
- `PORT` - The port your service should listen on
- `Postgres.DATABASE_URL` - Connection string for your database

### 3. Deploy the Application

1. **Trigger Deployment**
   - Railway will automatically deploy when you push to your main branch
   - Or click "Deploy" in the Railway dashboard

2. **Monitor Build**
   - Watch the build logs in the Railway dashboard
   - The build process will:
     - Install dependencies
     - Build frontend (React + Vite)
     - Build backend (NestJS)
     - Copy frontend into backend's public directory
     - Run database migrations
     - Start the server

3. **Verify Deployment**
   - Once deployed, Railway will provide a URL like `https://bingo-production.up.railway.app`
   - Visit the URL to verify the app is running

### 4. Set Up Custom Domain (AWS Route53)

#### Option A: Using Railway's Custom Domain Feature

1. **Add Domain in Railway**
   - In your service settings, go to "Settings" → "Domains"
   - Click "Custom Domain"
   - Enter your domain (e.g., `bingo.yourdomain.com`)
   - Railway will provide DNS records to add

2. **Configure Route53**
   - Go to AWS Route53 console
   - Select your hosted zone
   - Click "Create Record"
   - Add a CNAME record:
     - **Name:** `bingo` (or your subdomain)
     - **Type:** CNAME
     - **Value:** The value provided by Railway (e.g., `bingo-production.up.railway.app`)
     - **TTL:** 300 seconds

3. **Wait for DNS Propagation**
   - DNS changes can take 5-60 minutes
   - Use `dig bingo.yourdomain.com` to check DNS propagation
   - Railway will automatically provision an SSL certificate

#### Option B: Using CloudFlare (Recommended for Better Performance)

1. **Add Domain to CloudFlare**
   - Sign up at cloudflare.com
   - Add your domain
   - Update nameservers in Route53 to CloudFlare's nameservers

2. **Configure DNS in CloudFlare**
   - Add CNAME record pointing to Railway
   - Enable CloudFlare proxy (orange cloud)
   - SSL/TLS mode: Full (strict)

3. **Benefits**
   - DDoS protection
   - Global CDN
   - Better cache control
   - Web Application Firewall

### 5. Update Application Configuration

Once your custom domain is working, update the environment variable:

```
CORS_ORIGIN=https://bingo.yourdomain.com
```

Redeploy the application for changes to take effect.

### 6. Enable Auto-Deploy from GitHub

1. **In Railway Project Settings**
   - Go to "Settings" → "Service"
   - Ensure "Automatic Deployments" is enabled
   - Set branch to `main` (or your default branch)

2. **Test Auto-Deploy**
   - Push a change to your repository
   - Railway will automatically build and deploy

## Environment Variables Reference

### Production Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `${{PORT}}` | Auto-provided by Railway |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-provided by Railway |
| `CORS_ORIGIN` | `https://your-domain.com` | Your custom domain |

## Database Migrations

Migrations run automatically on each deployment (configured in `nixpacks.toml`).

To manually run migrations:
1. Go to Railway dashboard
2. Open your service
3. Click on "Deployments" → "View Logs"
4. Check for migration logs

## Troubleshooting

### Build Fails

**Check build logs** in Railway dashboard:
- Look for npm install errors
- Check TypeScript compilation errors
- Verify all dependencies are in package.json

### App Doesn't Load

1. **Check Service Logs**
   - Railway dashboard → Service → Logs
   - Look for startup errors

2. **Verify Environment Variables**
   - Ensure `DATABASE_URL` is set
   - Check `CORS_ORIGIN` matches your domain

3. **Check Database Connection**
   - Verify PostgreSQL service is running
   - Check database connection in logs

### WebSocket Issues

1. **Verify WebSocket Support**
   - Railway supports WebSockets by default
   - Check that Socket.IO is connecting properly in browser console

2. **Check CORS Settings**
   - Ensure CORS_ORIGIN includes your domain
   - WebSocket connections need proper CORS headers

### Custom Domain Not Working

1. **Check DNS Propagation**
   ```bash
   dig bingo.yourdomain.com
   nslookup bingo.yourdomain.com
   ```

2. **Verify CNAME Record**
   - Ensure CNAME points to Railway URL
   - Check TTL settings (lower = faster propagation)

3. **SSL Certificate Issues**
   - Railway auto-provisions SSL
   - Can take 5-15 minutes after DNS propagation
   - Check Railway logs for SSL errors

## Cost Estimation

**Railway Pricing:**
- **Free Tier:** $5 usage credit per month
- **Hobby Plan:** $5/month for additional usage

**Expected Monthly Cost for This App:**
- Database (PostgreSQL): ~$2-3
- Web Service: ~$1-2
- **Total:** ~$3-5/month (fits within free tier)

**AWS Route53:**
- Hosted Zone: $0.50/month
- DNS Queries: ~$0.40/month for 1M queries
- **Total:** ~$1/month

## Monitoring

### View Logs
```bash
# In Railway dashboard
Service → Logs → View deployment logs
```

### Check Service Health
- Railway provides automatic health checks
- Monitor uptime in the dashboard
- Set up email notifications for downtime

### Database Backups
- Railway automatically backs up PostgreSQL daily
- Backups retained for 7 days on free tier
- Can restore from backup in Railway dashboard

## Scaling

For larger games or more concurrent users:

1. **Upgrade Railway Plan**
   - Hobby: $5/month
   - Pro: $20/month (higher limits)

2. **Database Scaling**
   - Railway auto-scales PostgreSQL storage
   - Can upgrade to dedicated database if needed

3. **Monitor Performance**
   - Check Railway metrics dashboard
   - Monitor WebSocket connections
   - Watch database query performance

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use Railway's secret management
   - Rotate database credentials periodically

2. **CORS Configuration**
   - Only allow your domain in CORS_ORIGIN
   - Update when domain changes

3. **Database Security**
   - Railway PostgreSQL uses SSL by default
   - Database is not publicly accessible
   - Only accessible from Railway services

## Updating the Application

1. **Make Changes Locally**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Railway Auto-Deploys**
   - Watches your main branch
   - Automatically builds and deploys
   - Zero-downtime deployments

3. **Rollback if Needed**
   - Railway dashboard → Deployments
   - Click on previous deployment → "Redeploy"

## Custom Domain with SSL

Railway automatically provisions SSL certificates via Let's Encrypt:
- Free SSL certificate
- Auto-renewal
- HTTPS enforced
- HTTP automatically redirects to HTTPS

Your app will be accessible at:
- `https://bingo.yourdomain.com`

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **AWS Route53 Docs:** https://docs.aws.amazon.com/route53/

---

## Quick Reference Commands

```bash
# Check DNS propagation
dig bingo.yourdomain.com

# Test WebSocket connection
curl -I -H "Upgrade: websocket" https://bingo.yourdomain.com

# View Railway logs (CLI)
railway logs

# Connect to Railway PostgreSQL (CLI)
railway connect postgres
```

## Post-Deployment Checklist

- [ ] Railway project created and deployed
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] Custom domain added in Railway
- [ ] CNAME record added in Route53
- [ ] DNS propagated and domain accessible
- [ ] SSL certificate provisioned
- [ ] CORS_ORIGIN updated with custom domain
- [ ] Auto-deploy from GitHub enabled
- [ ] Test creating a room
- [ ] Test joining a game
- [ ] Test marking spaces (WebSockets working)
- [ ] Test on mobile devices
- [ ] Share link with family!
