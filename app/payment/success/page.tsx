'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B9D', '#FFC0CB', '#FF69B4']
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md">
        <h1 className="text-4xl font-bold text-pink-500 mb-6">🎉 Payment Successful! 🎉</h1>
        <p className="text-xl text-gray-700 mb-8">
          Credits have been added to your account. Get creative and start making awesome memes!
        </p>
        <Link 
          href="/create" 
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Creating
        </Link>
      </div>
    </div>
  );
}