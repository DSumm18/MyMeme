import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-purple-600 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">MyMeme</h3>
          <p className="text-sm text-white/80">
            Transform your selfie into a fun cartoon caricature in seconds!
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <nav className="space-y-2">
            <Link href="/" className="block hover:text-pink-500 transition">Home</Link>
            <Link href="/create" className="block hover:text-pink-500 transition">Create Cartoon</Link>
            <Link href="/privacy" className="block hover:text-pink-500 transition">Privacy Policy</Link>
            <Link href="/terms" className="block hover:text-pink-500 transition">Terms of Service</Link>
          </nav>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4">
            <a 
              href="https://twitter.com/mymeme" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition"
            >
              Twitter
            </a>
            <a 
              href="https://instagram.com/mymeme" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition"
            >
              Instagram
            </a>
            <a 
              href="mailto:support@mymeme.ai" 
              className="hover:text-pink-500 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm text-white/60 border-t border-white/20 pt-4">
        © {currentYear} MyMeme. All rights reserved.
      </div>
    </footer>
  )
}