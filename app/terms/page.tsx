import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - MyMeme',
  description: 'MyMeme terms of service and conditions of use.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 mb-12">Last updated: February 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MyMeme (mymeme.uk), you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
            <p>MyMeme is an AI-powered image transformation service that converts uploaded photos into various artistic styles. We also offer photo animation and album creation features.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must be at least 13 years old to use our service.</li>
              <li>One account per person. Sharing accounts is not permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Credits & Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>New users receive 3 free credits upon registration.</li>
              <li>Additional credits can be purchased via our pricing page.</li>
              <li>Credits are non-refundable and non-transferable.</li>
              <li>One credit is consumed per image generation.</li>
              <li>If generation fails due to a system error, credits may be refunded at our discretion.</li>
              <li>Payments are processed securely by Stripe.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload images of others without their consent</li>
              <li>Generate content that is illegal, harmful, threatening, abusive, or violates any law</li>
              <li>Generate explicit, pornographic, or sexually suggestive content</li>
              <li>Use the service to harass, defame, or impersonate others</li>
              <li>Attempt to reverse-engineer, hack, or exploit the service</li>
              <li>Use automated tools to scrape or overload the service</li>
              <li>Resell generated images as stock photos or NFTs at scale without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p><strong className="text-white/80">Your Content:</strong> You retain ownership of photos you upload. By uploading, you grant us a temporary licence to process the image for the purpose of generating your transformation.</p>
            <p><strong className="text-white/80">Generated Content:</strong> You own the generated images and may use them for personal or commercial purposes, subject to these terms.</p>
            <p><strong className="text-white/80">Our Service:</strong> The MyMeme platform, brand, design, and technology are our intellectual property.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p>The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The service will be uninterrupted or error-free</li>
              <li>Generated images will meet your specific expectations</li>
              <li>Results will be identical each time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MyMeme shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:support@mymeme.uk" className="text-purple-400 hover:text-purple-300">support@mymeme.uk</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
