import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// SECURITY: Validate environment variables at startup
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

if (!SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

// SECURITY: Define allowed price IDs to prevent injection attacks
const ALLOWED_PRICE_IDS = ['starter', 'weekly', 'annual'] as const;
type AllowedPriceId = typeof ALLOWED_PRICE_IDS[number];

function isValidPriceId(id: unknown): id is AllowedPriceId {
  return typeof id === 'string' && ALLOWED_PRICE_IDS.includes(id as AllowedPriceId);
}

function isValidUserId(id: unknown): boolean {
  // UUID v4 format or alphanumeric string
  if (typeof id !== 'string') return false;
  return /^[a-f0-9\-]{36}$|^[a-zA-Z0-9_\-]{10,100}$/.test(id);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, userId } = body;

    // SECURITY: Validate input parameters
    if (!isValidPriceId(priceId)) {
      console.error('Invalid priceId:', priceId);
      return NextResponse.json(
        { error: 'Invalid price package' },
        { status: 400 }
      );
    }

    if (!isValidUserId(userId)) {
      console.error('Invalid userId format:', userId);
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: getProductName(priceId),
            },
            unit_amount: getPriceAmount(priceId),
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing`,
      metadata: {
        userId,
        credits: String(getCredits(priceId)),
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function getProductName(priceId: AllowedPriceId): string {
  switch (priceId) {
    case 'starter':
      return 'Starter Credit Pack';
    case 'weekly':
      return 'Weekly Credit Pack';
    case 'annual':
      return 'Annual Credit Pack';
  }
}

function getPriceAmount(priceId: AllowedPriceId): number {
  switch (priceId) {
    case 'starter':
      return 49; // £0.49
    case 'weekly':
      return 149; // £1.49
    case 'annual':
      return 1999; // £19.99
  }
}

function getCredits(priceId: AllowedPriceId): number {
  switch (priceId) {
    case 'starter':
      return 10;
    case 'weekly':
      return 50;
    case 'annual':
      return 1000; // Effectively unlimited
  }
}