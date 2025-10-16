# 🚨 URGENT: Setup Required for Email Sending

## Problem: Emails Not Being Sent

Your `.env.local` file is **missing** the `RESEND_API_KEY` variable, which is why no emails are being sent.

---

## 🔧 Quick Fix (5 minutes)

### **Step 1: Get Resend API Key**

1. Go to https://resend.com
2. Sign up (it's **FREE** - 100 emails/day)
3. After login, go to **"API Keys"** tab
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)

---

### **Step 2: Add to .env.local File**

1. Open `.env.local` in your project root
2. Add this line at the end:

```bash
# Resend API Key (for sending emails)
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE
```

**Your complete `.env.local` should look like this:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jjnzylvhvksigqlcapbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqbnp5bHZodmtzaWdxbGNhcGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjM5MzMsImV4cCI6MjA3MjgzOTkzM30.XrVXlQznyB-yD87W2GT3XZeVJ03RX3GGaRxgc39pIjQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqbnp5bHZodmtzaWdxbGNhcGJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI2MzkzMywiZXhwIjoyMDcyODM5OTMzfQ.O6N9bsqYN9T5-LldxAh-xQJW9HOtQ1_4QqCGhw4RyUo

# Resend API Key (for sending emails)
RESEND_API_KEY=re_abc123xyz789  # ← Replace with your actual key

# Next.js Configuration (Optional - for future features)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

NEXT_PUBLIC_ADMIN_EMAIL='eternajewels.store@gmail.com'
NEXT_PUBLIC_ADMIN_PASSWORD='Ramuja007'
```

---

### **Step 3: Restart Your Dev Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **Step 4: Test Email Sending**

Place a test order and check if the email is sent.

**Expected behavior:**
- ✅ Order confirmation email sent to customer
- ✅ Check your email inbox (and spam folder)
- ✅ Email should arrive within 1-2 minutes

---

## 📧 What Emails Will Be Sent?

Once configured, these emails will be sent automatically:

1. **Order Placed Email**
   - Sent when: Customer completes checkout
   - To: Customer email
   - Subject: "Order Received - #ABC123"

2. **Order Confirmed Email**
   - Sent when: Admin clicks "Confirm Order"
   - To: Customer email
   - Subject: "Your Order is Confirmed! 🎉"

3. **Payment Verified Email**
   - Sent when: Admin clicks "Verify Payment"
   - To: Customer email
   - Subject: "Payment Verified ✓"

---

## 🔍 Troubleshooting

### **Still not working?**

Check terminal logs when placing an order. You should see:

**Before fix:**
```
Failed to send order placed email: Authorization header is missing
```

**After fix:**
```
(No error - email sent successfully)
```

---

### **Want to use a different email service?**

If you prefer to use:
- **Gmail SMTP**
- **SendGrid**
- **Mailgun**
- **Your own SMTP server**

You'll need to update `src/lib/email.ts` to use that service instead of Resend.

But **Resend is recommended** because:
- ✅ Easiest to set up
- ✅ Free tier is generous
- ✅ Better deliverability
- ✅ Modern API

---

## 💰 Resend Pricing

**Free Tier:**
- 100 emails per day
- 3,000 emails per month
- No credit card required
- Perfect for starting out

**Paid (if you need more):**
- $20/month: 50,000 emails
- $80/month: 100,000 emails

---

## 📚 Full Documentation

See `.cursor/EMAIL_SETUP_GUIDE.md` for complete setup instructions, including:
- Domain verification
- Sending from your own domain
- Monitoring email delivery
- Security best practices

---

**Need help?** Check the logs or reach out to support!

---

**Last Updated**: October 16, 2025

