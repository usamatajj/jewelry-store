# 🐛 Email Not Working - Debug Guide

## 📋 Quick Checklist

Before anything else, check these:

- [ ] **Step 1:** Is `RESEND_API_KEY` in `.env.local`?
- [ ] **Step 2:** Did you restart the dev server after adding the key?
- [ ] **Step 3:** Is the API key valid (starts with `re_`)?
- [ ] **Step 4:** Did you sign up at https://resend.com?
- [ ] **Step 5:** Check spam/junk folder

---

## 🧪 Test Email Configuration

### **Step 1: Test API Endpoint**

Visit this URL in your browser:
```
http://localhost:3002/api/test-email
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "✅ Email sent successfully!",
  "emailId": "abc-123-xyz",
  "note": "Check the Resend dashboard to see the email"
}
```

**If you see an error, it will tell you exactly what's wrong!**

---

### **Step 2: Check Terminal Logs**

When you place an order, check your terminal for these logs:

**Good logs (working):**
```
📧 Attempting to send order placed email...
📧 Recipient: customer@example.com
📧 RESEND_API_KEY exists: true
📧 RESEND_API_KEY preview: re_abc123...
📧 Response status: 200
✅ Email sent successfully! { id: 'xyz-789' }
```

**Bad logs (not working):**
```
❌ Failed to send order placed email: {"error":"API key is invalid"}
```

---

## 🔍 Common Issues & Solutions

### **Issue 1: "RESEND_API_KEY is not set"**

**Problem:** Environment variable not loaded

**Solution:**
1. Check `.env.local` exists in project root
2. Verify it contains:
   ```bash
   RESEND_API_KEY=re_your_key_here
   ```
3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
4. Test again

---

### **Issue 2: "API key is invalid"**

**Problem:** Wrong API key or typo

**Solution:**
1. Go to https://resend.com/api-keys
2. Get a fresh API key
3. Update `.env.local`:
   ```bash
   RESEND_API_KEY=re_NEW_KEY_HERE
   ```
4. Restart server
5. Test again

---

### **Issue 3: "Authorization header is missing"**

**Problem:** API key not being sent to Resend

**Cause:** Key not loaded in environment

**Solution:**
1. Print key in terminal:
   ```bash
   cat .env.local | grep RESEND
   ```
2. Should see: `RESEND_API_KEY=re_...`
3. If not there, add it
4. Restart server

---

### **Issue 4: Emails sent but not received**

**Problem:** Email delivered but in spam or wrong inbox

**Solution:**

1. **Check spam folder** (most common!)

2. **Check Resend dashboard:**
   - Go to https://resend.com/emails
   - See if email was sent
   - Check delivery status

3. **Try different email:**
   - Use Gmail, Outlook, etc.
   - Some email providers block test emails

4. **Use Resend's test email:**
   - Email to: `delivered@resend.dev`
   - This always works for testing

---

### **Issue 5: "Domain not found"**

**Problem:** Trying to send from unverified domain

**Current setup:**
```typescript
from: 'Eterna Jewels <onboarding@resend.dev>'
```

**This should work!** If you see this error, it means the code is using a different "from" address.

**Solution:**
1. Check `src/lib/email.ts`
2. Make sure all three functions use:
   ```typescript
   from: 'Eterna Jewels <onboarding@resend.dev>'
   ```
3. NOT:
   ```typescript
   from: 'Eterna Jewels <orders@eternajewels.com>' // ❌ Won't work without domain verification
   ```

---

## 🔧 Step-by-Step Debug Process

### **1. Verify .env.local file**

```bash
cd /Users/usama-taj-mba/Projects/jewelry-store
cat .env.local
```

**Should see:**
```bash
RESEND_API_KEY=re_...
```

**If not:**
```bash
echo 'RESEND_API_KEY=re_YOUR_KEY_HERE' >> .env.local
```

---

### **2. Test API key manually**

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "delivered@resend.dev",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

**Expected response:**
```json
{"id":"abc-123-xyz"}
```

---

### **3. Check Next.js can access env variable**

Add this to any API route temporarily:
```typescript
console.log('ENV CHECK:', {
  keyExists: !!process.env.RESEND_API_KEY,
  keyPreview: process.env.RESEND_API_KEY?.substring(0, 10)
});
```

**Should see in terminal:**
```
ENV CHECK: { keyExists: true, keyPreview: 're_abc123...' }
```

---

### **4. Test with the test endpoint**

```bash
curl http://localhost:3002/api/test-email
```

**Or visit in browser:**
```
http://localhost:3002/api/test-email
```

---

## 📊 Environment Variable Checklist

### **File: `.env.local`**

Location: `/Users/usama-taj-mba/Projects/jewelry-store/.env.local`

**Required format:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jjnzylvhvksigqlcapbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend API Key (for sending emails)
RESEND_API_KEY=re_YOUR_KEY_HERE

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_ADMIN_EMAIL='eternajewels.store@gmail.com'
NEXT_PUBLIC_ADMIN_PASSWORD='Ramuja007'
```

**Common mistakes:**
- ❌ Extra spaces: `RESEND_API_KEY = re_...` (wrong)
- ✅ No spaces: `RESEND_API_KEY=re_...` (correct)
- ❌ Quotes: `RESEND_API_KEY="re_..."` (not needed)
- ✅ No quotes: `RESEND_API_KEY=re_...` (correct)

---

## 🎯 Get Your Resend API Key

### **If you don't have an account:**

1. **Sign up at Resend:**
   - Go to https://resend.com
   - Click "Sign Up" (FREE)
   - Use GitHub or email

2. **Get API key:**
   - After login, go to "API Keys" tab
   - Click "Create API Key"
   - Name it: `jewelry-store`
   - Copy the key (starts with `re_`)

3. **Add to .env.local:**
   ```bash
   RESEND_API_KEY=re_abc123xyz789...
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Test Sequence

Run these in order:

### **Test 1: Environment Variable**
```bash
node -e "console.log(require('dotenv').config({path:'.env.local'})); console.log(process.env.RESEND_API_KEY)"
```

### **Test 2: API Endpoint**
```
http://localhost:3002/api/test-email
```

### **Test 3: Place Order**
- Go to checkout
- Place a test order
- Watch terminal logs
- Check email inbox

---

## 📧 Expected Flow

### **When order is placed:**

**1. Terminal logs:**
```
📧 Attempting to send order placed email...
📧 Recipient: customer@example.com
📧 RESEND_API_KEY exists: true
📧 RESEND_API_KEY preview: re_abc123...
📧 Response status: 200
✅ Email sent successfully! { id: '...' }
```

**2. Resend dashboard:**
- Email appears in https://resend.com/emails
- Status: "Delivered"

**3. Customer inbox:**
- Email arrives within 1-2 minutes
- Subject: "Order Received - #ABC123"
- Check spam if not in inbox

---

## 🆘 Still Not Working?

### **Share these details:**

1. **Environment check:**
   ```bash
   ls -la .env.local
   grep RESEND .env.local
   ```

2. **Test endpoint result:**
   ```
   http://localhost:3002/api/test-email
   ```

3. **Terminal logs when placing order**

4. **Resend dashboard screenshot:**
   - https://resend.com/emails
   - Show if any emails appear

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Test endpoint returns success
2. ✅ Terminal shows `✅ Email sent successfully!`
3. ✅ Email appears in Resend dashboard
4. ✅ Email arrives in inbox (check spam!)

---

**Last Updated**: October 16, 2025  
**Need Help?** Run the test endpoint first: http://localhost:3002/api/test-email

