import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// SECURITY: Load environment variables (will be validated at request time)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

// Use service role key to bypass RLS for server-side operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    // SECURITY: Validate required environment variables at request time
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook not configured - missing STRIPE_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }

    // REQUIRED: Request must have signature
    if (!signature) {
      console.error('Webhook request missing stripe-signature header');
      return NextResponse.json(
        { error: 'Invalid webhook - missing signature' },
        { status: 400 }
      );
    }

    // REQUIRED: Verify signature before processing
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : String(err));
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      console.log(`Webhook: Processing payment for user ${userId}. Credits: ${credits}`);

      if (userId && credits > 0) {
        // Use RPC function to add credits (bypasses RLS via SECURITY DEFINER)
        const { error: rpcError } = await supabaseAdmin.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits
        });

        if (rpcError) {
          console.error('RPC add_credits error:', rpcError);
          // Fallback: Get current credits and add to them
          const { data: currentData } = await supabaseAdmin
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single();
          
          const currentCredits = currentData?.credits || 0;
          const newTotal = currentCredits + credits;
          
          const { error: upsertError } = await supabaseAdmin
            .from('user_credits')
            .upsert({ 
              user_id: userId, 
              credits: newTotal,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          
          if (upsertError) {
            console.error('Upsert fallback error:', upsertError);
          } else {
            console.log(`Fallback: Added ${credits} credits to user ${userId}. New total: ${newTotal}`);
          }
        } else {
          console.log(`Successfully added ${credits} credits to user ${userId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
