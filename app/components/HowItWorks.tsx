export default function HowItWorks() {
  const steps = [
    { 
      title: 'Upload', 
      description: 'Take a selfie or upload an existing photo',
      icon: '📸'
    },
    { 
      title: 'Customize', 
      description: 'Enter your job title and choose your style',
      icon: '✨'
    },
    { 
      title: 'Share', 
      description: 'Generate and share your cartoon caricature',
      icon: '🚀'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-600">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="text-center p-6 bg-purple-50 rounded-lg shadow-md transform hover:scale-105 transition-transform"
            >
              <div className="text-6xl mb-4">{step.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-purple-600">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}