# 📊 Google Analytics 4 Setup Guide

**Purpose:** Track user behavior, conversion rates, and revenue metrics  
**Time to set up:** 10 minutes  
**Impact:** Essential for optimizing marketing and measuring ROI

---

## STEP 1: Create Google Analytics 4 Property (5 minutes)

### 1. Go to Google Analytics
```
https://analytics.google.com
```

### 2. Sign in with your Google account
- Use the same Google account as MyMeme project
- If no GA account, create one (free)

### 3. Create a New Property
- Click "Admin" (bottom left)
- Click "Create Property" (in the Property column)
- **Property name:** MyMeme Web
- **Data stream type:** Web
- **Website URL:** https://mymeme.uk
- **Currency:** GBP
- **Reporting timezone:** GMT/UTC

### 4. Get Your Measurement ID
- After creation, you'll see a **Measurement ID** starting with `G-`
- **Example:** `G-1A2B3C4D5E`
- **Copy this** — you'll need it in Step 2

---

## STEP 2: Add GA4 to MyMeme (3 minutes)

### 1. Open Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2. Find MyMeme project
- Click "my-meme-web" project

### 3. Go to Settings → Environment Variables
- Click "Settings" (top menu)
- Click "Environment Variables" (left sidebar)

### 4. Add GA Measurement ID
- Click "Add New Environment Variable"
- **Name:** `NEXT_PUBLIC_GA_ID`
- **Value:** Your Measurement ID (e.g., `G-1A2B3C4D5E`)
- **Select environments:** Production + Preview + Development
- Click "Save"

### 5. Redeploy
- Go back to "Deployments"
- Click latest deployment
- Click "Redeploy"

**Done!** Google Analytics is now active.

---

## STEP 3: Verify GA4 is Working (2 minutes)

### 1. Open your site
```
https://mymeme.uk
```

### 2. Check Google Analytics Real-Time
- Go to Google Analytics → Real Time
- You should see yourself as an active user
- Activity should show:
  - Page view (Homepage)
  - Button clicks (if you click buttons)

### 3. Troubleshoot if not showing
- Wait 5 minutes (GA4 has ~5min delay)
- Hard refresh page (Cmd+Shift+R on Mac)
- Check browser console for errors (F12 → Console)
- Verify `NEXT_PUBLIC_GA_ID` is set correctly in Vercel

---

## STEP 4: Create Conversion Events (Optional but Recommended)

GA4 automatically tracks:
- ✅ Page views
- ✅ Outbound link clicks
- ✅ Session time
- ❌ Button-specific events (need custom tracking)

### To track "Buy Credits" conversions:

Add this to your buy button onClick handler:

```javascript
// Inside your buy button
const handleBuyCredits = () => {
  // Track event to GA4
  if (window.gtag) {
    gtag('event', 'add_to_cart', {
      event_category: 'ecommerce',
      event_label: 'Buy Credits',
      value: creditAmount,
    });
  }
  
  // Then proceed to checkout
  proceedToCheckout();
};
```

This way you can see:
- How many users click "Buy Credits"
- What credit tiers are most popular
- Conversion rate (clicks → payments)

---

## STEP 5: Create Dashboard (Optional but Recommended)

### In Google Analytics:
1. Click "Dashboard" (left sidebar)
2. Click "Create Dashboard"
3. Add these cards:
   - **Users** (daily active users)
   - **Sessions** (engagement metric)
   - **Page Views** (traffic)
   - **Bounce Rate** (quality metric)
   - **Average Session Duration** (engagement)
   - **Event Count** (if using custom events)

This gives you a one-page view of MyMeme health.

---

## WHAT TO MONITOR

### Daily (Quick check)
- **Active Users:** Should grow as you acquire customers
- **Session Duration:** Should stay >2 min (shows engagement)

### Weekly (Deeper analysis)
- **Top Pages:** Which pages get most traffic?
- **Traffic Sources:** Where are users coming from?
- **User Behavior:** What do users do on site?
- **Bounce Rate:** Are users leaving immediately? (If >60%, copy/UX needs work)

### Monthly (Strategic)
- **Traffic Growth:** Is growth trending up?
- **Conversion Funnel:** How many users → paid customers?
- **Revenue per User:** (Once you connect Stripe data)
- **Organic vs Referral:** Which channels work?

---

## STRIPE ↔️ GA4 INTEGRATION (For revenue tracking)

Optional: Connect Stripe to GA4 to auto-track purchases.

This requires:
1. Google Analytics 4 account (done above)
2. Stripe account (you have this)
3. 10 more minutes to set up

**Worth doing after launch if revenue is flowing.**

---

## TEMPLATE: GA4 COMMANDS

Use these in your code when you want to track specific events:

```javascript
// Track a purchase
gtag('event', 'purchase', {
  event_category: 'ecommerce',
  event_label: 'Buy Credits',
  value: 0.99,
  currency: 'GBP',
});

// Track a button click
gtag('event', 'click', {
  event_category: 'engagement',
  event_label: 'Generate Image Button',
});

// Track a page view (auto-tracked but can be manual)
gtag('event', 'page_view', {
  page_title: 'Image Generator',
  page_path: '/generator',
});

// Track an error
gtag('event', 'exception', {
  description: 'Image generation failed',
  fatal: false,
});
```

---

## SECURITY NOTES

✅ **NEXT_PUBLIC_GA_ID is safe to public**
- It's designed to be public (for client-side tracking)
- No sensitive data

❌ **Don't put these in public:**
- STRIPE_SECRET_KEY
- API keys for Runware
- Database passwords

---

## NEXT STEPS

After you deploy:
1. Wait 5 minutes for GA4 to start showing data
2. Check Real Time to confirm users are tracked
3. Monitor daily during first week (find issues early)
4. After 7 days, analyze "Top Pages" and "Bounce Rate"
5. If bounce rate >60%, improve copy/UX

---

## SUPPORT

**If GA4 shows no data:**
- Check Measurement ID is correct in Vercel
- Check hard refresh (Cmd+Shift+R)
- Wait 5+ minutes (GA4 has delay)
- Check browser console for errors (F12)

**If you see errors:**
- Screenshot error + send to Chip
- Response time <5 min

---

*Setup guide by Chip, MyMeme Growth PM*  
*Last updated: 2026-02-16 07:15 AM*
