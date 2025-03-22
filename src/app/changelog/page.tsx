import Footer from '@/components/ui/Footer'
import PublicNavbar from '@/components/ui/PublicNavbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog | Collab',
  description: 'Latest updates, improvements, and new features for the Collab platform.',
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-blue-900 to-white">
        <PublicNavbar />
        <main className="flex-grow">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-blue-600">Changelog</h1>
                <div className="space-y-12 bg-white p-8 rounded-lg shadow-sm">                      
                    <div className="border-l-4 border-blue-400 pl-6 py-6 hover:bg-blue-50 transition-colors duration-200">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl font-bold text-blue-600">v1.0.0</span>
                            <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                March 25, 2025
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Initial Release</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                Real-time collaborative code editing and sharing
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                Voice chat for team communication
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                GitHub integration for commits and pull requests
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                Advanced code syntax highlighting for multiple languages
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                User authentication and project workspace management
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                Real-time cursor tracking and presence indicators
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                Dark mode support and accessible UI
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  )
}