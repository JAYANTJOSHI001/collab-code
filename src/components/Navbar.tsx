"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaUser} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isShowing, setIsShowing] = useState(true); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    if(isShowing) {
      setIsShowing(false);
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/50 backdrop-blur-lg border-b border-white/10' 
        : 'bg-black border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent hover:from-blue-400 hover:to-white transition-all duration-300"
              >
                <Image src="/favicon.svg" alt="Collab" width={64} height={32} />
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {session?.user?.image ? (
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 bg-blue-950/30 px-4 py-2 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-sm font-medium text-blue-200">
                    {session.user.name}
                  </span>
                  <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-blue-500/50">
                    <Image
                      src={session?.user?.image || ''}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="32px"
                      priority
                    />
                  </div>
                </motion.div>
              </Link>
            ) : (
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-blue-950/30 px-4 py-2 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 cursor-pointer"
                >
                  <FaUser className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Profile</span>
                </motion.div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
      {isShowing && (
        <div className="bg-black/50 backdrop-blur-lg border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-200/80">
              You&apos;re using an early test version — some features might not work perfectly yet, but we&apos;re working on it!
              </p>
              <button
                onClick={handleClose}
                className="text-blue-200/60 hover:text-blue-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}