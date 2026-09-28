import React from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';
import { FaExclamationTriangle, FaHome, FaSearch } from 'react-icons/fa';

export default function DocNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 py-8 text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Documentation Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t find the documentation page you were looking for. It might have been moved or doesn&apos;t exist.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/docs"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaHome />
              Documentation Home
            </Link>
            
            <Link 
              href="/docs/search"
              className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              <FaSearch />
              Search Documentation
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}