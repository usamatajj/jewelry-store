# Deployment Guide - Jewelry Store

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Prepare Environment Variables

Create these environment variables in Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourstore.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your repository** `usamatajj/jewelry-store`
5. **Configure project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
6. **Add Environment Variables** (from Step 1)
7. **Click Deploy**

### Step 3: Update Supabase Settings

After deployment, update your Supabase project:

1. **Go to Supabase Dashboard** → Authentication → URL Configuration
2. **Add your Vercel domain** to:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/auth/callback`

### Step 4: Update Email Templates

Update your email templates with the production URL:

1. **Go to Supabase** → Authentication → Email Templates
2. **Update confirmation URLs** to use your Vercel domain
3. **Test email functionality**

## 🔧 Alternative Deployment Options

### Netlify

- Similar to Vercel but better for static sites
- Free tier: 100GB bandwidth/month
- Good for learning and small projects

### Railway

- Full-stack deployment
- Free tier: $5 credit/month
- Good for learning with databases

### Render

- Free tier available
- Good for backend services
- PostgreSQL database included

## 📊 Scaling Strategy

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth
- **Resend**: 3,000 emails/month

### When to Upgrade

**Vercel Pro ($20/month)** when you need:

- More bandwidth
- Team collaboration
- Advanced analytics
- Custom domains

**Supabase Pro ($25/month)** when you need:

- Larger database
- More bandwidth
- Advanced features

## 🛡️ Production Checklist

### Before Going Live

- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Test all functionality
- [ ] Set up backup strategy
- [ ] Configure error tracking

### Security

- [ ] Use strong admin passwords
- [ ] Enable RLS policies in Supabase
- [ ] Set up rate limiting
- [ ] Monitor for suspicious activity

### Performance

- [ ] Optimize images
- [ ] Enable caching
- [ ] Monitor Core Web Vitals
- [ ] Set up CDN if needed

## 🔍 Monitoring & Analytics

### Vercel Analytics

- Built-in performance monitoring
- Core Web Vitals tracking
- Real user monitoring

### Supabase Dashboard

- Database performance
- API usage
- Authentication metrics

### Custom Analytics

- Google Analytics
- Mixpanel
- Hotjar for user behavior

## 💰 Cost Breakdown (Monthly)

### Free Tier

- Vercel: $0 (100GB bandwidth)
- Supabase: $0 (500MB database)
- Resend: $0 (3,000 emails)
- **Total: $0**

### Small Business (1K-10K visitors)

- Vercel Pro: $20
- Supabase Pro: $25
- Resend: $20
- **Total: ~$65/month**

### Growing Business (10K+ visitors)

- Vercel Enterprise: $400+
- Supabase Enterprise: $599+
- Resend: $80+
- **Total: ~$1,000+/month**

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   - Check environment variables
   - Verify all dependencies
   - Check build logs

2. **Authentication Issues**

   - Verify Supabase URL configuration
   - Check redirect URLs
   - Test in incognito mode

3. **Email Not Working**
   - Verify Resend API key
   - Check email template configuration
   - Test with different email providers

### Support Resources

- Vercel Documentation
- Supabase Documentation
- Next.js Deployment Guide
- GitHub Issues for specific problems

## 📈 Next Steps After Deployment

1. **Set up monitoring** and alerts
2. **Configure backups** for database
3. **Set up staging environment** for testing
4. **Implement CI/CD** for automated deployments
5. **Add error tracking** (Sentry, Bugsnag)
6. **Set up logging** for debugging
7. **Create maintenance procedures**
