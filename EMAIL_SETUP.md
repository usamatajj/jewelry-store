# 📧 Email Setup Guide

Your app uses **Resend** to send order confirmation emails directly from Next.js API routes.

---

## ✅ **Current Status**

- ✅ Resend integrated in `src/lib/email.ts`
- ✅ Email templates in `templates/email/`
- ✅ API routes configured to send emails
- ✅ All code ready to work

---

## 🔑 **What You Need**

Just **one thing**: Your Resend API key in `.env.local`

```bash
RESEND_API_KEY=re_your_key_here
```

---

## 📝 **How to Get Resend API Key**

1. Go to: **https://resend.com/signup**
2. Sign up with your client's email
3. Go to: **https://resend.com/api-keys**
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)
6. Add it to `.env.local`:
   ```bash
   RESEND_API_KEY=re_abc123xyz...
   ```

---

## 🧪 **Testing (Important!)**

### **For Development/Testing:**

Resend's free tier only sends emails to:
- ✅ The email you used to sign up
- ✅ Verified domains (requires DNS setup)

**Current behavior:**
- All test emails go to: `eternajewels.store@gmail.com`
- See lines 146-148 in `src/lib/email.ts`

**To test with a different email:**
1. Update line 146 in `src/lib/email.ts`:
   ```typescript
   const testEmail = process.env.RESEND_TEST_EMAIL || 'your-email@example.com';
   ```
2. Or add to `.env.local`:
   ```bash
   RESEND_TEST_EMAIL=your-email@example.com
   ```

---

## 🚀 **For Production**

### **Option 1: Verify Your Domain (Recommended)**

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Add your domain (e.g., `eternajewels.com`)
4. Add the DNS records shown by Resend to your domain
5. Wait for verification (usually 24-48 hours)
6. Update `src/lib/email.ts` line 159:
   ```typescript
   from: 'Eterna Jewels <noreply@eternajewels.com>',
   ```

### **Option 2: Keep Test Mode**

If you don't have a domain yet:
- Keep using `onboarding@resend.dev` as sender
- All emails will go to the test email address
- Good enough for initial launch!

---

## 📧 **How It Works**

### **1. Customer Places Order**
```
Customer submits checkout
    ↓
POST /api/orders
    ↓
src/lib/email.ts → sendOrderPlacedEmail()
    ↓
Resend API
    ↓
Customer receives "Order Received" email ✉️
```

### **2. Admin Confirms Order**
```
Admin clicks "Confirm Order"
    ↓
POST /api/admin/orders/[id]/confirm
    ↓
src/lib/email.ts → sendOrderConfirmedEmail()
    ↓
Customer receives "Order Confirmed" email ✉️
```

### **3. Admin Verifies Payment**
```
Admin clicks "Verify Payment"
    ↓
POST /api/admin/orders/[id]/verify-payment
    ↓
src/lib/email.ts → sendPaymentVerifiedEmail()
    ↓
Customer receives "Payment Verified" email ✉️
```

---

## 🔍 **Troubleshooting**

### **"Emails not sending"**

1. **Check API key exists:**
   ```bash
   echo $RESEND_API_KEY
   ```
   Should show: `re_...`

2. **Check terminal logs** when placing an order:
   ```
   📧 Attempting to send order placed email...
   📧 Recipient: customer@example.com
   📧 Response status: 200
   ✅ Email sent successfully!
   ```

3. **Restart dev server** after adding `.env.local`:
   ```bash
   # Press Ctrl+C
   npm run dev
   ```

---

### **"403 Forbidden from Resend"**

This means you're trying to send to an email that's not verified.

**Solution:** Change the test email in `src/lib/email.ts` line 146 to the email you used to sign up for Resend.

---

### **"Email goes to spam"**

Common in development. For production:
- ✅ Verify your domain
- ✅ Set up SPF and DKIM records (Resend provides these)
- ✅ Use a professional `from` address

---

## 📂 **File Structure**

```
src/
  lib/
    email.ts                    # Main email sending logic
  app/
    api/
      orders/
        route.ts                # Sends "Order Placed" email
      admin/
        orders/
          [id]/
            confirm/route.ts    # Sends "Order Confirmed" email
            verify-payment/route.ts  # Sends "Payment Verified" email

templates/
  email/
    order-placed.html           # Order placed template
    order-confirmed.html        # Order confirmed template
    payment-verified.html       # Payment verified template
```

---

## ✅ **Quick Checklist**

- ✅ Sign up for Resend
- ✅ Get API key
- ✅ Add to `.env.local`
- ✅ Restart dev server
- ✅ Place a test order
- ✅ Check email inbox
- ✅ (Optional) Verify domain for production

---

## 🔗 **Useful Links**

- **Resend Dashboard:** https://resend.com/emails
- **API Keys:** https://resend.com/api-keys
- **Domain Setup:** https://resend.com/domains
- **Resend Docs:** https://resend.com/docs

---

## 💡 **Tips**

1. **Free tier:** 100 emails/day, 3,000/month
2. **No credit card required** for free tier
3. **Test mode** works perfectly for development
4. **Domain verification** is only needed for sending to any email
5. **Check spam folder** during testing

---

**That's it! Simple and straightforward.** 🚀

