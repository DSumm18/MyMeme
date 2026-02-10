export default function Footer() {
  return (
    <footer className="bg-mint-green text-dark-blue py-12 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">🎨 MyMeme</h3>
          <p className="text-sm">Transform your work life into a hilarious cartoon adventure!</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/create" className="hover:text-primary-pink">Create Meme 🖌️</a></li>
            <li><a href="/#pricing" className="hover:text-primary-pink">Pricing 💰</a></li>
            <li><a href="/#faq" className="hover:text-primary-pink">FAQ ❓</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4">
            <a href="#" className="text-2xl">📸</a>
            <a href="#" className="text-2xl">🐦</a>
            <a href="#" className="text-2xl">📘</a>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm">
        © {new Date().getFullYear()} MyMeme. All rights reserved. 🚀
      </div>
    </footer>
  )
}