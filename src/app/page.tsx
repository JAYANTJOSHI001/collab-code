"use client"
import Head from 'next/head';
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>Landing Page</title>
        <meta name="description" content="A simple Next.js landing page" />
      </Head>
      
      <header className="w-full py-6 bg-white shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Our Website</h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-4xl font-extrabold text-gray-900">Build Something Amazing</h2>
        <p className="mt-4 text-lg text-gray-600">Start your journey with our product today.</p>
        <a href="#" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition">Get Started</a>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign Up for Updates</h3>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          />
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Sign Up</button>
        </div>
        
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Login / Signup</h3>
          {session ? (
            <>
              <p className="text-gray-800">Welcome, {session?.user?.name}</p>
              <button 
                onClick={() => signOut()} 
                className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => signIn('github')} 
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </main>
      
      <footer className="w-full py-4 bg-gray-200 text-center text-gray-700">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}
