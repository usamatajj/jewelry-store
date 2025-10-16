# 🧪 Test Order Instructions

## ⚠️ **Current Limitation**

Your Resend account is in **test mode** and can only send emails to:
- ✅ `eternajewels.store@gmail.com` (the email you used to sign up)

To send to other emails, you need to verify a domain (see below).

---

## 🧪 **How to Test NOW:**

### **Option 1: Place Order with Your Email**

1. Go to your site checkout
2. Use email: `eternajewels.store@gmail.com`
3. Complete the order
4. Check inbox: `eternajewels.store@gmail.com`

---

## 🌐 **To Send to ANY Email (Production):**

You need to verify a domain in Resend.

### **If You Have a Domain (e.g., eternajewels.com):**

1. Go to: **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter your domain: `eternajewels.com`
4. Add the DNS records shown by Resend to your domain provider
5. Wait 24-48 hours for verification
6. Update Edge Function to use:
   ```typescript
   from: 'Eterna Jewels <noreply@eternajewels.com>',
   ```

Then you can send to ANY email! ✅

---

### **If You DON'T Have a Domain:**

**Option A: Buy a Domain ($10-15/year)**
- Namecheap, GoDaddy, Google Domains, etc.
- Then follow steps above

**Option B: Use Resend's Shared Domain (Free Alternative)**

Contact Resend support and ask if they offer a shared domain option for testing.

**Option C: Keep Test Mode**

For development/testing:
- Always use `eternajewels.store@gmail.com` as customer email
- Works fine for demos and testing
- Upgrade to domain later for production

---

## 💡 **Recommended Approach:**

### **For NOW (Development/Testing):**
- ✅ Test with `eternajewels.store@gmail.com`
- ✅ Show demos to client using this email
- ✅ Everything works, just limited to one email

### **For LAUNCH (Production):**
- ✅ Get a custom domain
- ✅ Verify it in Resend
- ✅ Send to any customer email

---

## 🎯 **Current Status:**

- ✅ Code is correct
- ✅ Edge Function is deployed
- ✅ Resend API key works
- ⚠️ **Limitation:** Can only send to `eternajewels.store@gmail.com` until domain verified

---

## 🔗 **Helpful Links:**

- **Resend Domains:** https://resend.com/domains
- **Resend Documentation:** https://resend.com/docs/dashboard/domains/introduction
- **Buy Domains:** https://www.namecheap.com or https://domains.google

---

**Test now with `eternajewels.store@gmail.com` and it will work!** ✅

