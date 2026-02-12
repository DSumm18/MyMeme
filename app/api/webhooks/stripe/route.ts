import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  const body = await request.text();

  // If webhook secret is set, verify signature
  const signature = request.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      console.log(`Processing payment for user ${userId}. Credits: ${credits}`);

      if (userId && credits > 0) {
        // Get current credits
        const { data: existing } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from('user_credits')
            .update({ credits: existing.credits + credits, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } else {
          // Insert new
          await supabase
            .from('user_credits')
            .insert({ user_id: userId, credits: credits });
        }

        console.log(`Successfully added ${credits} credits to user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
