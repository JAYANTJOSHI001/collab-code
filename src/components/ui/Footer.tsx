"use client"

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-600">Collab</h3>
            <p className="text-neutral-600 mb-4">
              A real-time collaborative coding platform for developers.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com/collab" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaGithub size={20} />
              </Link>
              <Link href="https://twitter.com/collab" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaTwitter size={20} />
              </Link>
              <Link href="https://discord.gg/collab" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaDiscord size={20} />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-neutral-600 hover:text-black transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-neutral-600 hover:text-black transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="text-neutral-600 hover:text-black transition-colors">Documentation</Link></li>
              <li><Link href="/changelog" className="text-neutral-600 hover:text-black transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-neutral-600 hover:text-black transition-colors">Blog</Link></li>
              <li><Link href="/community" className="text-neutral-600 hover:text-black transition-colors">Community</Link></li>
              <li><Link href="/support" className="text-neutral-600 hover:text-black transition-colors">Support</Link></li>
              <li><Link href="/api" className="text-neutral-600 hover:text-black transition-colors">API</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-600 hover:text-black transition-colors">About</Link></li>
              <li><Link href="/careers" className="text-neutral-600 hover:text-black transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-neutral-600 hover:text-black transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-neutral-600 hover:text-black transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-200 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} Collab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}