'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    { question: 'How does MyMeme work?', answer: 'Upload any photo, choose from 15+ AI art styles, and get a stunning transformation in under 10 seconds. Our AI preserves your facial features while applying the artistic style.' },
    { question: 'What styles are available?', answer: 'We offer Ghibli, Cyberpunk Neon, Renaissance, Oil Painting, Italian Brainrot, Anime, Pixar, GTA V, Caricature, Pop Art, Watercolor, Superhero, Comic Book, Pencil Sketch, Sticker, Retro 80s, Claymation, and more.' },
    { question: 'Is it free to try?', answer: 'Yes! You get 3 free generations when you sign up. No credit card required.' },
    { question: 'Can I use the images commercially?', answer: 'Yes! All generated images are yours to use for personal or commercial purposes.' },
    { question: 'Is my photo safe?', answer: 'Your photos are processed securely, never stored permanently, and never shared with third parties.' },
  ]

  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div>
          {faqs.map((faq, index) => (
            <div key={faq.question} className="border-b border-white/[0.06]">
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full text-left py-5 flex items-center justify-between group"
              >
                <span className={`text-lg font-medium transition-colors ${activeIndex === index ? 'text-purple-400' : 'text-white/80 group-hover:text-white'}`}>
                  {faq.question}
                </span>
                <motion.span animate={{ rotate: activeIndex === index ? 45 : 0 }} className="text-white/40 text-2xl flex-shrink-0 ml-4">
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="pb-5 text-white/50 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
