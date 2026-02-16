# 💰 MYMEME — REVENUE DEPLOYMENT (15 MINUTES)
**Status:** Ready to go LIVE  
**Owner:** David (CEO)  
**Time needed:** 15 minutes  
**Date:** Monday 2026-02-16

---

## THE SIMPLE VERSION

You're 2 environment variables away from accepting real payments. This guide is 100% copy-paste.

**Step 1:** Get API key from Runware (5 min)  
**Step 2:** Get webhook secret from Stripe (5 min)  
**Step 3:** Add both to Vercel (2 min)  
**Step 4:** Test payment (3 min)  

Done. MyMeme is live.

---

## STEP 1: GET RUNWARE API KEY (5 MINUTES)

### 1a: Log into Runware
```
Go to: https://runware.ai
Click: Sign In (top right)
Use: Your Runware account (if you have one)
       OR Create account (if not)
```

**Note:** If you don't have Runware yet, create account (takes 2 min). It's free to start, you only pay per image generated.

### 1b: Copy API Key
```
Once logged in:
1. Click Settings (⚙️ icon, usually bottom-left)
2. Find "API Keys" section
3. Look for key starting with "sk_" (this is your live key)
4. Click the key → it copies to clipboard
5. Paste it somewhere safe (you'll need it in Step 3)

If no key exists:
1. Click "Create API Key" button
2. Name it: "MyMeme Production"
3. Copy the key
```

**You now have:** `sk_live_...` (your Runware API key)

---

## STEP 2: GET STRIPE WEBHOOK SECRET (5 MINUTES)

### 2a: Log into Stripe
```
Go to: https://dashboard.stripe.com
Click: Sign In
Use: Your Stripe account
```

### 2b: Find Your Webhook Endpoint
```
Once logged in:
1. Left menu → Click "Developers"
2. Submenu → Click "Webhooks"
3. You should see a list of endpoints (usually 1-3)
4. Look for endpoint that contains "mymeme" or your domain (e.g., "mymeme.uk/api/webhooks/stripe")
5. Click on that endpoint
```

### 2c: Copy Signing Secret
```
On the endpoint page:
1. Look for "Signing secret" section
2. You'll see: "whsec_xxxxxxxxxxxx" (partially masked)
3. Click the button next to it (usually "Reveal" or "Copy")
4. If "Reveal": Click → then highlight → Ctrl+C to copy
5. Paste it somewhere safe

If you don't see your webhook endpoint:
   → Skip for now, you can create a new one later
   → Contact Chip if unsure
```

**You now have:** `whsec_...` (your Stripe webhook secret)

---

## STEP 3: ADD BOTH TO VERCEL (2 MINUTES)

### 3a: Open Vercel Dashboard
```
Go to: https://vercel.com/dashboard
Click: Select "mymeme" project (if multiple projects shown)
Left menu → Settings
```

### 3b: Open Environment Variables
```
On Settings page:
1. Left menu → Environment Variables
   (OR directly: https://vercel.com/mymeme/settings/environment-variables)
```

### 3c: Add RUNWARE_API_KEY
```
Click "Add" button

Field 1 (Name): RUNWARE_API_KEY
Field 2 (Value): Paste your sk_live_... key from Step 1
Environment: Select "Production" (checkbox or dropdown)

Click "Save" or "Add"
```

### 3d: Add STRIPE_WEBHOOK_SECRET
```
Click "Add" button again

Field 1 (Name): STRIPE_WEBHOOK_SECRET
Field 2 (Value): Paste your whsec_... key from Step 2
Environment: Select "Production"

Click "Save" or "Add"
```

**Verify both are saved:**
```
You should now see:
✅ RUNWARE_API_KEY = sk_live_... (value hidden)
✅ STRIPE_WEBHOOK_SECRET = whsec_... (value hidden)

If you see them both, continue. If not, re-add.
```

### 3e: Redeploy to Production
```
After adding environment variables, Vercel automatically redeploys.

Check deployment status:
1. Left menu → Deployments
2. Top of list should show a new deployment (just happened)
3. Wait for status to show ✅ "Ready"
4. Takes ~1-2 minutes typically
```

**You're now live!**

---

## STEP 4: TEST PAYMENT (3 MINUTES)

### 4a: Open MyMeme Pricing Page
```
Go to: https://mymeme.uk/pricing
(Or: https://mymeme.art/pricing if that's your domain)

You should see:
- "Starter" tier (£0.49 for X credits)
- A blue "Buy Credits" or "Buy" button
```

### 4b: Click "Buy Credits"
```
Click the Buy button
→ Stripe checkout should open
```

### 4c: Enter Stripe Test Card
```
Card number: 4242 4242 4242 4242
Expiry: 12/25 (any future date works)
CVC: 123 (any 3 digits)
Name: Test User
Email: test@example.com
```

### 4d: Complete Purchase
```
Click "Pay" or "Complete Purchase"

Wait 5-10 seconds...

You should see:
✅ Success message: "Payment successful!" or "Credits added!"
```

### 4e: Verify in Supabase
```
Check that credits were added:

1. Go to: https://supabase.com/dashboard
2. Select your "mymeme" project
3. Left menu → SQL Editor
4. Run this query:

SELECT * FROM user_credits ORDER BY created_at DESC LIMIT 1;

You should see a new row with:
- email: test@example.com
- credits: X (whatever you bought)
- created_at: now
```

**If everything worked:** 🎉 Revenue is LIVE!

---

## WHAT HAPPENS NOW

### Immediate (Next 1-2 hours)
- MyMeme is accepting real payments
- Stripe dashboard shows all transactions
- Credits automatically added to user accounts

### Monitoring
**Every day, check:**
1. Stripe Dashboard → Payments → See real transactions
2. Supabase → user_credits table → See credits issued
3. Vercel Logs → Search for "webhook" to verify processing

### If First Real Customer Comes
- You'll get email notification from Stripe
- Credits appear automatically in Supabase
- User can start generating images immediately

---

## TROUBLESHOOTING

### Problem: Payment fails with "Network error"
**Fix:** 
1. Check Vercel deployment status (should be ✅ Ready)
2. Clear browser cache + try again
3. Try different browser or incognito mode

### Problem: Payment succeeds but no credits appear
**Fix:**
1. Check Stripe Dashboard → Webhooks → Events
2. Look for webhook delivery (should show ✅ delivered)
3. If not delivered: webhook endpoint may be wrong
4. Check Vercel logs for errors: https://vercel.com/mymeme/deployments (click latest, view logs)
5. Contact Chip if still failing

### Problem: Can't find Stripe webhook secret
**Fix:**
1. You might need to create a new webhook endpoint
2. Go to Stripe → Developers → Webhooks
3. Click "Create endpoint"
4. URL: `https://mymeme.uk/api/webhooks/stripe` (adjust domain)
5. Select events: "Payment Intent" events only
6. Create endpoint → copy secret → add to Vercel

### Problem: Runware API key rejected
**Fix:**
1. Make sure you copied the LIVE key, not test key
2. Runware live key starts with: `sk_live_`
3. Test key starts with: `sk_test_` (don't use)
4. Go back to Runware settings, verify correct key

---

## REVENUE TRACKING CHECKLIST

After deployment, monitor these:

### Daily Checklist
- [ ] **Stripe:** Any new payments? (Dashboard → Payments)
- [ ] **Supabase:** New credits issued? (SQL: `SELECT COUNT(*) FROM user_credits WHERE created_at > NOW() - INTERVAL 1 day;`)
- [ ] **Vercel Logs:** Any webhook errors? (Search logs for "webhook" or "error")

### Weekly Checklist
- [ ] Total revenue so far? (Stripe → Revenue)
- [ ] Conversion rate? (Visitors ÷ Buyers)
- [ ] Top performing credit tier? (Stripe → Payments → group by amount)
- [ ] Need to add funds to Stripe account? (Stripe → Settings → Payouts)

---

## NEXT STEPS (AFTER DEPLOYMENT)

### Immediate (Today/Tomorrow)
- Monitor for first customer
- Optimize landing page copy (already being done by Pixel)
- Add "popular choice" badge to best tier

### This Week
- Launch trending styles (if viral moment happens)
- Create TikTok/Instagram content (showcase MyMeme)
- Monitor competitor pricing shifts

### Next Week
- Style Packs MVP (Pixel building)
- Mobile IAP integration (if demand warrants)
- Referral program exploration

---

## QUESTIONS BEFORE YOU START

**Q: What if I don't have a Runware account?**  
A: Create one (2 min): https://runware.ai/signup. Free tier includes some credits.

**Q: Can I use Replicate instead of Runware?**  
A: Yes, but would need different integration. For now, stick with Runware (already configured in code).

**Q: What if Stripe account isn't live yet?**  
A: Check Stripe Dashboard → Settings → Account status. If it says "Pending," you can't accept real payments yet (but test cards work). Complete account verification first.

**Q: Is this definitely production, not test mode?**  
A: Yes, you're using live keys (sk_live_*, whsec_*). Test mode uses sk_test_* and rk_test_*. Be careful not to mix them.

**Q: What happens if I add the wrong webhook secret?**  
A: Payments will succeed but credits won't be added (signature verification fails). Easy fix: go back and get the correct secret.

---

## SUCCESS CRITERIA

✅ **You succeeded if:**
1. Both environment variables added to Vercel
2. Deployment completed without errors
3. Test payment succeeded
4. Credits appeared in Supabase
5. You saw transaction in Stripe dashboard

🎉 **That's it. Revenue is LIVE.**

---

## IF SOMETHING GOES WRONG

**Don't panic.** Everything is reversible:
- Remove environment variable → everything stops (safe)
- Redo webhook secret → previous one still works for 30 days
- Undo Vercel deployment → one click

**Contact Chip immediately if:**
- Payment fails on checkout (error message)
- Webhook delivery fails (Stripe shows ❌ error)
- Supabase query fails (SQL syntax error)
- Not sure about any step

---

## FINAL CHECKLIST

Before clicking anything:

- [ ] You have Runware account + API key (sk_live_...)
- [ ] You have Stripe account + webhook secret (whsec_...)
- [ ] You can access Vercel dashboard
- [ ] You have 15 minutes uninterrupted
- [ ] You've read Steps 1-4 once before starting

**Go.**

---

*Prepared by Chip*  
*Status: COPY-PASTE READY*  
*Generated: 2026-02-16 00:33 GMT*  
*Estimated time: 15 minutes to LIVE*
