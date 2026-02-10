import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="py-16 px-4 text-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Turn Yourself Into a Cartoon
        </h1>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Upload a selfie, enter your job, and let AI transform you into a fun, personalized cartoon caricature!
        </p>
        <Link 
          href="/create" 
          className="bg-purple-600 text-white hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full text-xl shadow-lg hover:shadow-xl inline-block transform hover:scale-105"
        >
          Create Your Cartoon Now
        </Link>
        
        {/* Example Styles Gallery */}
        <div className="mt-16 flex justify-center space-x-4">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transform hover:scale-110 transition">
            <Image 
              src="/style-caricature.jpg" 
              alt="Caricature Style" 
              width={200} 
              height={200} 
              className="object-cover"
            />
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transform hover:scale-110 transition">
            <Image 
              src="/style-anime.jpg" 
              alt="Anime Style" 
              width={200} 
              height={200} 
              className="object-cover"
            />
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transform hover:scale-110 transition">
            <Image 
              src="/style-watercolor.jpg" 
              alt="Watercolor Style" 
              width={200} 
              height={200} 
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}