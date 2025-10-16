# 📧 Supabase Edge Function Email Setup

Your app now sends emails using **Supabase Edge Functions + Resend**!

---

## ✅ **What's Done**

- ✅ Next.js app configured to call Supabase Edge Function
- ✅ Email templates created
- ✅ All API routes updated

---

## 🔧 **What You Need to Do**

### **Step 1: Set RESEND_API_KEY in Supabase**

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Go to: **Project Settings** → **Edge Functions** → **Secrets**
4. Add a new secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (get it from https://resend.com/api-keys)
5. Click **"Save"**

---

### **Step 2: Update Edge Function in Supabase Portal**

1. Go to: **Supabase Dashboard** → **Edge Functions**
2. Click on your function (probably named `send-email`)
3. Replace the code with this:

```typescript
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()
    
    console.log(`📧 Sending email to: ${to}`)
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        reply_to: 'eternajewels.store@gmail.com',
        to,
        subject,
        html,
      }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      console.error('❌ Resend error:', data)
      throw new Error(JSON.stringify(data))
    }
    
    console.log('✅ Email sent successfully!')
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

4. Click **"Deploy"** or **"Save"**

---

### **Step 3: Restart Dev Server**

```bash
# Press Ctrl+C to stop
npm run dev
```

---

### **Step 4: Test!**

1. Place an order on your site
2. Check terminal logs for:
   ```
   📧 Calling Edge Function: https://...
   📧 Sending to: customer@example.com
   ✅ Email sent via Edge Function!
   ```
3. Check customer's email inbox!

---

## 🔍 **Troubleshooting**

### **"RESEND_API_KEY is not set" error**

**Solution:** 
1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Make sure `RESEND_API_KEY` is added
3. Value should be your Resend API key (starts with `re_`)

---

### **Check Supabase Edge Function Logs**

1. Go to: **Supabase Dashboard** → **Edge Functions**
2. Click on your function
3. Click **"Logs"** tab
4. Look for errors or success messages

---

## 📊 **Architecture**

```
Customer places order
    ↓
Next.js API Route (POST /api/orders)
    ↓
src/lib/email-supabase.ts
    ↓
Supabase Edge Function
    ↓
Resend API
    ↓
Customer Email ✉️
```

---

## ✅ **Benefits**

- ✅ Emails sent from: `Eterna Jewels <onboarding@resend.dev>`
- ✅ Replies go to: `eternajewels.store@gmail.com`
- ✅ **No verification needed** - works immediately!
- ✅ Sends to **any customer email** (no restrictions)
- ✅ Free tier: 100 emails/day
- ✅ Easy to monitor via Supabase logs

---

## 📋 **Checklist**

- [ ] `RESEND_API_KEY` added to Supabase secrets
- [ ] Edge Function code updated to use `onboarding@resend.dev`
- [ ] Edge Function deployed in Supabase as `resend-email`
- [ ] Dev server restarted
- [ ] Test order placed successfully
- [ ] Email received in customer inbox

---

## 🔗 **Useful Links**

- **Resend Dashboard:** https://resend.com/emails
- **Resend Domains:** https://resend.com/domains
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Edge Functions:** https://supabase.com/dashboard → Your Project → Edge Functions

---

**That's it! Simple and works perfectly!** 🚀

