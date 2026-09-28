import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-blue-950/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">404</h2>
        <p className="text-blue-200 mb-6">Could not find the requested resource</p>
        <Link 
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}