"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href: string;
  active: boolean;
}

const DocBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  
  // Skip if we're on the main docs page
  if (pathname === '/docs' || pathname === '/docs/index') {
    return null;
  }
  
  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    { label: 'Documentation', href: '/docs', active: false }
  ];
  
  // Extract slug from path
  const slug = pathname?.split('/').pop();
  
  if (slug && pathname) {
    // Convert slug to title (capitalize words and replace hyphens with spaces)
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    items.push({ label: title, href: pathname, active: true });
  }
  
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600"
          >
            <FaHome className="mr-2" />
            Home
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <FaChevronRight className="text-gray-400 mx-1" size={12} />
              {item.active ? (
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default DocBreadcrumb;