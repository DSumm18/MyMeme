'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCredits } from '@/lib/credits-context';

export default function PricingPage() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const { credits } = useCredits();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      credits: 3,
      price: 0,
      priceId: 'free',
      isFree: true,
      color: 'from-gray-100 to-gray-50',
      accent: 'text-gray-600',
      badge: null,
      features: [
        '3 style transforms',
        'All 14 art styles',
        'Instant download',
      ]
    },
    {
      name: 'Starter',
      credits: 10,
      price: 0.49,
      priceId: 'starter',
      color: 'from-blue-50 to-indigo-50',
      accent: 'text-indigo-600',
      badge: null,
      features: [
        '10 style transforms',
        'OR 2 animations (5s)',
        'OR 1 animation (10s)',
        'All 14 art styles',
      ]
    },
    {
      name: 'Weekly',
      credits: 50,
      price: 1.49,
      priceId: 'weekly',
      color: 'from-purple-50 to-pink-50',
      accent: 'text-purple-600',
      badge: '⭐ Most Popular',
      features: [
        '50 style transforms',
        'OR 10 animations (5s)',
        'OR 5 animations (10s)',
        'Mix & match styles + animations',
        'Best value per credit',
      ]
    },
    {
      name: 'Annual',
      credits: 1000,
      price: 19.99,
      priceId: 'annual',
      color: 'from-amber-50 to-orange-50',
      accent: 'text-amber-600',
      badge: '👑 Best Deal',
      features: [
        'Unlimited style transforms',
        '20 animations per month',
        'Priority processing',
        'Early access to new features',
        'Album builder (coming soon)',
      ]
    }
  ];

  const handleBuyCredits = async (plan: typeof plans[0]) => {
    if (plan.isFree) return;

    if (!user) {
      signIn();
      return;
    }

    setLoadingPlan(plan.priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId, userId: user.id })
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('No checkout URL:', data);
        alert('Payment failed to start. Please try again.');
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Start free with 3 credits. Upgrade anytime to unlock more styles and animations.
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-gray-700">Your balance:</span>
              <span className="text-lg font-bold text-purple-700">✨ {credits} credits</span>
            </div>
          )}
        </div>

        {/* Credit Explainer */}
        <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-lg">🎨</span>
            <span className="text-gray-600"><strong>1 credit</strong> = 1 style transform</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-lg">🎬</span>
            <span className="text-gray-600"><strong>5 credits</strong> = 5s animation</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-lg">🎥</span>
            <span className="text-gray-600"><strong>10 credits</strong> = 10s animation</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative bg-gradient-to-b ${plan.color} rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg
                ${plan.badge === '⭐ Most Popular' ? 'border-purple-300 shadow-lg ring-2 ring-purple-200 scale-[1.02]' : 'border-gray-200'}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white
                  ${plan.badge.includes('Popular') ? 'bg-purple-500' : 'bg-amber-500'}`}>
                  {plan.badge}
                </div>
              )}
              
              <h2 className={`text-xl font-bold ${plan.accent} mb-1`}>{plan.name}</h2>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Free' : `£${plan.price.toFixed(2)}`}
                </span>
                {plan.price > 0 && plan.priceId !== 'annual' && (
                  <span className="text-sm text-gray-400 ml-1">one-time</span>
                )}
                {plan.priceId === 'annual' && (
                  <span className="text-sm text-gray-400 ml-1">/year</span>
                )}
              </div>

              <div className="text-sm font-semibold text-gray-700 mb-4 pb-4 border-b border-gray-200">
                {plan.credits.toLocaleString()} Credits
                {plan.price > 0 && (
                  <span className="text-gray-400 font-normal ml-1">
                    (£{(plan.price / plan.credits).toFixed(3)}/credit)
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.isFree ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-medium text-gray-400 bg-gray-100">
                  {user ? 'Current Plan' : 'Sign up to start'}
                </div>
              ) : (
                <button
                  onClick={() => handleBuyCredits(plan)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3 rounded-xl text-white font-bold transition-all duration-200
                    ${loadingPlan === plan.priceId
                      ? 'bg-gray-300 cursor-not-allowed'
                      : plan.badge === '⭐ Most Popular'
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                        : plan.priceId === 'annual'
                          ? 'bg-amber-500 hover:bg-amber-600 shadow-md hover:shadow-lg'
                          : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                >
                  {loadingPlan === plan.priceId ? 'Redirecting to Stripe...' : 'Buy Now'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-sm text-gray-400">
            🔒 Secure payments by Stripe. Charges appear as <strong>SCHOOLGLE LTD</strong>.
          </p>
          <p className="text-xs text-gray-300">
            Credits never expire. Animations use more credits because they cost more to generate.
          </p>
        </div>
      </div>
    </div>
  );
}
