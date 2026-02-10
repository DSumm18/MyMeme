'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [activeStyle, setActiveStyle] = useState('caricature')
  
  const styles = [
    { 
      id: 'caricature', 
      name: 'Caricature', 
      image: '/style-caricature.jpg',
      description: 'Exaggerated, fun nurse style!' 
    },
    { 
      id: 'teacher', 
      name: 'Teacher', 
      image: '/style-teacher.jpg',
      description: 'Classroom-chic cartoon vibes!' 
    },
    { 
      id: 'anime', 
      name: 'Anime', 
      image: '/style-anime.jpg',
      description: 'Japanese anime office worker look!' 
    },
    { 
      id: 'watercolor', 
      name: 'Watercolor', 
      image: '/style-watercolor.jpg',
      description: 'Artistic watercolor chef style!' 
    }
  ]

  const pricingPlans = [
    {
      name: 'Free Trial',
      price: '£0',
      features: ['3 Watermarked Generations', 'Basic Styles'],
      emoji: '🆓'
    },
    {
      name: 'Pay-Per-Gen',
      price: '£0.49',
      features: ['Single High-Quality Meme', 'All Styles', 'No Watermark'],
      emoji: '🖼️'
    },
    {
      name: 'Weekly Unlimited',
      price: '£1.49',
      features: ['Unlimited Generations', 'All Styles', 'Social Media Ready'],
      emoji: '🚀'
    },
    {
      name: 'Annual Pass',
      price: '£19.99',
      features: ['Unlimited Generations', 'Exclusive Styles', 'Priority Support'],
      emoji: '🏆'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-bright-yellow/20 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-dark-blue animate-fade-in-up">
            Turn Your Work Selfie into a Hilarious Cartoon! 🤣
          </h1>
          <p className="text-xl mb-8 text-dark-blue/80">
            AI-powered caricatures that capture the humor of your 9-to-5 life
          </p>
          <Link 
            href="/create" 
            className="bg-primary-pink text-white px-8 py-3 rounded-full text-xl hover:bg-primary-pink/90 transition-all"
          >
            Create My Meme 🎨
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-dark-blue">How It Works 🚀</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md card-hover">
            <h3 className="text-xl font-semibold mb-4">📸 Upload Selfie</h3>
            <p>Snap or upload a fun work photo of yourself!</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md card-hover">
            <h3 className="text-xl font-semibold mb-4">💼 Enter Job Details</h3>
            <p>Tell us about your awesome job and personality!</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md card-hover">
            <h3 className="text-xl font-semibold mb-4">🎨 Get Caricature</h3>
            <p>Our AI creates a hilarious cartoon version of you!</p>
          </div>
        </div>
      </section>

      {/* Style Gallery */}
      <section className="bg-coral-orange/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark-blue">Choose Your Style 🌈</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {styles.map((style) => (
              <div 
                key={style.id}
                onClick={() => setActiveStyle(style.id)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all 
                  ${activeStyle === style.id 
                    ? 'bg-primary-pink/20 scale-105 border-2 border-primary-pink' 
                    : 'bg-white hover:bg-bright-yellow/20'}
                `}
              >
                <Image 
                  src={style.image} 
                  alt={style.name} 
                  width={300} 
                  height={300} 
                  className="rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold">{style.name}</h3>
                <p className="text-sm text-dark-blue/70">{style.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-mint-green/10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark-blue">Pricing Plans 💰</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name} 
                className="bg-white p-6 rounded-xl shadow-md card-hover text-center"
              >
                <div className="text-4xl mb-4">{plan.emoji}</div>
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-primary-pink mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm">{feature}</li>
                  ))}
                </ul>
                <Link 
                  href="/create" 
                  className="bg-bright-yellow px-6 py-2 rounded-full hover:bg-bright-yellow/90"
                >
                  Select Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark-blue">Frequently Asked Questions ❓</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">How does the AI work? 🤖</h3>
              <p>Our advanced AI analyzes your photo and job details to create a unique, humorous caricature!</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Can I use the memes on social media? 📱</h3>
              <p>Absolutely! Our memes are perfect for sharing on Instagram, Twitter, and more!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}