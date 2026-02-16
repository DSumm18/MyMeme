# 🎨 STYLE PACKS MVP — Build Plan (Week 2)

**Goal:** Launch 5 premium AI styles that generate revenue through 2-credit pricing  
**Timeline:** Days 8-14 (starting after web payments go live)  
**Owner:** Pixel (PM) + Engineer  
**Status:** Planning phase (autonomous work while David sets up env vars)

---

## EXECUTIVE SUMMARY

**What:** Style Packs are sets of 5 premium AI-generated variants of a single photo using advanced FLUX Kontext model.

**Why:** 
- FLUX Kontext produces higher-quality images than Schnell
- Users willing to pay premium for "style transformation packs"
- Shareable on TikTok/Instagram (5 variants = more content)
- Revenue: £0.49-1.49 per pack (50% margin after COGS)

**Market timing:** 
- Anime transformations trending now (Caricature trend active)
- 5-7 trending styles identified in research
- First Style Pack launch can capture trend wave

**Success metric:** 100+ Style Pack purchases in first week

---

## PHASE 1: BACKEND API (Days 8-9, ~2-3 days)

### 1.1 Integrate FLUX Kontext via fal.ai

**Task:** Set up fal.ai account + API key for FLUX Kontext model

```bash
# Step 1: Create fal.ai account
# Go to https://fal.ai → Sign up (free tier available)
# Copy API key to ~/.secrets/fal_api_key

# Step 2: Test FLUX Kontext locally
# Use fal.ai Python SDK or REST API
# Test prompt: "A caricature of a person, exaggerated features, professional"
```

**API Endpoint to build:**
```
POST /api/generate/style-pack
Content-Type: application/json

{
  "userId": "user123",
  "photoUrl": "https://...",
  "styleId": "caricature",  // or "anime", "oil-painting", etc.
  "stylePrompt": "A caricature of a person, exaggerated features"
}

Response:
{
  "jobId": "abc123",
  "status": "processing",
  "estimatedTime": 45  // seconds
}
```

**Backend logic:**
1. Receive photo URL + style ID
2. Check user has 10+ credits (5 images × 2 credits each)
3. Deduct 10 credits immediately (optimistic deduction)
4. Call fal.ai FLUX Kontext with style prompt 5× in parallel
5. Store results in Supabase Storage or external CDN
6. Return URLs to frontend
7. If error: refund 10 credits

**Payload structure (fal.ai FLUX Kontext):**
```json
{
  "prompt": "[STYLE PROMPT] of a person in the photo",
  "num_images": 5,
  "image_url": "https://user-photo.jpg",
  "seed": 42,
  "strength": 0.8
}
```

### 1.2 Polling Endpoint for Async Processing

Since FLUX Kontext takes 30-60 seconds, build a polling endpoint:

```
GET /api/generate/style-pack/poll?jobId=abc123

Response:
{
  "status": "processing",  // or "completed" or "failed"
  "progress": 60,
  "imageUrls": [
    "https://cdn.mymeme.uk/style-pack-abc123-1.jpg",
    "https://cdn.mymeme.uk/style-pack-abc123-2.jpg",
    ...
  ],
  "completedAt": "2026-02-16T12:34:56Z"
}
```

### 1.3 Credit Deduction & Refund Logic

**If successful:**
- User already deducted 10 credits upfront
- Transaction logged in `style_pack_purchases` table

**If failed (within 60 seconds):**
- Refund 10 credits automatically
- Log error to `generation_failures` table
- Return error message to user

**Risk:** User could get job ID, start another request, and cancel. Mitigate:
- Track active jobs per user
- Prevent duplicate submissions within 60 seconds
- Timeout jobs after 2 minutes

---

## PHASE 2: FRONTEND UI (Days 10-11, ~2 days)

### 2.1 Style Packs Browse Page

**Route:** `/style-packs` (new page)

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│        STYLE PACKS - Transform Your Photo       │
│   Create 5 unique AI variations in one click    │
└─────────────────────────────────────────────────┘

[Filter buttons]
├─ All Styles (15)
├─ Trending (5)
├─ Artistic (4)
├─ Fun (3)
└─ New (3)

[Style grid - 5 per row]
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Anime    │ │Caricature│ │Oil Paint │
│ 🎨       │ │ 😄       │ │ 🖼️       │
│ 2 credits│ │2 credits │ │2 credits │
└──────────┘ └──────────┘ └──────────┘
[Try style] [Try style] [Try style]
```

### 2.2 Style Detail Modal

When user clicks a style:

```
Modal: "Anime Style Pack"
───────────────────────
Preview images: [5 sample transformations]
Description: "Transform your photo into beautiful anime art"
Price: 2 credits (£0.10 per image)
Your balance: 45 credits ✅

[Upload Photo] button → opens file picker
```

### 2.3 Upload & Generation Flow

```
Step 1: Upload photo
├─ Show file picker (image only)
├─ Preview uploaded photo (max 5MB)
└─ Show "Start Generating" button

Step 2: Generation in progress
├─ Show progress bar (estimated 45 seconds)
├─ Show spinner + "Creating your Anime Style Pack..."
└─ Auto-refresh every 2 seconds

Step 3: Results gallery
├─ Show 5 generated images in a grid
├─ Each image: [Download] [Share to Instagram] [Copy link]
├─ Show credit deduction summary: "10 credits used, 35 remaining"
└─ Show "Try Another Style" CTA
```

### 2.4 Integration Points

**Navbar:**
- Add "Style Packs" link to main nav

**Pricing page:**
- Add Style Packs section showing credit costs
- "Each style pack uses 10 credits (2 per image)"

**Gallery page:**
- Show Style Pack generations under "Recent Styles"
- Track which style was used for each pack

---

## PHASE 3: STYLING & POLISH (Day 12, ~0.5 days)

### 3.1 Design System

- Colors: Purple/Pink gradient (match existing theme)
- Cards: Rounded corners, shadow hover effects
- Loading states: Spinner + estimated time countdown
- Error states: Fallback image, retry button

### 3.2 Mobile Responsiveness

- Style grid: 2 columns on mobile, 3 on tablet, 5 on desktop
- Modal: Full-screen on mobile, centered on desktop
- Upload: Touch-friendly file input with large tap targets

### 3.3 Accessibility

- ARIA labels on all buttons
- Keyboard navigation through styles
- Alt text on all preview images
- Focus states on interactive elements

---

## PHASE 4: LAUNCH & MONITORING (Days 13-14, ~1 days)

### 4.1 Pre-Launch Checklist

- [ ] All 5 launch styles tested with sample photos
- [ ] Credit deduction works correctly (test with multiple users)
- [ ] Refund logic tested (simulate failures)
- [ ] Polling endpoint returns correct status
- [ ] Images uploaded to CDN successfully
- [ ] Gallery shows generated Style Packs
- [ ] Mobile layout responsive on real devices
- [ ] Error messages user-friendly
- [ ] No TypeScript errors
- [ ] Build passes without warnings

### 4.2 Launch Strategy

**Timing:** Deploy Tuesday evening (Day 2 after web payments live)

**Announcement:**
- Tweet: "🎨 NEW: Style Packs are here! Transform your photo into 5 beautiful variations with one click. [link]"
- TikTok: 30-second demo of Caricature style pack
- Instagram: Before/after carousel

**Monitoring (Day 1):**
- Track generation success rate (target: >95%)
- Track credit deduction accuracy (target: 100%)
- Monitor fal.ai API errors
- Monitor CDN upload failures
- Check user feedback for quality issues

---

## TECHNICAL ARCHITECTURE

### Database Schema Changes

```sql
-- New table: style_pack_purchases
CREATE TABLE style_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  style_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  result_urls TEXT[] NOT NULL,  -- Array of 5 URLs
  credits_used INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- New table: generation_failures
CREATE TABLE generation_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  style_id TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- New RPC: deduct_credits_for_style_pack
CREATE OR REPLACE FUNCTION deduct_credits_for_style_pack(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE user_credits 
  SET credits = credits - p_amount 
  WHERE user_id = p_user_id AND credits >= p_amount;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'Deducted'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'Insufficient credits'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### API Configuration

**Environment Variables (to add to Vercel):**
```
FAL_API_KEY=... (from fal.ai)
CDN_BUCKET_NAME=mymeme-style-packs (Supabase Storage)
FLUX_KONTEXT_MODEL=fal-ai/flux-pro  # or flux-dev based on testing
```

### Styling & Models

**FLUX Models to test:**
1. `fal-ai/flux-pro` — Highest quality, slowest (60-90s)
2. `fal-ai/flux-dev` — Fast quality, medium speed (30-45s)
3. `fal-ai/flux-schnell` — Current, very fast (~3-5s)

**Recommendation:** Start with `flux-dev` (good quality + reasonable speed)

---

## LAUNCH STYLES (5 MVP Styles)

### 1. Caricature (TRENDING NOW)
```
Prompt: "A caricature portrait of a person, exaggerated features, 
humorous, professional digital art, high quality, detailed"

Why: Currently trending on TikTok/Reddit (caricature art)
Target: Meme creators, TikTokers
Shareability: Very high (exaggerated features = funny)
```

### 2. Anime/Watercolor
```
Prompt: "An anime-style portrait in watercolor, soft brush strokes,
beautiful colors, Japanese art style, trending anime aesthetic"

Why: Always trending, very shareable
Target: Anime fans, art enthusiasts
Shareability: High (anime = always popular)
```

### 3. Oil Painting (Renaissance)
```
Prompt: "A classical oil painting portrait in Renaissance style,
museum quality, detailed brushwork, warm lighting, professional art"

Why: Timeless appeal, shareable for culture-conscious audience
Target: Art lovers, professionals
Shareability: Medium (more "classy" share)
```

### 4. Cyberpunk/Neon
```
Prompt: "A cyberpunk portrait with neon colors, sci-fi aesthetic,
glowing effects, digital art, futuristic, high contrast, trending style"

Why: Growing trend, very visually striking
Target: Gaming/anime fans, Gen Z
Shareability: Very high (neon = eye-catching)
```

### 5. Paper Cut Art
```
Prompt: "A paper cut portrait art style, layered silhouettes,
intricate details, 3D depth effect, professional craft art, white paper"

Why: Unique, less saturated in market
Target: Art enthusiasts, unique seekers
Shareability: High (very distinctive)
```

---

## REVENUE PROJECTIONS (After Launch)

### Week 1 (Days 15-21)
- **Conservative:** 50 Style Pack purchases × £0.49 avg = £24.50
- **Realistic:** 100 Style Pack purchases × £1.49 avg = £149
- **Optimistic:** 300 Style Pack purchases × £1.49 avg = £447

### If One Style Trends (e.g., Caricature trend continues)
- **Single day:** Could see 500-1000 generations
- **Revenue impact:** £500+ in one day
- **Risk:** fal.ai rate limits (need to monitor)

---

## RISKS & MITIGATION

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| FLUX Kontext quality poor | Low | Test with Pixel specs first, have fallback to FLUX Dev |
| fal.ai API rate limits | Medium | Implement queue system, prioritize users |
| Long generation times (>90s) | Medium | Add timeout, refund credits if >120s |
| User complaints about credit cost | Low | Marketing: "Premium quality = 2 credits" |
| CDN bandwidth costs | Medium | Monitor usage, optimize image size |

---

## SUCCESS METRICS (Week 1)

- [ ] 50+ Style Pack purchases
- [ ] 95%+ successful generation rate
- [ ] Average generation time: <60 seconds
- [ ] 4.5+ star rating from users
- [ ] 20%+ of purchases lead to repeat buys
- [ ] 0 refund requests due to quality issues

---

## NEXT PRIORITIES (After Style Packs Launch)

1. **Week 3:** Mobile IAP integration (RevenueCat)
2. **Week 4:** Trend monitoring + rapid style deployment (<24h)
3. **Week 5:** Referral program (share pack = get credits)
4. **Week 6:** Style Packs Advanced (15+ styles, filtering, favorites)

---

*Build plan by Pixel, MyMeme PM*  
*Generated: 2026-02-16 08:15 AM*  
*Status: Ready for approval + engineering estimate*
