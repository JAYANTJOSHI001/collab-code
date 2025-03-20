"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/ui/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaEnvelope } from 'react-icons/fa';
import Footer from '@/components/ui/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const supportLinks = [
    {
      title: "Email Support",
      description: "Get help with technical issues",
      icon: <FaEnvelope size={24} className="text-blue-500" />,
      link: "mailto:support@collabcode.dev"
    },
    {
      title: "Community Forum",
      description: "Join discussions with other developers",
      icon: <FaDiscord size={24} className="text-indigo-500" />,
      link: "https://discord.gg/collab"
    },
    {
      title: "GitHub Issues",
      description: "Report bugs or request features",
      icon: <FaGithub size={24} className="text-gray-900" />,
      link: "https://github.com/collab/issues"
    }
  ];

  const socialLinks = [
    {
      name: "Twitter",
      icon: <FaTwitter size={24} />,
      link: "https://x.com/jayantjoshi_"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={24} />,
      link: "https://linkedin.com/company/collabcode"
    },
    {
      name: "Discord",
      icon: <FaDiscord size={24} />,
      link: "https://discord.gg/collab"
    },
    {
      name: "GitHub",
      icon: <FaGithub size={24} />,
      link: "https://github.com/collab"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-black to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Get in Touch with Us!
            </h1>
            <p className="text-xl text-blue-200 mb-12">
              Have questions, feedback, or need help? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-2xl p-8 shadow-xl"
              >
                <h2 className="text-3xl font-bold mb-6 text-blue-900">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full min-h-[150px]"
                      placeholder="Your message here..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  >
                    Send Message
                  </Button>
                </form>
              </motion.div>

              {/* Support Options */}
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white rounded-2xl p-8 shadow-xl"
                >
                  <h2 className="text-3xl font-bold mb-6 text-blue-900">Support Options</h2>
                  <div className="space-y-6">
                    {supportLinks.map((option, index) => (
                      <div
                        key={index}
                        className="block p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gray-50">
                            {option.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{option.title}</h3>
                            <p className="text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}