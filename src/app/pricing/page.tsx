"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';
import { Button } from '@/components/ui/button';
import { FaCheck, FaGithub } from 'react-icons/fa';

export default function PricingPage() {
  const { data: session } = useSession();

  const plans = [
    {
      name: "Basic",
      price: "$9",
      period: "/month",
      description: "Perfect for individual developers",
      features: [
        "Real-time collaboration",
        "Up to 3 projects",
        "Basic code editor features",
        "GitHub integration",
        "24/7 support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "Ideal for small teams",
      features: [
        "Everything in Basic",
        "Unlimited projects",
        "Advanced code editor features",
        "Version history",
        "Team management",
        "Priority support"
      ],
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/month",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Advanced security features",
        "Dedicated support",
        "Custom branding",
        "API access"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow bg-gradient-to-b from-black via-blue-950 to-blue-900 pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
                Choose the plan that fits your needs
              </p>
              
              <div className="inline-block bg-blue-900/50 p-3 rounded-full mb-12">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium">
                  🎉 Early Access: Free for Everyone!
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                    plan.popular ? 'ring-2 ring-blue-500 transform md:-translate-y-4' : ''
                  }`}
                >
                  {/* Blur overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/20 z-10 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-blue-500 mb-2">Coming Soon</p>
                    <p className="text-white text-center px-6">
                      During early access, all features are free!
                    </p>
                  </div>
                  
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-xs font-bold uppercase py-1 px-4 absolute top-0 right-0 rounded-bl-lg z-20">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-6 ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => !session && signIn('github')}
                    >
                      {session ? (
                        <Link href="/dashboard" className="w-full flex items-center justify-center gap-2">
                          Try For Free
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <FaGithub size={20} />
                          Try For Free
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 ">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
              <p className="text-blue-200 max-w-2xl mx-auto">
                Everything you need to know about our pricing and plans
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "How long will early access be free?",
                  answer: "Early access will be free for all users until we officially launch. We'll provide plenty of notice before introducing paid plans."
                },
                {
                  question: "Will my projects be deleted when early access ends?",
                  answer: "No, all your projects and data will remain intact when we transition to paid plans. You'll have the option to choose a plan that suits your needs."
                },
                {
                  question: "Can I upgrade or downgrade my plan later?",
                  answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will apply at the end of your billing cycle."
                },
                {
                  question: "Is there a limit to how many collaborators I can have?",
                  answer: "During early access, there are no limits on collaborators. After launch, limits will vary by plan."
                },
                {
                  question: "Do you offer discounts for educational institutions?",
                  answer: "Yes, we plan to offer special pricing for educational institutions and non-profit organizations. Contact us for more details."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-blue-900/30 rounded-lg p-6 border border-blue-800/50">
                  <h3 className="text-xl font-semibold mb-3 text-blue-300">{faq.question}</h3>
                  <p className="text-white/80">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}