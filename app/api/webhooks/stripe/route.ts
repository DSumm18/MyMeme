import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Use service role key to bypass RLS for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
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
      event = JSON.parse(body) as Stripe.Event;
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
          // Fallback: direct upsert with service role
          const { error: upsertError } = await supabaseAdmin
            .from('user_credits')
            .upsert({ 
              user_id: userId, 
              credits: credits,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          
          if (upsertError) {
            console.error('Upsert fallback error:', upsertError);
          } else {
            console.log(`Fallback: Added ${credits} credits to user ${userId}`);
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
