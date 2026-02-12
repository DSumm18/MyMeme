import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json();

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        userId,
        credits: getCredits(priceId),
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

function getProductName(priceId: string): string {
  switch (priceId) {
    case 'starter':
      return 'Starter Credit Pack';
    case 'weekly':
      return 'Weekly Credit Pack';
    case 'annual':
      return 'Annual Credit Pack';
    default:
      return 'Credit Pack';
  }
}

function getPriceAmount(priceId: string): number {
  switch (priceId) {
    case 'starter':
      return 49; // £0.49
    case 'weekly':
      return 149; // £1.49
    case 'annual':
      return 1999; // £19.99
    default:
      return 0;
  }
}

function getCredits(priceId: string): number {
  switch (priceId) {
    case 'starter':
      return 10;
    case 'weekly':
      return 50;
    case 'annual':
      return 1000; // Effectively unlimited
    default:
      return 0;
  }
}