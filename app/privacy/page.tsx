import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - MyMeme',
  description: 'MyMeme privacy policy. Learn how we handle your data and protect your privacy.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 mb-12">Last updated: February 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>MyMeme (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website mymeme.uk. This Privacy Policy explains how we collect, use, and protect your information when you use our AI image transformation service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p><strong className="text-white/80">Account Information:</strong> When you sign in with Google, we receive your name, email address, and profile picture.</p>
            <p><strong className="text-white/80">Uploaded Images:</strong> Photos you upload are processed by our AI models to generate transformations. We do not permanently store your uploaded photos — they are processed in memory and discarded after generation.</p>
            <p><strong className="text-white/80">Generated Images:</strong> Results are hosted temporarily via our image processing provider and may be cached for a limited period.</p>
            <p><strong className="text-white/80">Usage Data:</strong> We collect anonymised analytics data including pages visited, features used, and device information to improve our service.</p>
            <p><strong className="text-white/80">Payment Information:</strong> Payments are processed by Stripe. We never see or store your full card details.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and improve our AI image transformation service</li>
              <li>To manage your account and credit balance</li>
              <li>To process payments securely via Stripe</li>
              <li>To send service-related communications</li>
              <li>To analyse usage patterns and improve our product (anonymised)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white/80">AI Processing Providers:</strong> Your uploaded images are sent to our AI providers (Runware, OpenAI) for processing. These providers process images per their own privacy policies.</li>
              <li><strong className="text-white/80">Stripe:</strong> Payment processing.</li>
              <li><strong className="text-white/80">Supabase:</strong> Authentication and database hosting.</li>
              <li><strong className="text-white/80">Vercel:</strong> Website hosting and analytics.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-white mb-3">5. Cookies</h2>
            <p>We use cookies for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white/80">Essential:</strong> Authentication, session management, security (always active).</li>
              <li><strong className="text-white/80">Statistics:</strong> Google Analytics to understand how visitors use our site (opt-in).</li>
              <li><strong className="text-white/80">Marketing:</strong> To deliver relevant content and measure campaign effectiveness (opt-in).</li>
            </ul>
            <p>You can manage your cookie preferences using the banner shown when you first visit our site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights (GDPR)</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:support@mymeme.uk" className="text-purple-400 hover:text-purple-300">support@mymeme.uk</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data Security</h2>
            <p>We implement industry-standard security measures including HTTPS encryption, secure authentication, and regular security reviews. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>Our service is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
            <p>For privacy inquiries: <a href="mailto:support@mymeme.uk" className="text-purple-400 hover:text-purple-300">support@mymeme.uk</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
