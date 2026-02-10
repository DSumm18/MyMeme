'use client'

import { useState } from 'react'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How does MyMeme work?',
      answer: 'Simply upload a selfie, enter your job title, and choose an art style. Our AI will generate a fun cartoon caricature of you at work in seconds!'
    },
    {
      question: 'What styles are available?',
      answer: 'We offer multiple styles including Caricature (default), Watercolour, Anime, and Pop Art. More styles are coming soon!'
    },
    {
      question: 'Can I use the image on social media?',
      answer: 'Absolutely! We provide easy-to-use sharing options for Facebook, Instagram, WhatsApp, and more. You can also download your image in various formats.'
    },
    {
      question: 'Is my photo safe?',
      answer: 'Yes! We take your privacy seriously. Your photos are processed securely and are not stored or shared without your consent.'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-600">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq.question} 
              className="border-b border-gray-200 pb-4"
            >
              <button 
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full text-left flex justify-between items-center py-4 focus:outline-none"
              >
                <span className={`
                  text-lg font-semibold 
                  ${activeIndex === index ? 'text-purple-600' : 'text-gray-800'}
                `}>
                  {faq.question}
                </span>
                <span className="text-purple-600 text-2xl">
                  {activeIndex === index ? '−' : '+'}
                </span>
              </button>
              {activeIndex === index && (
                <p className="text-gray-600 mt-2 animate-fadeIn">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}