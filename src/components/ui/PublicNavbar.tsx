"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Docs", href: "/docs" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-black/80 backdrop-blur-md shadow-lg py-2 border-b border-zinc-800/50" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.span 
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400"
              whileHover={{ scale: 1.05 }}
            >
              Collab
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
              >
                <motion.span
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white relative",
                    pathname === item.href || 
                    (item.href.startsWith('/#') && pathname === '/' && item.href.substring(1) === pathname) 
                      ? "text-white" 
                      : "text-zinc-400"
                  )}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  {item.name}
                  {(pathname === item.href || 
                    (item.href.startsWith('/#') && pathname === '/' && item.href.substring(1) === pathname)) && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-300"
                      layoutId="navbar-underline"
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!session ? (
              <>
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20">
                      Login
                    </Button>
                  </motion.div>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20">
                    Dashboard
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-black/90 backdrop-blur-md border-t border-zinc-800/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium py-2 transition-colors hover:text-white block",
                      pathname === item.href ? "text-white" : "text-zinc-400"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-zinc-700 flex flex-col space-y-3">
                {!session ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navItems.length * 0.1 + 0.1 }}
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                          Login
                        </Button>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                  >
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        Dashboard
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default PublicNavbar;