'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { StyleConfig } from '@/lib/styles-config'

/* ─── Upload Tool (self-contained) ─── */
function InlineUploadTool({ styleName, styleSlug }: { styleName: string; styleSlug: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      sessionStorage.setItem('mymeme_upload', e.target?.result as string)
      window.location.href = `/create?style=${styleSlug}`
    }
    reader.readAsDataURL(file)
  }, [styleSlug])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center ${
        isDragging
          ? 'border-[#FF90E8] bg-[#FF90E8]/10 scale-[1.02]'
          : 'border-gray-300 hover:border-[#FF90E8] hover:bg-[#FFF0FB]'
      }`}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF90E8]/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-[#FF90E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-900 font-bold text-lg mb-1">Upload your photo for {styleName}</p>
      <p className="text-gray-400 text-sm">Drop your photo here or click to browse · JPG, PNG up to 10MB</p>
      <p className="text-[#FF90E8] text-sm font-semibold mt-3">3 free credits · No sign-up required</p>
    </div>
  )
}

/* ─── Before/After ─── */
function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div className="group">
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative aspect-square">
          <Image src={before} alt="Original" fill className="object-cover" />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-gray-600">Before</span>
          </div>
        </div>
        <div className="relative aspect-square">
          <Image src={after} alt={`${label} style`} fill className="object-cover" />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF90E8] text-white">After</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── FAQ ─── */
function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200">
      <button onClick={onClick} className="w-full text-left py-5 flex items-center justify-between group">
        <span className={`text-lg font-semibold transition-colors ${open ? 'text-[#FF90E8]' : 'text-gray-900 group-hover:text-gray-600'}`}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-gray-400 text-2xl flex-shrink-0 ml-4">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-5 text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══ STYLE PAGE ═══ */
export default function StylePageClient({ style, relatedStyles }: { style: StyleConfig; relatedStyles: StyleConfig[] }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 bg-[#FF90E8]/10 text-[#FF90E8] px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <span className="text-lg">{style.emoji}</span>
                  {style.hot ? '🔥 Trending Style' : 'AI Art Style'}
                </div>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight">
                {style.name}
                <br />
                <span className="text-[#FF90E8]">AI Filter</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                {style.longDescription}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
                <Link
                  href={`/create?style=${style.slug}`}
                  className="px-8 py-4 rounded-full text-lg font-black bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
                >
                  Try {style.name} — Free ✨
                </Link>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-gray-400 text-sm">
                3 free credits · No sign-up required · ~10 seconds
              </motion.p>
            </div>

            {/* Right: Style preview */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square max-w-md mx-auto">
                <Image src={style.image} alt={`${style.name} AI art style example`} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold px-4 py-2 rounded-full">
                    {style.emoji} {style.name} Style
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE/AFTER EXAMPLES ═══ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">See the {style.name} Transformation</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Same photo, completely different world. See what our AI does with the {style.name} style.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <BeforeAfter before="/examples/before.png" after={style.image} label={style.name} />
            <BeforeAfter before="/examples/before.png" after={style.image} label={`${style.name} v2`} />
            <BeforeAfter before="/examples/before.png" after={style.image} label={`${style.name} v3`} />
          </div>
        </div>
      </section>

      {/* ═══ UPLOAD TOOL ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Try {style.name} Now</h2>
            <p className="text-gray-500 text-lg">Upload your photo and see the magic in seconds.</p>
          </div>
          <InlineUploadTool styleName={style.name} styleSlug={style.slug} />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How {style.name} Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📸', title: 'Upload Your Photo', desc: `Drop any photo — selfie, portrait, pet. Our AI handles the rest.`, bg: 'bg-[#FFF0FB]' },
              { step: '02', icon: style.emoji, title: `Apply ${style.name}`, desc: `Our AI transforms your photo with the ${style.name} aesthetic in seconds.`, bg: 'bg-[#F0F7FF]' },
              { step: '03', icon: '⬇️', title: 'Download & Share', desc: 'Get your HD artwork instantly. Share on social media or print it.', bg: 'bg-[#F0FFF4]' },
            ].map((item) => (
              <div key={item.step} className={`${item.bg} rounded-3xl p-8 text-center border-2 border-gray-100`}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-gray-400 mb-2 tracking-widest">STEP {item.step}</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STYLE TAGS / SEO CONTENT ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">About {style.name} Style</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">{style.longDescription}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {style.tags.map((tag) => (
              <span key={tag} className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{style.name} FAQ</h2>
          </div>
          <div>
            {style.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} open={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RELATED STYLES ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Explore More Styles</h2>
            <p className="text-gray-500">Love {style.name}? Try these other popular styles.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedStyles.map((s) => (
              <Link key={s.slug} href={`/styles/${s.slug}`} className="group">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm">{s.emoji} {s.name}</p>
                    <p className="text-white/70 text-xs">{s.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-black bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg">
              View All Styles →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 md:py-28 bg-[#FF90E8]/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Ready to Try
            <br />
            <span className="text-[#FF90E8]">{style.name}?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Upload your photo now and see the transformation in seconds. 3 free credits, no sign-up needed.
          </p>
          <Link
            href={`/create?style=${style.slug}`}
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full text-xl font-black bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            Try {style.name} — Free ✨
          </Link>
        </div>
      </section>
    </div>
  )
}
