'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold: 0.1 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()

  const products = [
    {
      id: 'transform',
      title: 'Instant Art Makeover',
      tagline: '14 Styles. One Click. Pure Magic.',
      description: 'Transform any photo into stunning artistic styles. From Anime to Renaissance painting, your creativity knows no bounds.',
      icon: '🎨',
      useCase: 'Create unique profile pics, social media posts, and personal art.',
      color: 'bg-gradient-to-r from-pink-400 to-rose-500',
      cta: '/create'
    },
    {
      id: 'animate',
      title: 'Memories in Motion',
      tagline: 'Bring Your Forgotten Moments to Life',
      description: 'Revive old photos with AI-powered animation. Watch loved ones smile, move, and reconnect with cherished memories.',
      icon: '🎬',
      useCase: 'Bring family photos from the 80s and 90s back to life.',
      color: 'bg-gradient-to-r from-purple-400 to-indigo-500',
      cta: '/animate'
    },
    {
      id: 'album',
      title: 'Your Story, Animated',
      tagline: 'Cinema-Quality Memory Videos',
      description: 'Create professional, emotionally-rich photo albums with music, transitions, and cinematic flair.',
      icon: '📸',
      useCase: 'Transform your photo collection into a stunning narrative.',
      color: 'bg-gradient-to-r from-teal-400 to-cyan-500',
      cta: '/album'
    }
  ]

  const pricing = [
    { 
      name: 'Free Trial', 
      price: '£0', 
      period: '', 
      features: ['3 Generations', 'Watermarked', 'Basic Styles'], 
      color: 'from-green-400 to-emerald-500',
      popular: false 
    },
    { 
      name: 'Per Image', 
      price: '£0.49', 
      period: '/image', 
      features: ['Single HD Image', 'All Styles', 'No Watermark', 'Social Sizing'], 
      color: 'from-yellow-400 to-amber-500',
      popular: false 
    },
    { 
      name: 'Creator Pack', 
      price: '£1.49', 
      period: '/50 credits', 
      features: ['Unlimited Generations', 'All Styles', 'Meme Maker', 'Priority Speed'], 
      color: 'from-pink-400 to-rose-500',
      popular: true 
    },
    { 
      name: 'Pro Unlimited', 
      price: '£19.99', 
      period: '/year', 
      features: ['Unlimited Everything', 'Exclusive Styles', 'Early Access', 'Priority Support'], 
      color: 'from-purple-400 to-indigo-500',
      popular: false 
    },
  ]

  const howItWorks = [
    {
      product: 'Style Transform',
      steps: [
        { icon: '📸', title: 'Upload Photo', description: 'Any photo works — selfie, portrait, group shot.' },
        { icon: '🎨', title: 'Pick Style', description: 'Choose from 14 incredible art styles.' },
        { icon: '⚡', title: 'Get Your Art', description: 'AI transforms your photo in seconds.' }
      ]
    },
    {
      product: 'Photo Animation',
      steps: [
        { icon: '🖼️', title: 'Select Photo', description: 'Choose a memorable old photo.' },
        { icon: '🎬', title: 'Set Animation', description: 'Choose subtle motion effects.' },
        { icon: '📱', title: 'Bring to Life', description: 'Watch your photo come alive.' }
      ]
    },
    {
      product: 'Animated Album',
      steps: [
        { icon: '📂', title: 'Upload Collection', description: 'Select 9-12 meaningful photos.' },
        { icon: '🎵', title: 'Add Music', description: 'Choose a soundtrack that fits your story.' },
        { icon: '🎥', title: 'Create Album', description: 'Generate a cinema-quality video.' }
      ]
    }
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <h1 className="text-5xl md:text-7xl font-black text-center leading-tight mb-6" style={{ color: '#1A1A2E' }}>
              Transform, Animate & Relive <br />
              <span className="text-[#FF6B9D]">Your Memories</span>
            </h1>
            <p className="text-xl text-center mb-10 text-gray-600 max-w-3xl mx-auto">
              Turn any photo into art, breathe life into forgotten moments, and create cinematic story albums — all with AI magic.
            </p>
          </AnimatedSection>

          {/* Product Preview Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <AnimatedSection key={product.id} delay={idx * 150}>
                <div className={`p-6 rounded-3xl text-white ${product.color} hover:scale-105 transition-transform duration-300`}>
                  <div className="text-4xl mb-4">{product.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                  <p className="text-sm opacity-80 mb-4">{product.tagline}</p>
                  <p className="mb-6 text-white/90">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <Link 
                      href={product.cta} 
                      className="bg-white text-[#1A1A2E] px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                      {product.id === 'album' ? 'Create Album' : `Try ${product.title}`}
                    </Link>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {product.useCase}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16" style={{ color: '#1A1A2E' }}>
              How Each Product Works
            </h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((product, idx) => (
              <AnimatedSection key={product.product} delay={idx * 150}>
                <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-6 text-[#FF6B9D]">{product.product}</h3>
                  {product.steps.map((step, stepIdx) => (
                    <div key={step.title} className="flex items-center mb-4 last:mb-0">
                      <div className="text-3xl mr-4 opacity-70">{step.icon}</div>
                      <div>
                        <h4 className="font-bold">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-[#FFF5E1] to-white">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4" style={{ color: '#1A1A2E' }}>
              Simple, Flexible Pricing
            </h2>
            <p className="text-center text-gray-500 text-lg mb-16">Start free. Create magic. No commitment.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            {pricing.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 100}>
                <div className={`relative p-8 rounded-3xl transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${plan.color} ${
                  plan.popular ? 'scale-105 shadow-2xl' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD93D] text-[#1A1A2E] text-sm font-black px-4 py-1 rounded-full">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-sm text-white/80">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-white/90">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        ✅ {f}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/pricing" 
                    className={`block text-center py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                      plan.popular 
                        ? 'bg-white text-[#FF6B9D]' 
                        : 'text-white bg-white/20'
                    }`}
                  >
                    {plan.price === '£0' ? 'Start Free' : 'Choose Plan'}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Album Pricing */}
          <AnimatedSection delay={400} className="mt-12">
            <div className="bg-[#1A1A2E] text-white p-8 rounded-3xl text-center">
              <h3 className="text-3xl font-black mb-4">Animated Photo Album</h3>
              <p className="text-xl mb-6 text-white/80">Professional memory videos that tell your story</p>
              <div>
                <span className="text-4xl font-black">£29.99</span>
                <span className="text-sm text-white/80"> per album</span>
              </div>
              <p className="mt-4 text-white/70">Cinema-quality video. Personalized music. Unforgettable memories.</p>
              <Link 
                href="/album" 
                className="mt-6 inline-block bg-[#FF6B9D] text-white px-10 py-4 rounded-full text-xl font-black hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                Create Premium Album
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#FF6B9D] via-[#FF8C42] to-[#FFD93D]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Your Memories Are Waiting</h2>
          <p className="text-xl mb-10 opacity-90">Transform, animate, and relive. 3 free generations to start.</p>
          <Link 
            href="/create" 
            className="bg-white text-[#FF6B9D] px-10 py-5 rounded-full text-2xl font-black hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-block"
          >
            Start Creating Free ✨
          </Link>
        </div>
      </section>
    </div>
  )
}