export default function Pricing() {
  const plans = [
    {
      title: 'Free Trial',
      price: '£0',
      features: ['1 Free Generation', 'Basic Styles', 'Low Resolution'],
      cta: 'Start Free',
      recommended: false
    },
    {
      title: 'Weekly Unlimited',
      price: '£1.49',
      features: ['Unlimited Generations', 'All Styles', 'High Resolution', 'Share Directly'],
      cta: 'Get Unlimited',
      recommended: true
    },
    {
      title: 'Per Generation',
      price: '£0.49',
      features: ['Single Generation', 'Choose Style', 'High Resolution', 'Save Image'],
      cta: 'Generate Now',
      recommended: false
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-background to-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-600">
          Simple Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.title}
              className={`
                p-6 rounded-lg shadow-lg text-center transform transition-all duration-300
                ${plan.recommended 
                  ? 'bg-purple-600 text-white scale-105 border-4 border-secondary' 
                  : 'bg-white text-gray-800 hover:bg-purple-50'}
              `}
            >
              <h3 className="text-2xl font-semibold mb-4">{plan.title}</h3>
              <div className="text-4xl font-bold mb-6">{plan.price}/week</div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm">
                    ✅ {feature}
                  </li>
                ))}
              </ul>
              <button className={`
                w-full py-3 rounded-full font-bold transition-colors
                ${plan.recommended 
                  ? 'bg-pink-500 text-white hover:bg-purple-700' 
                  : 'bg-purple-600/10 text-purple-600 hover:bg-purple-600/20'}
              `}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}