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

function BeforeAfterCard({ before, after, styleName, delay = 0 }: { before: string, after: string, styleName: string, delay?: number }) {
  const [showAfter, setShowAfter] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setShowAfter(prev => !prev), 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatedSection delay={delay}>
      <div className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
           onClick={() => setShowAfter(prev => !prev)}>
        <Image src={before} alt="Original photo" fill className={`object-cover transition-opacity duration-700 ${showAfter ? 'opacity-0' : 'opacity-100'}`} />
        <Image src={after} alt={`${styleName} style`} fill className={`object-cover transition-opacity duration-700 ${showAfter ? 'opacity-100' : 'opacity-0'}`} />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${showAfter ? 'bg-emerald-500/90 text-white' : 'bg-white/90 text-gray-800'}`}>
            {showAfter ? 'After ✨' : 'Before'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white font-semibold text-sm">{styleName}</p>
        </div>
      </div>
    </AnimatedSection>
  )
}

function StyleCard({ image, name, delay = 0 }: { image: string, name: string, delay?: number }) {
  return (
    <AnimatedSection delay={delay}>
      <Link href="/create" className="block group">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.03]">
          <Image src={image} alt={name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white font-bold text-sm text-center">{name}</p>
          </div>
        </div>
        <p className="mt-2 text-center text-sm font-medium text-gray-700">{name}</p>
      </Link>
    </AnimatedSection>
  )
}

function CountUp({ target, suffix = '' }: { target: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<HTMLElement>)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Home() {
  const { user } = useAuth()

  const beforeAfterExamples = [
    { before: '/styles/before.png', after: '/styles/anime.png', styleName: 'Anime' },
    { before: '/styles/before.png', after: '/styles/cyberpunk.png', styleName: 'Cyberpunk' },
    { before: '/styles/before.png', after: '/styles/oil-painting.png', styleName: 'Oil Painting' },
    { before: '/styles/before.png', after: '/styles/renaissance.png', styleName: 'Renaissance' },
    { before: '/styles/before.png', after: '/styles/caricature.png', styleName: 'Caricature' },
    { before: '/styles/before.png', after: '/styles/pop-art.png', styleName: 'Pop Art' },
  ]

  const trendingStyles = [
    { image: '/styles/pixar.png', name: 'Pixar 3D' },
    { image: '/styles/simpsons.png', name: 'Simpsons' },
    { image: '/styles/gta.png', name: 'GTA V' },
    { image: '/styles/lego.png', name: 'LEGO' },
    { image: '/styles/superhero.png', name: 'Superhero' },
    { image: '/styles/minecraft.png', name: 'Minecraft' },
    { image: '/styles/comic-book.png', name: 'Comic Book' },
    { image: '/styles/watercolor.png', name: 'Watercolor' },
    { image: '/styles/pencil-sketch.png', name: 'Pencil Sketch' },
    { image: '/styles/sticker.png', name: 'Sticker' },
    { image: '/styles/retro-80s.png', name: 'Retro 80s' },
    { image: '/styles/clay-3d.png', name: 'Clay 3D' },
  ]

  const reviews = [
    { name: 'Sarah M.', text: 'Turned my boring selfie into anime art in seconds. My friends thought I hired an artist!', rating: 5, avatar: '👩‍🎨' },
    { name: 'James T.', text: 'The GTA style is insane. Best profile pic I\'ve ever had. Worth every penny.', rating: 5, avatar: '🎮' },
    { name: 'Priya K.', text: 'Used it for my wedding photos — the oil painting versions are now hanging in our house.', rating: 5, avatar: '👰' },
    { name: 'Marcus D.', text: 'I run a social media page and this saves me hours. The quality is professional-grade.', rating: 5, avatar: '📱' },
    { name: 'Emma L.', text: 'Made my nan\'s old photos into beautiful watercolour prints. She cried. 10/10.', rating: 5, avatar: '🎨' },
    { name: 'Alex R.', text: 'The Pixar style made my kid\'s day. He thinks he\'s a real cartoon character now!', rating: 5, avatar: '🧒' },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a1a]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-2 rounded-full text-sm mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Over 50,000 photos transformed this month
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6 tracking-tight">
              Your Photo.
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Any Style.
              </span>
              <br />
              Instantly.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a photo. Choose from 14+ AI art styles. Get a stunning transformation in under 10 seconds. No design skills needed.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/create"
                className="bg-white text-[#0a0a1a] px-8 py-4 rounded-full text-lg font-bold hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                Try It Free →
              </Link>
              <a href="#examples" className="text-white/70 hover:text-white px-6 py-4 text-lg transition-colors">
                See Examples ↓
              </a>
            </div>
            <p className="text-white/40 text-sm mt-4">3 free generations · No sign-up required</p>
          </AnimatedSection>

          {/* Hero before/after showcase */}
          <AnimatedSection delay={500} className="mt-16">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
              {beforeAfterExamples.map((ex, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image src={ex.after} alt={ex.styleName} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs font-medium text-center">{ex.styleName}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-gray-900"><CountUp target={127000} suffix="+" /></p>
              <p className="text-sm text-gray-500 mt-1">Photos Transformed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-gray-900"><CountUp target={14} /></p>
              <p className="text-sm text-gray-500 mt-1">Art Styles</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-gray-900"><CountUp target={4} suffix=".9★" /></p>
              <p className="text-sm text-gray-500 mt-1">User Rating</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-gray-900">&lt;<CountUp target={10} suffix="s" /></p>
              <p className="text-sm text-gray-500 mt-1">Per Transform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section id="examples" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                See the Transformation
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Same photo, completely different vibes. Tap any image to toggle before/after.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {beforeAfterExamples.map((ex, i) => (
              <BeforeAfterCard key={i} {...ex} delay={i * 100} />
            ))}
          </div>

          <AnimatedSection delay={600} className="text-center mt-12">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Transform Your Photo →
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Trending Styles Gallery */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                🔥 Trending Now
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Explore All Styles
              </h2>
              <p className="text-gray-500 text-lg">
                From Pixar to Pencil Sketch — find the perfect look for your photo.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingStyles.map((style, i) => (
              <StyleCard key={style.name} {...style} delay={i * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Three Steps. Ten Seconds.
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📸', title: 'Upload', desc: 'Drop any photo — selfie, portrait, pet, anything.' },
              { step: '02', icon: '🎨', title: 'Choose Style', desc: 'Pick from 14 unique AI art styles.' },
              { step: '03', icon: '⚡', title: 'Download', desc: 'Get your HD artwork in under 10 seconds.' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 150}>
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-400 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Loved by Thousands
              </h2>
              <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl mb-2">
                ★★★★★
              </div>
              <p className="text-gray-500">4.9 out of 5 from 1,200+ reviews</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <AnimatedSection key={review.name} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <div className="text-yellow-400 text-sm">★★★★★</div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* More Products */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                More Ways to Create
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection delay={0}>
              <div className="relative p-8 rounded-3xl bg-[#0a0a1a] text-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px]" />
                <div className="relative">
                  <span className="text-4xl mb-4 block">🎬</span>
                  <h3 className="text-2xl font-bold mb-2">Photo Animation</h3>
                  <p className="text-white/60 mb-6">Bring old photos to life. Watch loved ones smile and move again with AI-powered animation.</p>
                  <Link href="/animate" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
                    Animate a Photo →
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="relative p-8 rounded-3xl bg-[#0a0a1a] text-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-600/20 rounded-full blur-[60px]" />
                <div className="relative">
                  <span className="text-4xl mb-4 block">📸</span>
                  <h3 className="text-2xl font-bold mb-2">Cinematic Albums</h3>
                  <p className="text-white/60 mb-6">Turn your photo collection into a professional video with music, transitions, and cinematic flair.</p>
                  <Link href="/album" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
                    Create Album →
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Simple Pricing
              </h2>
              <p className="text-gray-500 text-lg">Start free. No credit card required.</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <AnimatedSection delay={0}>
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-gray-900">£0</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                  <li className="flex items-center gap-2">✓ 3 generations</li>
                  <li className="flex items-center gap-2">✓ All styles</li>
                  <li className="flex items-center gap-2 text-gray-400">— Watermarked</li>
                </ul>
                <Link href="/create" className="block text-center py-3 rounded-full font-semibold border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors">
                  Get Started
                </Link>
              </div>
            </AnimatedSection>

            {/* Creator Pack */}
            <AnimatedSection delay={150}>
              <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl relative scale-105">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-lg font-bold mb-1">Creator Pack</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">£1.49</span>
                  <span className="text-sm text-white/60 ml-1">/ 50 credits</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-white/80">
                  <li className="flex items-center gap-2">✓ 50 HD generations</li>
                  <li className="flex items-center gap-2">✓ All 14 styles</li>
                  <li className="flex items-center gap-2">✓ No watermark</li>
                  <li className="flex items-center gap-2">✓ Priority speed</li>
                </ul>
                <Link href="/pricing" className="block text-center py-3 rounded-full font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors">
                  Get Credits →
                </Link>
              </div>
            </AnimatedSection>

            {/* Pro */}
            <AnimatedSection delay={300}>
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pro Unlimited</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-gray-900">£19.99</span>
                  <span className="text-sm text-gray-500 ml-1">/ year</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                  <li className="flex items-center gap-2">✓ Unlimited everything</li>
                  <li className="flex items-center gap-2">✓ Exclusive styles</li>
                  <li className="flex items-center gap-2">✓ Early access</li>
                  <li className="flex items-center gap-2">✓ Priority support</li>
                </ul>
                <Link href="/pricing" className="block text-center py-3 rounded-full font-semibold border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors">
                  Go Pro
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-[#0a0a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-600 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to See Yourself
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Like Never Before?
              </span>
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Join 50,000+ people who&apos;ve already discovered their artistic alter ego.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-white text-[#0a0a1a] px-10 py-5 rounded-full text-xl font-black hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              Start Creating — It&apos;s Free ✨
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
