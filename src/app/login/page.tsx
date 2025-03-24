"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("github", { callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white overflow-hidden">
      {/* Left Section - Illustration */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-[45%] flex items-center justify-start h-screen relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
        <div className="h-full relative z-10">
          <Image src="/illustration.svg" alt="Logo" className="w-full h-full object-contain" height={500} width={500} />
        </div>
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-[40%] flex items-center justify-center h-screen mr-30 relative"
      >
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl" />
        <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl m-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Welcome Back
            </h1>
            <p className="text-blue-200/80 mb-8">Sign in to continue coding together</p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="flex items-center justify-center w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Loading...</span>
                  <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
                </div>
              ) : (
                <>
                  <FaGithub className="mr-3 text-2xl" />
                  Sign in with GitHub
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}