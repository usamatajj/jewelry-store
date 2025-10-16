# 🔍 Email Not Working - Simple Troubleshoot

## Important: You Won't See Resend Calls in Browser Network Tab!

**Why?** The email is sent from the **server-side** (Next.js API route), not from the browser. The fetch call to Resend happens on your server, so it won't appear in the browser's Network tab.

---

## ✅ How to Debug

### **1. Check Your Terminal (Server Logs)**

When you place an order, watch your **terminal window** where `npm run dev` is running.

**You should see these logs:**

```
📧 Order created successfully, now sending email...
📧 Email will be sent to: customer@example.com
📧 Attempting to send order placed email...
📧 Recipient: customer@example.com
📧 RESEND_API_KEY exists: true
📧 RESEND_API_KEY preview: re_abc123...
📧 Response status: 200
✅ Email sent successfully! { id: 'xyz-789' }
📧 Email send result: ✅ Success
✅ Order email sent successfully!
```

**If you see errors instead:**

```
❌ RESEND_API_KEY exists: false
```
→ **Fix:** Add API key to `.env.local` and restart server

```
❌ Failed to send order placed email: {"error":"API key is invalid"}
```
→ **Fix:** Get a new API key from https://resend.com

---

### **2. Run the Test Endpoint**

Open in browser:
```
http://localhost:3002/api/test-email
```

**This will:**
- ✅ Check if RESEND_API_KEY is set
- ✅ Try to send a test email
- ✅ Show exactly what's wrong if it fails

---

### **3. Check .env.local File**

```bash
cat .env.local | grep RESEND
```

**Should show:**
```
RESEND_API_KEY=re_abc123...
```

**If empty or missing:**
1. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_YOUR_KEY_HERE
   ```
2. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

### **4. Get Resend API Key**

If you don't have one:

1. Go to https://resend.com
2. Sign up (FREE - no credit card)
3. Go to **"API Keys"** tab
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)
6. Add to `.env.local`
7. Restart server

---

## 🐛 Common Issues

### **Issue: No logs in terminal at all**

**Problem:** Email function not being called

**Check:**
1. Is order being created? (Check Supabase database)
2. Any errors in terminal when placing order?
3. Check console for order creation errors

---

### **Issue: "RESEND_API_KEY exists: false"**

**Problem:** Environment variable not loaded

**Fix:**
1. Make sure `.env.local` is in project root
2. Add `RESEND_API_KEY=re_...`
3. **Restart server** (very important!)
4. Try again

---

### **Issue: "Response status: 401"**

**Problem:** Invalid API key

**Fix:**
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Update `.env.local` with new key
4. Restart server

---

### **Issue: "Response status: 404"**

**Problem:** Wrong "from" email address

**Check:** Make sure using `onboarding@resend.dev` not your custom domain

---

### **Issue: Logs show success but no email**

**Problem:** Email might be in spam or wrong inbox

**Check:**
1. **Spam/Junk folder** (most common!)
2. Resend dashboard: https://resend.com/emails
3. Try different email address
4. Wait 2-3 minutes (can be delayed)

---

## 📋 Quick Checklist

Run through this list:

- [ ] **1. `.env.local` file exists in project root**
  ```bash
  ls -la .env.local
  ```

- [ ] **2. RESEND_API_KEY is in the file**
  ```bash
  cat .env.local | grep RESEND
  ```

- [ ] **3. Restarted dev server after adding key**
  ```bash
  npm run dev
  ```

- [ ] **4. Test endpoint works**
  ```
  http://localhost:3002/api/test-email
  ```

- [ ] **5. Watching terminal when placing order**
  - Look for 📧 emoji logs
  - Check for ✅ success or ❌ error

- [ ] **6. Checked spam folder**
  - Very common for test emails!

---

## 🎯 Step-by-Step Debug Process

### **Step 1: Verify Environment**

```bash
# Check file exists
ls .env.local

# Check API key is set
cat .env.local | grep RESEND

# Should show: RESEND_API_KEY=re_...
```

---

### **Step 2: Test API Key**

Visit in browser:
```
http://localhost:3002/api/test-email
```

**Expected success:**
```json
{
  "success": true,
  "message": "✅ Email sent successfully!",
  "emailId": "abc-123"
}
```

---

### **Step 3: Place Test Order**

1. Go to checkout
2. Fill out form
3. Place order
4. **Watch terminal immediately**

**Look for:**
```
📧 Order created successfully, now sending email...
📧 Attempting to send order placed email...
✅ Email sent successfully!
```

---

### **Step 4: Check Resend Dashboard**

1. Go to https://resend.com/emails
2. You should see the email listed
3. Check status (should be "Delivered")

---

### **Step 5: Check Email Inbox**

1. Check main inbox
2. **Check spam folder** (important!)
3. Wait 1-2 minutes
4. Try search for "Eterna Jewels"

---

## 🚀 Quick Fix (Most Common Issue)

**If RESEND_API_KEY is missing:**

```bash
# 1. Add to .env.local
echo 'RESEND_API_KEY=re_YOUR_KEY_HERE' >> .env.local

# 2. Restart server
# Press Ctrl+C, then:
npm run dev

# 3. Test
# Visit: http://localhost:3002/api/test-email
```

---

## 📞 What to Share if Still Stuck

1. **Output of test endpoint:**
   ```
   http://localhost:3002/api/test-email
   ```

2. **Terminal logs when placing order** (copy/paste)

3. **Environment check:**
   ```bash
   cat .env.local | grep RESEND
   ```

4. **Resend dashboard screenshot:**
   https://resend.com/emails

---

**Remember:** Email calls happen on the server, so you won't see them in browser Network tab! Always check the **terminal logs** where `npm run dev` is running.

---

**Last Updated**: October 16, 2025

