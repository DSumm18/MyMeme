'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useCredits } from '@/lib/credits-context';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const { user, signIn } = useAuth();
  const { credits } = useCredits();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free', credits: 3, price: 0, priceId: 'free', isFree: true,
      features: ['3 style transforms', 'All 15+ art styles', 'Instant download'],
    },
    {
      name: 'Starter', credits: 10, price: 0.49, priceId: 'starter',
      features: ['10 style transforms', 'OR 2 animations (5s)', 'All 15+ art styles'],
    },
    {
      name: 'Creator Pack', credits: 50, price: 1.49, priceId: 'weekly', badge: 'MOST POPULAR',
      features: ['50 style transforms', 'OR 10 animations (5s)', 'Mix & match styles + animations', 'Best value per credit'],
    },
    {
      name: 'Pro Unlimited', credits: 1000, price: 19.99, priceId: 'annual',
      features: ['Unlimited style transforms', '20 animations per month', 'Priority processing', 'Early access to new features'],
    }
  ];

  const handleBuyCredits = async (plan: typeof plans[0]) => {
    if (plan.isFree) return;
    if (!user) { signIn(); return; }
    setLoadingPlan(plan.priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId, userId: user.id })
      });
      const data = await response.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else { alert('Payment failed to start.'); setLoadingPlan(null); }
    } catch { alert('Something went wrong.'); setLoadingPlan(null); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Choose Your Plan</h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">Start free with 3 credits. Upgrade anytime.</p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
              <span className="text-sm text-white/60">Your balance:</span>
              <span className="text-lg font-bold text-purple-300">✨ {credits} credits</span>
            </div>
          )}
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
          {[
            { icon: '🎨', text: '1 credit = 1 transform' },
            { icon: '🎬', text: '5 credits = 5s animation' },
            { icon: '🎥', text: '10 credits = 10s animation' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
              <span>{item.icon}</span>
              <span className="text-white/60">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                plan.badge
                  ? 'bg-gradient-to-b from-purple-600/20 to-purple-900/10 border border-purple-500/30 scale-[1.02] glow-purple'
                  : 'glass-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-3xl font-black text-white">
                  {plan.price === 0 ? 'Free' : `£${plan.price.toFixed(2)}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-white/30 ml-1">one-time</span>}
              </div>
              <div className="text-sm font-semibold text-white/70 mb-4 pb-4 border-b border-white/[0.06]">
                {plan.credits.toLocaleString()} Credits
                {plan.price > 0 && <span className="text-white/30 font-normal ml-1">(£{(plan.price / plan.credits).toFixed(3)}/cr)</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="text-purple-400 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              {plan.isFree ? (
                <div className="w-full py-3 rounded-xl text-center text-sm text-white/30 bg-white/5">
                  {user ? 'Current Plan' : 'Sign up to start'}
                </div>
              ) : (
                <button
                  onClick={() => handleBuyCredits(plan)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    loadingPlan === plan.priceId
                      ? 'bg-white/10 text-white/30 cursor-wait'
                      : plan.badge
                        ? 'bg-white text-[#0a0a0f] hover:bg-gray-100'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {loadingPlan === plan.priceId ? 'Redirecting...' : 'Buy Now'}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center space-y-2">
          <p className="text-sm text-white/30">🔒 Secure payments by Stripe · Credits never expire</p>
        </div>
      </div>
    </div>
  );
}
