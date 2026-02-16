# 💰 MYMEME — DAVID'S 11 AM ACTION (15 MIN)

**Estimated time:** 11:00 AM - 11:15 AM  
**What this does:** Activate revenue payments (Stripe checkout + image generation)  
**Status:** All code ready, just need 2 environment variables

---

## QUICK CHECKLIST (Do this exactly)

### ✅ STEP 1: Verify You Have API Keys (2 min)

Open these 2 pages in browser:

**Page 1:** https://runware.ai/settings/api-keys
- Log in with your Runware account
- Look for API Key (starts with `sk_`)
- **If not found:** Create new API key on this page
- **Copy it** (you'll need it in 30 seconds)

**Page 2:** https://dashboard.stripe.com/webhooks
- Log in with your Stripe account
- Find your webhook endpoint (look for "mymeme" or your domain)
- Click the webhook endpoint
- **Reveal signing secret** (button on right side)
- **Copy it** (starts with `whsec_`)

---

### ✅ STEP 2: Add Keys to Vercel (5 min)

**Option A: Via CLI (faster if you're comfortable with terminal)**
```bash
cd /Users/david/.openclaw/workspace/my-meme-web

# Set Runware API key
vercel env add RUNWARE_API_KEY --prod
# Paste your runware key (sk_...)
# When asked "Add to which Environments?" → select "Production"

# Set Stripe webhook secret
vercel env add STRIPE_WEBHOOK_SECRET --prod
# Paste your stripe webhook secret (whsec_...)
# When asked "Add to which Environments?" → select "Production"
```

**Option B: Via Web Dashboard (easier if unsure)**
```
1. Open https://vercel.com/dashboard
2. Click "my-meme-web" project
3. Go to Settings → Environment Variables
4. Click "Add Environment Variable"
5. Add RUNWARE_API_KEY:
   Name: RUNWARE_API_KEY
   Value: [paste your key from runware.ai]
   Environment: Production
6. Click "Add" (bottom button)
7. Repeat for STRIPE_WEBHOOK_SECRET (copy from Stripe dashboard)
```

**After adding both:**
- Vercel automatically redeploys (you'll see "Deploying..." in top-right)
- Wait for deployment to complete (usually 30-60 seconds)

---

### ✅ STEP 3: Test Checkout (5 min)

**When deployment is done:**

1. Open https://mymeme.uk/pricing
2. Click **"Buy Credits"** button (Starter pack, £0.49)
3. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: anything (e.g., "Test User")
4. Click "Pay"
5. You should see:
   - ✅ Payment succeeds
   - ✅ Stripe confirmation email arrives
   - ✅ Browser redirects to success page
   - ✅ Check Supabase: user_credits table shows credits added

---

## TROUBLESHOOTING (Quick Fixes)

### "API key not found error"
**Cause:** RUNWARE_API_KEY not set or empty  
**Fix:** 
1. Double-check you copied the key correctly (no spaces, full key)
2. Wait 60 seconds for Vercel redeploy
3. Refresh the page

### "Webhook verification failed"
**Cause:** STRIPE_WEBHOOK_SECRET wrong or not set  
**Fix:**
1. Check you copied the right secret (starts with `whsec_`, not your API key)
2. Wait 60 seconds for redeploy
3. Retry payment

### "Payment succeeds but no credits appear"
**Cause:** Webhook endpoint not receiving Stripe events  
**Fix:**
1. Check Stripe Dashboard → Webhooks → Your endpoint → Events tab
2. If you see failed events (red), click them to see error
3. Common error: Wrong STRIPE_WEBHOOK_SECRET (see above)
4. Delete endpoint + recreate it (Stripe will give new secret)

---

## SUCCESS CRITERIA

✅ You see test payment succeed in Stripe Dashboard  
✅ Confirmation email from Stripe arrives  
✅ Supabase user_credits table shows new credits  
✅ You can generate an image (click "Generate" on landing page)  

**If all 4 pass: REVENUE IS LIVE**

---

## AFTER THIS IS DONE

Report to Chip:
```
✅ "MyMeme revenue live — env vars added, test payment succeeded"
```

Then:
- Chip monitors for real payments
- You move to DealFind at 1 PM
- MyMeme generates passive revenue while you focus on other projects

---

## FINAL NOTE

You're about 15 minutes away from the first potential revenue source for this week.

After this:
- Every user who buys credits = automatic credit addition
- Stripe handles payment processing
- You focus on marketing + trending styles
- Revenue reports in Stripe Dashboard (Stripe → Payments → see all transactions)

---

*Chip, Standing By*  
*Generated: Monday 9:35 AM*  
*Ready for David at 11:00 AM*
