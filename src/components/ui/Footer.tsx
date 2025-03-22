"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { FaGithub, FaTwitter, FaDiscord, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="w-[90%] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 md:mb-12">
          <div className="text-center sm:text-left">
            <Image src="/textlogo.png" alt="Collab" height={32} width={180} />
            <p className="text-neutral-600 mb-4">
              A real-time collaborative coding platform for developers.
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <Link href="https://github.com/JAYANTJOSHI001/collab-code" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaGithub size={20} />
              </Link>
              <Link href="https://x.com/jayantjoshi_" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaTwitter size={20} />
              </Link>
              <Link href="https://www.linkedin.com/in/jayant-joshi-642a79305/" className="text-neutral-600 hover:text-blue-600 transition-colors">
                <FaLinkedin size={20} />
              </Link>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-neutral-600 hover:text-black transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-neutral-600 hover:text-black transition-colors">Pricing</Link></li>
              {/* <li><Link href="/docs" className="text-neutral-600 hover:text-black transition-colors">Documentation</Link></li> */}
              <li><Link href="/changelog" className="text-neutral-600 hover:text-black transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-600 hover:text-black transition-colors">About</Link></li>
              {/* <li><Link href="/careers" className="text-neutral-600 hover:text-black transition-colors">Careers</Link></li> */}
              <li><Link href="/contact" className="text-neutral-600 hover:text-black transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-neutral-600 hover:text-black transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 md:pt-8 border-t border-neutral-200 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} Collab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}