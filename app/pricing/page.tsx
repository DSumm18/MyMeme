'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  name: string;
  credits: number;
  price: number;
  description: string;
  priceId: string;
  isFree?: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: 'Free',
      credits: 3,
      price: 0,
      description: 'Get started with basic meme creation',
      priceId: 'free',
      isFree: true
    },
    {
      name: 'Starter Pack',
      credits: 10,
      price: 0.49,
      description: 'Perfect for casual meme makers',
      priceId: 'starter'
    },
    {
      name: 'Weekly Pack',
      credits: 50,
      price: 1.49,
      description: 'For regular meme enthusiasts',
      priceId: 'weekly'
    },
    {
      name: 'Annual Unlimited',
      credits: 1000,
      price: 19.99,
      description: 'Unlimited styles + 20 animations/month',
      priceId: 'annual'
    }
  ];

  const handleBuyCredits = async (plan: PricingPlan) => {
    if (plan.isFree) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'user_placeholder';
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId
        })
      });

      const { checkoutUrl } = await response.json();
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-pink-600 mb-12">
          💖 MyMeme Credits 💖
        </h1>
        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-3xl p-6 shadow-2xl transform transition-all duration-300 
                ${plan.isFree ? 'border-2 border-pink-300' : 'hover:scale-105'}`}
            >
              <h2 className="text-2xl font-bold text-pink-600 mb-4">{plan.name}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-pink-500 mb-6">
                {plan.price === 0 ? 'Free' : `£${plan.price.toFixed(2)}`}
              </div>
              <div className="text-lg text-gray-700 mb-6">
                {plan.credits} Credits
              </div>
              {!plan.isFree && (
                <button
                  onClick={() => handleBuyCredits(plan)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-full text-white font-bold transition duration-300 ease-in-out
                    ${isLoading 
                      ? 'bg-pink-300 cursor-not-allowed' 
                      : 'bg-pink-500 hover:bg-pink-600 hover:scale-105'
                    }`}
                >
                  {isLoading ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}