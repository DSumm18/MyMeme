'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      features: ['3 Transformations', 'Watermarked', 'Basic Styles'],
      cta: 'Start Free',
      highlight: false
    },
    {
      name: 'Pro Weekly',
      price: '£1.49',
      period: '/week',
      features: ['Unlimited Transformations', 'No Watermarks', 'HD Downloads', 'All Styles'],
      cta: 'Go Pro',
      highlight: true
    },
    {
      name: 'Yearly',
      price: '£19.99',
      period: '/year',
      features: ['Save 60%', 'Unlimited Transformations', 'No Watermarks', 'HD Downloads', 'All Styles'],
      cta: 'Best Value',
      highlight: false
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Start Free, Upgrade When You're Hooked
      </h2>
      
      <div className="flex flex-col md:flex-row justify-center gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className={`
              w-full md:w-80 p-6 rounded-xl shadow-lg text-center 
              ${plan.highlight ? 'bg-[#FF6B9D] text-white' : 'bg-white border'}
            `}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <p className="text-4xl font-bold mb-2">
              {plan.price}
              <span className="text-lg">{plan.period || ''}</span>
            </p>
            
            <ul className="my-6 space-y-2">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className={plan.highlight ? 'text-white opacity-80' : 'text-gray-600'}>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-full py-3 rounded-full font-bold mt-4 transition-all
                  ${plan.highlight 
                    ? 'bg-white text-[#FF6B9D] hover:bg-gray-100' 
                    : 'bg-[#6BCB77] text-white hover:bg-green-600'}
                `}
              >
                {plan.cta}
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}