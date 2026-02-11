'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

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
  const [activeStyleIdx, setActiveStyleIdx] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const styles = [
    { id: 'caricature', name: 'Caricature', emoji: '🎨', color: 'from-pink-400 to-rose-500', description: 'Big head, big personality!' },
    { id: 'anime', name: 'Anime', emoji: '⚡', color: 'from-purple-400 to-indigo-500', description: 'Japanese anime style!' },
    { id: 'pixar', name: 'Pixar', emoji: '✨', color: 'from-teal-400 to-cyan-500', description: '3D animated character!' },
    { id: 'gta', name: 'GTA Style', emoji: '🔫', color: 'from-violet-500 to-purple-700', description: 'Loading screen vibes!' },
    { id: 'superhero', name: 'Superhero', emoji: '🦸', color: 'from-red-400 to-red-600', description: 'Comic book hero!' },
    { id: 'clay-3d', name: 'Claymation', emoji: '🧊', color: 'from-orange-400 to-amber-500', description: 'Sculpted clay figure!' },
    { id: 'simpsons', name: 'Simpsons', emoji: '🟡', color: 'from-yellow-300 to-yellow-500', description: 'Yellow cartoon character!' },
    { id: 'watercolor', name: 'Watercolor', emoji: '🖌️', color: 'from-blue-300 to-blue-500', description: 'Soft artistic portrait!' },
    { id: 'pop-art', name: 'Pop Art', emoji: '💥', color: 'from-yellow-400 to-pink-500', description: 'Bold comic book vibes!' },
    { id: 'renaissance', name: 'Oil Painting', emoji: '🖼️', color: 'from-amber-600 to-amber-800', description: 'Classic masterpiece!' },
    { id: 'pencil-sketch', name: 'Pencil Sketch', emoji: '✏️', color: 'from-gray-400 to-gray-600', description: 'Hand-drawn artistry!' },
    { id: 'comic-book', name: 'Comic Book', emoji: '💬', color: 'from-green-400 to-emerald-500', description: 'Bold ink outlines!' },
    { id: 'lego', name: 'Lego', emoji: '🧱', color: 'from-yellow-400 to-red-500', description: 'Blocky toy character!' },
    { id: 'sticker', name: 'Sticker', emoji: '🏷️', color: 'from-emerald-300 to-teal-400', description: 'Die-cut cool vibes!' },
    { id: 'retro-80s', name: 'Retro 80s', emoji: '🕹️', color: 'from-fuchsia-500 to-pink-600', description: 'Synthwave nostalgia!' },
    { id: 'minecraft', name: 'Minecraft', emoji: '⛏️', color: 'from-green-600 to-emerald-800', description: 'Pixelated block world!' },
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStyleIdx(prev => (prev + 1) % styles.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [styles.length])

  const faqs = [
    { q: 'How does MyMeme work?', a: 'Upload a selfie, tell us your job, and our AI creates a fun cartoon caricature of you at work — complete with workplace details, accessories, and your personality!' },
    { q: 'Do I need to write a prompt?', a: 'Nope! Just fill in simple fields — your job, accessories you want, and location. We handle the AI magic behind the scenes.' },
    { q: 'Can I use my caricature on social media?', a: 'Absolutely! We auto-resize for Instagram, Facebook, WhatsApp, TikTok and more. One click and you\'re ready to share.' },
    { q: 'Is my photo safe?', a: 'Yes. We don\'t store your photos after generation. Your selfie is processed and immediately deleted. Privacy first.' },
    { q: 'What about the meme maker?', a: 'After generating your caricature, tap "Make it a Meme" to put your cartoon face into famous meme templates. Add your own text and share!' },
    { q: 'How much does it cost?', a: 'Try 3 free generations (watermarked). Then just £0.49 per image, or £1.49/week for unlimited. Our costs are ~£0.002 per image so we pass the savings to you!' },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#FF6B9D] text-white text-sm font-bold px-4 py-1 rounded-full mb-6">
              🔥 #1 Viral Trend 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6" style={{ color: '#1A1A2E' }}>
              Turn Your <span className="text-[#FF6B9D]">Selfie</span> Into Art
            </h1>
            <p className="text-xl mb-8 text-gray-600 leading-relaxed">
              Upload any photo and our AI transforms you into 16 incredible styles — Anime, Pixar, GTA, Superhero and more.
              <span className="font-bold"> In seconds.</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/create" className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full text-xl font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 inline-block">
                Create My Meme 🎨
              </Link>
              <a href="#how-it-works" className="border-2 border-[#1A1A2E] text-[#1A1A2E] px-8 py-4 rounded-full text-xl font-bold hover:bg-[#1A1A2E] hover:text-white transition-all duration-300 inline-block">
                See How It Works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span>✅ 3 Free Generations</span>
              <span>✅ No Account Needed</span>
              <span>✅ Instant Results</span>
            </div>
          </div>
          {/* Style Carousel */}
          <div className="relative">
            <div className={`bg-gradient-to-br ${styles[activeStyleIdx].color} rounded-3xl shadow-2xl p-8 transition-all duration-500 min-h-[400px] flex flex-col items-center justify-center text-white`}>
              <div className="text-8xl mb-4 animate-bounce">{styles[activeStyleIdx].emoji}</div>
              <h3 className="text-3xl font-black mb-2">{styles[activeStyleIdx].name}</h3>
              <p className="text-lg opacity-90">{styles[activeStyleIdx].description}</p>
              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                Your photo → {styles[activeStyleIdx].name} style
              </div>
            </div>
            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-4">
              {styles.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStyleIdx(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i === activeStyleIdx ? 'bg-[#FF6B9D] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-[#1A1A2E] py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-white text-center">
          <span className="font-bold">🎨 50+ Art Styles</span>
          <span className="font-bold">⚡ 10 Second Generation</span>
          <span className="font-bold">📱 Auto-Sized for Social Media</span>
          <span className="font-bold">😂 Meme Maker Built In</span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4" style={{ color: '#1A1A2E' }}>
            How It Works
          </h2>
          <p className="text-center text-gray-500 text-lg mb-16 max-w-2xl mx-auto">Three steps. No prompts. No AI knowledge needed.</p>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '1', icon: '📸', title: 'Upload Your Selfie', desc: 'Take a photo or upload one from your camera roll. Works with any clear face photo.', color: '#FF6B9D' },
            { num: '2', icon: '💼', title: 'Enter Your Details', desc: 'Your job title, favourite accessories, and where you work. We build the scene around YOU.', color: '#FFD93D' },
            { num: '3', icon: '🎉', title: 'Bring It to Life!', desc: 'Your meme is generated in seconds. Turn it into an animated meme, share it everywhere, go viral!', color: '#6BCB77' },
          ].map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 150}>
              <div className="text-center p-8 rounded-3xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: step.color + '20' }}>
                  {step.icon}
                </div>
                <div className="text-6xl font-black mb-4" style={{ color: step.color + '40' }}>{step.num}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A2E' }}>{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Style Gallery */}
      <section className="py-20 bg-gradient-to-b from-[#FFF5E1] to-white">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4" style={{ color: '#1A1A2E' }}>
              Pick Your Style 🎨
            </h2>
            <p className="text-center text-gray-500 text-lg mb-16">Every style is AI-generated. Every one looks incredible.</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {styles.map((style, i) => (
              <AnimatedSection key={style.id} delay={i * 100}>
                <Link href={`/create?style=${style.id}`}
                  className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 group block hover:scale-105 hover:shadow-lg`}
                >
                  <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                    <span className="text-6xl group-hover:scale-125 transition-transform duration-300">{style.emoji}</span>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg" style={{ color: '#1A1A2E' }}>{style.name}</h3>
                    <p className="text-sm text-gray-500">{style.description}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="py-20 bg-[#FF6B9D]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to See Yourself as a Cartoon?</h2>
          <p className="text-xl mb-10 opacity-90">Join thousands of nurses, teachers, and office workers who&apos;ve gone viral with their AI caricatures.</p>
          <Link href="/create" className="bg-white text-[#FF6B9D] px-10 py-5 rounded-full text-2xl font-black hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-block">
            Try It Free — No Sign Up 🚀
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4" style={{ color: '#1A1A2E' }}>
              Simple Pricing 💰
            </h2>
            <p className="text-center text-gray-500 text-lg mb-16">Start free. Upgrade when you&apos;re addicted.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Free Trial', price: '£0', period: '', features: ['3 Generations', 'Watermarked', 'Basic Styles'], color: '#6BCB77', popular: false },
              { name: 'Per Image', price: '£0.49', period: '/image', features: ['Single HD Image', 'All Styles', 'No Watermark', 'Social Sizing'], color: '#FFD93D', popular: false },
              { name: 'Weekly', price: '£1.49', period: '/week', features: ['Unlimited Generations', 'All Styles', 'Meme Maker', 'Priority Speed', 'Social Sizing'], color: '#FF6B9D', popular: true },
              { name: 'Annual', price: '£19.99', period: '/year', features: ['Unlimited Everything', 'Exclusive Styles', 'Early Access', 'Priority Support'], color: '#FF8C42', popular: false },
            ].map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 100}>
                <div className={`relative p-8 rounded-3xl transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'bg-[#FF6B9D] text-white shadow-2xl scale-105 border-0' 
                    : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD93D] text-[#1A1A2E] text-sm font-black px-4 py-1 rounded-full">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.popular ? '' : ''}`} style={plan.popular ? {} : { color: '#1A1A2E' }}>{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'opacity-80' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span>{plan.popular ? '✅' : '✓'}</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/create" className={`block text-center py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'bg-white text-[#FF6B9D]' 
                      : 'text-white'
                  }`} style={plan.popular ? {} : { backgroundColor: plan.color }}>
                    {plan.price === '£0' ? 'Start Free' : 'Get Started'}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16" style={{ color: '#1A1A2E' }}>
              Questions? 🤔
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-6 font-bold text-lg flex justify-between items-center"
                    style={{ color: '#1A1A2E' }}
                  >
                    {faq.q}
                    <span className={`text-2xl transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-6 px-6' : 'max-h-0'}`}>
                    <p className="text-gray-500">{faq.a}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#FF6B9D] via-[#FF8C42] to-[#FFD93D]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Your Meme is Waiting 🎨</h2>
          <p className="text-xl mb-10 opacity-90">3 free generations. No account needed. Takes 10 seconds.</p>
          <Link href="/create" className="bg-white text-[#FF6B9D] px-10 py-5 rounded-full text-2xl font-black hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-block">
            Create My Meme — Free ✨
          </Link>
        </div>
      </section>
    </div>
  )
}
