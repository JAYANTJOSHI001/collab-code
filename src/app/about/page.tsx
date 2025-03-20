"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaEnvelope, FaReact, FaCode, FaNodeJs, FaDatabase } from 'react-icons/fa';
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiPrisma, SiWebrtc } from 'react-icons/si';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';

// Team members data
const teamMembers = [
  {
    name: 'Alex Johnson',
    role: 'Founder & Lead Developer',
    bio: 'Full-stack developer with a passion for real-time collaboration tools. Previously worked at Google and GitHub.',
    image: '/team/alex.jpg',
    social: {
      github: 'https://github.com/alexj',
      twitter: 'https://twitter.com/alexj',
      linkedin: 'https://linkedin.com/in/alexj'
    }
  },
  {
    name: 'Sarah Chen',
    role: 'UX Designer & Frontend Developer',
    bio: 'Designer turned developer with expertise in creating intuitive coding interfaces. Advocate for accessible developer tools.',
    image: '/team/sarah.jpg',
    social: {
      github: 'https://github.com/sarahc',
      twitter: 'https://twitter.com/sarahc',
      linkedin: 'https://linkedin.com/in/sarahc'
    }
  },
  {
    name: 'Michael Rodriguez',
    role: 'Backend Engineer',
    bio: 'Systems architect specializing in real-time data synchronization and WebRTC. Open source contributor to various collaboration tools.',
    image: '/team/michael.jpg',
    social: {
      github: 'https://github.com/michaelr',
      twitter: 'https://twitter.com/michaelr',
      linkedin: 'https://linkedin.com/in/michaelr'
    }
  }
];

// Tech stack data
const techStack = [
  { name: 'React', icon: <FaReact size={32} className="text-blue-500" /> },
  { name: 'Next.js', icon: <SiNextdotjs size={32} className="text-black" /> },
  { name: 'TypeScript', icon: <SiTypescript size={32} className="text-blue-600" /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss size={32} className="text-teal-500" /> },
  { name: 'Node.js', icon: <FaNodeJs size={32} className="text-green-600" /> },
  { name: 'Prisma', icon: <SiPrisma size={32} className="text-indigo-600" /> },
  { name: 'WebRTC', icon: <SiWebrtc size={32} className="text-orange-500" /> },
  { name: 'Monaco Editor', icon: <FaCode size={32} className="text-blue-700" /> }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white text-black">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-900 to-black text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              About Collab
            </h1>
            <p className="text-xl text-blue-200 mb-8">
              Reimagining how developers collaborate on code
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
                What is Collab?
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl mb-6">
                  Collab is a real-time collaborative coding platform that brings the seamless experience of Google Docs to software development. We've built a space where developers can code together instantly, without the friction of traditional version control or the limitations of screen sharing.
                </p>
                
                <p className="text-xl mb-6">
                  Our platform is designed for developers who believe that coding shouldn't be a solitary activity. Whether you're pair programming with a colleague, teaching a student, or contributing to an open-source project, Collab makes it easy to write, review, and execute code together in real-time.
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-xl font-semibold mb-3">For Developers</h3>
                  <p className="text-gray-600">Collaborate on code with teammates without the hassle of pushing, pulling, or resolving merge conflicts.</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-xl font-semibold mb-3">For Educators</h3>
                  <p className="text-gray-600">Teach programming concepts interactively, seeing students' code as they type and providing real-time guidance.</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-xl font-semibold mb-3">For Teams</h3>
                  <p className="text-gray-600">Conduct code reviews, technical interviews, and debugging sessions with unprecedented clarity and efficiency.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
                Our Mission & Vision
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-semibold mb-4">Why We Built Collab</h3>
                <p className="text-xl mb-6">
                  Collab was born out of frustration with existing collaboration tools for developers. We found ourselves constantly switching between video calls, screen sharing, and version control systems just to work on code together. We believed there had to be a better way.
                </p>
                
                <p className="text-xl mb-10">
                  Our mission is to remove the barriers to collaborative coding, making it as natural and effortless as having a conversation. We believe that when developers can truly collaborate without friction, innovation accelerates and code quality improves.
                </p>
                
                <h3 className="text-2xl font-semibold mb-4">Our Vision for the Future</h3>
                <p className="text-xl mb-6">
                  We envision a future where collaborative coding is the norm, not the exception. Where developers can seamlessly move between solo work and collaboration without changing their workflow or tools.
                </p>
                
                <p className="text-xl mb-6">
                  Beyond just real-time editing, we're building a platform that integrates the entire development workflow—from ideation to deployment—in a collaborative environment. Our roadmap includes features like integrated AI pair programming, advanced code analytics, and seamless integration with the broader development ecosystem.
                </p>
                
                <p className="text-xl mb-6">
                  Ultimately, we aim to transform how software is built, making development more accessible, collaborative, and enjoyable for everyone involved.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Collab
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex space-x-3">
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                      <FaGithub size={20} />
                    </a>
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors">
                      <FaTwitter size={20} />
                    </a>
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors">
                      <FaLinkedin size={20} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              Our Tech Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern technologies for performance and scalability
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  {tech.icon}
                </div>
                <p className="font-medium">{tech.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Connect With Us
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Have questions or want to join our community? Reach out!
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6">
            <motion.a
              whileHover={{ y: -5, scale: 1.05 }}
              href="mailto:hello@collabcode.dev"
              className="flex items-center justify-center gap-3 bg-white text-blue-900 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaEnvelope size={20} />
              <span>Email Us</span>
            </motion.a>

            <motion.a
              whileHover={{ y: -5, scale: 1.05 }}
              href="https://github.com/collabcode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-blue-900 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaGithub size={20} />
              <span>GitHub</span>
            </motion.a>

            <motion.a
              whileHover={{ y: -5, scale: 1.05 }}
              href="https://twitter.com/collabcode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-blue-900 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaTwitter size={20} />
              <span>Twitter</span>
            </motion.a>

            <motion.a
              whileHover={{ y: -5, scale: 1.05 }}
              href="https://discord.gg/collabcode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-blue-900 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaDiscord size={20} />
              <span>Discord Community</span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 shadow-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900">
                Stay Updated
              </h2>
              <p className="text-blue-700">
                Subscribe to our newsletter for the latest updates, tips, and early access to new features.
              </p>
            </motion.div>

            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
            <p className="text-sm text-blue-600 mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}