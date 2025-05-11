"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/ui/PublicNavbar';
import { 
  FaBook,
  FaCode,
  FaGithub,
  FaRobot,
  FaUsers,
  FaLaptopCode,
  FaRocket,
  FaSearch,
} from 'react-icons/fa';
import Footer from '@/components/ui/Footer';

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  

  // FAQ items
  const faqItems = [
    {
      question: "Is there a free trial available?",
      answer: "Yes, we have a free version of Collab available for you to try out. It includes real-time code collaboration, voice chat, and basic GitHub integration features."
    },
    {
      question: "How do I invite team members?",
      answer: "You can invite team members by going to your project settings and entering their email addresses. They'll receive an invitation to join your collaborative workspace."
    },
    {
      question: "Can I use Collab with my existing GitHub repositories?",
      answer: "Yes, Collab integrates seamlessly with GitHub. You can import your existing repositories, collaborate in real-time, and commit changes directly back to GitHub."
    },
    {
      question: "What programming languages are supported?",
      answer: "Collab supports all major programming languages including JavaScript, TypeScript, Python, Java, C++, Ruby, PHP, and many more through our Monaco Editor integration (the same editor that powers VS Code)."
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/docs/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-black to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Support & Documentation
            </h1>
            <p className="text-lg text-blue-200 mb-8">
              Need help with something? Check out our most frequently asked questions.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mt-8">
              <form onSubmit={handleSearch}>
                <div className="flex items-center bg-white bg-opacity-10 rounded-full border border-blue-400 border-opacity-30 px-4 py-2">
                  <FaSearch className="text-blue-300 mr-3" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    className="bg-transparent w-full text-white border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quickfind Answers */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Quickfind answers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* What is Collab? */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/index" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaBook className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">What is Collab?</h3>
                  <p className="text-sm text-gray-600">
                    Here for the first time? Learn how Collab can help you grow.
                  </p>
                </Link>
              </motion.div>
              
              {/* The Collab Platform */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/workspace" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaLaptopCode className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">The Collab Platform</h3>
                  <p className="text-sm text-gray-600">
                    Tracking your customers in the Collab platform for growth.
                  </p>
                </Link>
              </motion.div>
              
              {/* Installing Collab */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/account-setup" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaRocket className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Installing Collab</h3>
                  <p className="text-sm text-gray-600">
                    Everything you need to know to install Collab and set up your workspace.
                  </p>
                </Link>
              </motion.div>
              
              {/* Getting started 101 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/first-project" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaCode className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Getting started 101</h3>
                  <p className="text-sm text-gray-600">
                    Everything you need to know to get started with Collab.
                  </p>
                </Link>
              </motion.div>
              
              {/* Second row */}
              {/* Messaging Customers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/voice-chat" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaUsers className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Communication Tools</h3>
                  <p className="text-sm text-gray-600">
                    Setting up and customizing Collab to communicate with your team.
                  </p>
                </Link>
              </motion.div>
              
              {/* GitHub Integration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/github" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaGithub className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">GitHub Integration</h3>
                  <p className="text-sm text-gray-600">
                    Set up and learn how to integrate with GitHub repositories.
                  </p>
                </Link>
              </motion.div>
              
              {/* Product Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/features" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaRocket className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Product Features</h3>
                  <p className="text-sm text-gray-600">
                    Explore all the features that make Collab powerful.
                  </p>
                </Link>
              </motion.div>
              
              {/* AI Assistance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <Link href="/docs/ai-assistance" className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FaRobot className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Assistance</h3>
                  <p className="text-sm text-gray-600">
                    Learn about the AI-powered features that help you code faster.
                  </p>
                </Link>
              </motion.div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                href="/docs/index"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                View full documentation
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* General FAQs */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">General FAQs</h2>
            
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                  <details className="group">
                    <summary className="flex justify-between items-center p-4 cursor-pointer">
                      <h3 className="font-medium">{faq.question}</h3>
                      <span className="transition-transform duration-300 group-open:rotate-180">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </summary>
                    <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}