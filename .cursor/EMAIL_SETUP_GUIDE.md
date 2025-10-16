# Email Setup Guide - Resend API

## 🚨 Issue: Emails Not Being Sent

Your application uses **Resend API** to send emails, not Supabase's built-in email system.

**Current Problem:** The `RESEND_API_KEY` environment variable is missing or not configured.

---

## 📧 What is Resend?

[Resend](https://resend.com) is a modern email API designed for developers. It's:
- ✅ Easy to set up
- ✅ Free tier: 100 emails/day, 3,000 emails/month
- ✅ Better deliverability than SMTP
- ✅ Simple API

---

## 🔧 Setup Steps

### **Step 1: Create a Resend Account**

1. Go to https://resend.com
2. Click **"Sign Up"** (free)
3. Sign up with your email or GitHub
4. Verify your email address

---

### **Step 2: Get Your API Key**

1. Once logged in, go to **"API Keys"** in the dashboard
2. Click **"Create API Key"**
3. Name it: `jewelry-store-production` (or any name)
4. **Copy the API key** (starts with `re_`)
   - ⚠️ **Important:** You can only see it once! Save it now.

**Example API Key:**
```
re_123456789abcdefghijklmnop
```

---

### **Step 3: Add API Key to Your Project**

#### **Option A: Local Development (.env.local)**

1. Open or create `.env.local` in your project root
2. Add this line:

```bash
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
```

**Example:**
```bash
RESEND_API_KEY=re_123456789abcdefghijklmnop
```

3. Restart your Next.js dev server:
```bash
npm run dev
```

---

#### **Option B: Production (Vercel)**

If you're deployed on Vercel:

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_YOUR_ACTUAL_API_KEY_HERE`
   - **Environments:** Production, Preview, Development
5. Click **"Save"**
6. **Redeploy** your application

---

### **Step 4: Verify Domain (Optional but Recommended)**

For production use, verify your domain to send from your own email address:

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `eternajewels.com`
4. Add the DNS records shown (DKIM, SPF, DMARC)
5. Wait for verification (can take a few hours)

**Before verification:**
- Sends from: `onboarding@resend.dev`
- Limited to 100 emails/day

**After verification:**
- Sends from: `orders@eternajewels.com` (your domain)
- Full quota: 3,000 emails/month

---

### **Step 5: Test Email Sending**

Create a test API route to verify emails work:

**File:** `src/app/api/test-email/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: 'your-email@example.com', // ← Change to your email
        subject: 'Test Email from Jewelry Store',
        html: '<h1>✅ Email is working!</h1><p>Your Resend API is configured correctly.</p>',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send email', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
}
```

Then visit: `http://localhost:3002/api/test-email`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "email-id-here"
  }
}
```

**Check your inbox!** You should receive the test email.

---

## 🔍 Troubleshooting

### **Issue 1: "Authorization header is missing"**

**Error:**
```
Failed to send email: {"statusCode":401,"message":"Authorization header is missing"}
```

**Solution:**
- ❌ `RESEND_API_KEY` is not set
- Check `.env.local` file exists
- Restart your dev server
- Make sure the file is in the project root (next to `package.json`)

---

### **Issue 2: "API key is invalid"**

**Error:**
```
Failed to send email: {"statusCode":401,"message":"API key is invalid"}
```

**Solution:**
- ❌ Wrong API key format
- Make sure it starts with `re_`
- Copy the key again from Resend dashboard
- No extra spaces or quotes

---

### **Issue 3: "Domain not found"**

**Error:**
```
Failed to send email: {"statusCode":404,"message":"Domain not found"}
```

**Solution:**
- You're trying to send from `orders@eternajewels.com` but domain isn't verified
- **Quick fix:** Change the "from" address in `src/lib/email.ts`:

```typescript
// Change this:
from: 'Eterna Jewels <orders@eternajewels.com>',

// To this (for testing):
from: 'Eterna Jewels <onboarding@resend.dev>',
```

---

### **Issue 4: Emails not appearing in inbox**

**Check:**
1. ✅ Check **spam folder**
2. ✅ Verify email address is correct
3. ✅ Check Resend dashboard logs
4. ✅ Wait 1-2 minutes (can be delayed)

---

## 📂 Files to Update

### **1. Environment Variables (.env.local)**

```bash
# Resend API Key (for sending emails)
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE

# Other existing variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

---

### **2. Email Configuration (src/lib/email.ts)**

**Current configuration:**
```typescript
from: 'Eterna Jewels <orders@eternajewels.com>',
```

**For testing (before domain verification):**
```typescript
from: 'Eterna Jewels <onboarding@resend.dev>',
```

**After domain verification:**
```typescript
from: 'Eterna Jewels <orders@eternajewels.com>',
```

---

## 🎯 Email Flow in Your Application

### **1. Order Placed Email**

**Trigger:** Customer completes checkout
**File:** `src/app/api/orders/route.ts`
**Template:** `templates/email/order-placed.html`
**Subject:** `Order Received - #ABC123`

**Content:**
- Order number
- Items purchased
- Total amount
- Payment method
- Shipping address
- Next steps

---

### **2. Order Confirmed Email**

**Trigger:** Admin clicks "Confirm Order"
**File:** `src/app/api/admin/orders/[id]/confirm/route.ts`
**Template:** `templates/email/order-confirmed.html`
**Subject:** `Your Order is Confirmed! 🎉`

**Content:**
- Order number
- Estimated delivery date (5 business days)
- Tracking information
- Order progress timeline

---

### **3. Payment Verified Email**

**Trigger:** Admin clicks "Verify Payment" (bank transfer only)
**File:** `src/app/api/admin/orders/[id]/verify-payment/route.ts`
**Template:** `templates/email/payment-verified.html`
**Subject:** `Payment Verified ✓`

**Content:**
- Order number
- Payment amount
- Payment status
- Next steps

---

## 💰 Resend Pricing

### **Free Tier:**
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ Perfect for starting out
- ✅ No credit card required

### **Paid Plans (if you need more):**
- **$20/month:** 50,000 emails/month
- **$80/month:** 100,000 emails/month
- Custom plans available

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env.local` to git**
   - Already in `.gitignore`
   
2. ✅ **Use environment variables for API keys**
   - Never hardcode keys in code
   
3. ✅ **Regenerate API keys if exposed**
   - Go to Resend dashboard → API Keys → Regenerate
   
4. ✅ **Use different keys for dev/prod**
   - Development key for local testing
   - Production key for live site

---

## 📊 Monitoring Emails

### **Resend Dashboard:**

1. Go to https://resend.com/emails
2. See all sent emails
3. Check delivery status
4. View email content
5. Debug failed emails

**Status Types:**
- ✅ **Delivered** - Email successfully delivered
- ⏳ **Pending** - Email being processed
- ❌ **Failed** - Email delivery failed
- 📧 **Opened** - Recipient opened email (if tracking enabled)

---

## 🚀 Quick Start Checklist

- [ ] Create Resend account at https://resend.com
- [ ] Get API key from dashboard
- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Restart Next.js dev server
- [ ] Test email with `/api/test-email` route
- [ ] Place a test order to verify order emails
- [ ] (Optional) Verify your domain for production

---

## 🔗 Useful Links

- **Resend Dashboard:** https://resend.com/emails
- **Resend Documentation:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Status Page:** https://status.resend.com

---

## 🆘 Still Not Working?

### **Check Environment Variable is Loaded:**

Add this to any API route:

```typescript
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌');
```

### **Enable Debug Logging:**

In `src/lib/email.ts`, add:

```typescript
console.log('Sending email to:', data.customerEmail);
console.log('API Key exists:', !!process.env.RESEND_API_KEY);

const response = await fetch('https://api.resend.com/emails', {
  // ... existing code
});

console.log('Response status:', response.status);
console.log('Response body:', await response.text());
```

### **Check Server Logs:**

When you place an order, check your terminal for:
```
Failed to send order placed email: [error message here]
```

This will tell you exactly what's wrong.

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team

