import Footer from '@/components/ui/Footer'
import PublicNavbar from '@/components/ui/PublicNavbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data protection information for Collab users.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
        <PublicNavbar/>
        <main className="flex-grow bg-gradient-to-b from-black via-blue-900 to-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Privacy Policy</h1>
                
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <p className="text-lg mb-6 text-neutral-700">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-600">1. Introduction</h2>
                    <p className="text-neutral-700">
                        At Collab, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our collaborative coding platform.
                    </p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-600">2. Information We Collect</h2>
                    <p className="text-neutral-700">
                        We collect information that you provide directly to us when you:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-neutral-700">
                        <li>Create an account</li>
                        <li>Use our collaborative features</li>
                        <li>Contact our support team</li>
                        <li>Participate in surveys or promotions</li>
                    </ul>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-600">3. How We Use Your Information</h2>
                    <p className="text-neutral-700">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-neutral-700">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices, updates, and support messages</li>
                        <li>Respond to your comments and questions</li>
                    </ul>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-600">4. Data Security</h2>
                    <p className="text-neutral-700">
                        We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
                    </p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-600">5. Contact Us</h2>
                    <p className="text-neutral-700">
                        If you have questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className="mb-6 text-neutral-700">
                        <strong>Email:</strong> <a href="mailto:jayantjoshi0001@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors">jayantjoshi0001@gmail.com</a>
                    </p>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
  )
}