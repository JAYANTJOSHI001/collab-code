"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaReact, FaCode, FaNodeJs } from 'react-icons/fa';
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiPrisma, SiWebrtc } from 'react-icons/si';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';

// Team members data
const teamMembers = [
  {
    name: 'Jayant Joshi',
    role: 'Founder & Lead Developer',
    bio: 'Full-stack developer with a passion for real-time collaboration tools. Previously worked at many big projects.',
    image: "/jayant.png",
    social: {
      github: 'https://github.com/JAYANTJOSHI001',
      twitter: 'https://x.com/jayantjoshi_',
      linkedin: 'https://www.linkedin.com/in/jayant-joshi-642a79305/'
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
                  Collab is a real-time collaborative coding platform that brings the seamless experience of Google Docs to software development. We&apos;ve built a space where developers can code together instantly, without the friction of traditional version control or the limitations of screen sharing.
                </p>
                
                <p className="text-xl mb-6">
                  Our platform is designed for developers who believe that coding shouldn&apos;t be a solitary activity. Whether you&apos;re pair programming with a colleague, teaching a student, or contributing to an open-source project, Collab makes it easy to write, review, and execute code together in real-time.
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
                  <p className="text-gray-600">Teach programming concepts interactively, seeing students&apos; code as they type and providing real-time guidance.</p>
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
                  Beyond just real-time editing, we&apos;re building a platform that integrates the entire development workflow—from ideation to deployment—in a collaborative environment. Our roadmap includes features like integrated AI pair programming, advanced code analytics, and seamless integration with the broader development ecosystem.
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
      <Footer />
    </div>
  );
}