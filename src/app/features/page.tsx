"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import PublicNavbar from '@/components/ui/PublicNavbar';
import { Button } from '@/components/ui/button';
import { 
  FaCode, 
  FaGithub, 
  FaGlobe, 
  FaProjectDiagram, 
  FaHistory, 
  FaTerminal, 
  FaComments, 
  FaShieldAlt,
  FaRocket,
  FaLaptopCode
} from 'react-icons/fa';
import { FaJava } from 'react-icons/fa';
import { SiJavascript, SiPython, SiCplusplus, SiTypescript } from 'react-icons/si';
import Footer from '@/components/ui/Footer';

export default function FeaturesPage() {
  const { data: session } = useSession();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Features data
  const keyFeatures = [
    {
      id: 1,
      title: "Real-time Code Collaboration",
      description: "Work with teammates on the same file, instantly see changes as they happen. No need to refresh or reload; updates happen live across different locations and devices.",
      icon: <FaCode size={32} className="text-blue-500" />,
      benefits: [
        "Work with teammates on the same file, instantly see changes",
        "No need to refresh or reload; updates happen live",
        "Works across different locations and devices"
      ]
    },
    {
      id: 2,
      title: "Multi-Language Support",
      description: "Code in your preferred language with full syntax highlighting and formatting. We support all major programming languages to fit your project needs.",
      icon: <FaGlobe size={32} className="text-green-500" />,
      benefits: [
        "Supports JavaScript, Python, C++, Java, and more",
        "Auto-detection of language syntax",
        "Code highlighting and formatting for a seamless experience"
      ],
      languages: [
        { name: "JavaScript", icon: <SiJavascript className="text-yellow-400" size={24} /> },
        { name: "Python", icon: <SiPython className="text-blue-500" size={24} /> },
        { name: "C++", icon: <SiCplusplus className="text-blue-700" size={24} /> },
        { name: "Java", icon: <FaJava className="text-red-500" size={24} /> },
        { name: "TypeScript", icon: <SiTypescript className="text-blue-600" size={24} /> },
        { name: "Many More", icon: <FaCode className="text-gray-600" size={24} /> }
      ]
    },
    {
      id: 3,
      title: "GitHub Authentication & Integration",
      description: "Seamlessly connect with your GitHub account for quick access and easy project management. Import and export projects directly to your repositories.",
      icon: <FaGithub size={32} className="text-gray-800" />,
      benefits: [
        "Login via GitHub with one click",
        "Import and export projects directly from GitHub repositories",
        "Sync with your existing workflow"
      ]
    },
    {
      id: 4,
      title: "Project Management & Collaboration Tools",
      description: "Organize your work with powerful project management features. Create multiple projects, invite team members, and set custom permissions.",
      icon: <FaProjectDiagram size={32} className="text-purple-500" />,
      benefits: [
        "Create multiple projects and manage them efficiently",
        "Share project links with teammates",
        "Set permissions (read-only, edit, admin) for better control"
      ]
    },
    {
      id: 5,
      title: "Built-in Code Editor with Advanced Features",
      description: "Enjoy a professional coding experience with our feature-rich editor. Get auto-completion, syntax highlighting, and error detection as you type.",
      icon: <FaLaptopCode size={32} className="text-indigo-500" />,
      benefits: [
        "Monaco Editor (VS Code-like experience) for powerful editing",
        "Auto-completion, syntax highlighting, and error detection",
        "Themes & Customization – Choose light/dark mode, adjust font size"
      ]
    },
    {
      id: 6,
      title: "Version Control & Undo History",
      description: "Never lose your work with built-in version control. Track changes, view previous versions, and restore code as needed.",
      icon: <FaHistory size={32} className="text-amber-500" />,
      benefits: [
        "Track changes made by different collaborators",
        "View previous versions of the code and restore as needed",
        "Keep a log of contributions from all users"
      ]
    },
    {
      id: 7,
      title: "In-Browser Execution",
      description: "Run your code directly in the browser without any setup. See results instantly in a dedicated console panel.",
      icon: <FaTerminal size={32} className="text-red-500" />,
      benefits: [
        "Run JavaScript/Python code directly in the browser",
        "No need for external setup or installations",
        "Output displayed in a separate console panel"
      ],
      comingSoon:"true",
    },
    {
      id: 8,
      title: "Chat & Communication",
      description: "Discuss your code in real-time with integrated communication tools. Leave comments on specific lines and collaborate effectively.",
      icon: <FaComments size={32} className="text-teal-500" />,
      benefits: [
        "Integrated chat system to discuss code in real-time",
        "Inline commenting – Leave notes on specific lines of code",
        "Voice/video call integration (coming soon)"
      ],
      comingSoon: true
    }
  ];

  const whyChooseUs = [
    {
      title: "No Setup Required",
      description: "Run instantly in the browser with zero configuration",
      icon: <FaRocket size={24} className="text-blue-500" />
    },
    {
      title: "Secure Collaboration",
      description: "Your code is protected with enterprise-grade security",
      icon: <FaShieldAlt size={24} className="text-green-500" />
    },
    {
      title: "Fast & Efficient",
      description: "Optimized for speed and a smooth coding experience",
      icon: <FaLaptopCode size={24} className="text-purple-500" />
    },
    {
      title: "Work from Anywhere",
      description: "Cloud-based platform accessible from any device",
      icon: <FaGlobe size={24} className="text-amber-500" />
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
              Powerful Features for Seamless Collaboration
            </h1>
            <p className="text-xl text-blue-200 mb-12">
              Code with your team in real-time, manage projects efficiently, and build together like never before.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button 
                onClick={() => !session && signIn('github')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {session ? (
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <FaLaptopCode size={20} />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <FaGithub size={20} />
                    Start Collaborating Now
                  </>
                )}
              </Button>
            </motion.div>
            
            {/* Feature Preview Animation */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 relative"
            >
              <div className="bg-zinc-900 rounded-xl p-6 text-left shadow-2xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 text-sm text-gray-400">Collaboration in action</div>
                </div>
                
                <div className="relative">
                  {/* Code editor preview */}
                  <pre className="text-sm md:text-base font-mono overflow-x-auto">
                    <code className="language-typescript text-gray-300">
                      {`function CollaborativeEditor() {
                      const [code, setCode] = useState("");
                      const [users, setUsers] = useState([
                        { id: 1, name: "Sarah", color: "#4f46e5" },
                        { id: 2, name: "Mike", color: "#10b981" }
                      ]);

                      useEffect(() => {
                        socket.on("code-update", (newCode) => {
                          setCode(newCode);
                        });
                        
                        socket.on("user-joined", (user) => {
                          setUsers(prev => [...prev, user]);
                        });
                      }, []);

                      // Handle code changes
                      const handleChange = (value) => {
                        setCode(value);
                        socket.emit("code-update", value);
                      };

                      return (
                        <div className="collaborative-editor">
                          <UserPresence users={users} />
                          <MonacoEditor
                            value={code}
                            onChange={handleChange}
                            language="typescript"
                            theme="vs-dark"
                          />
                        </div>
                      );
                    }`}
                    </code>
                  </pre>
                  
                  {/* Animated cursors */}
                  <motion.div
                    animate={{
                      x: [0, 100, 200, 100, 0],
                      transition: { duration: 4, repeat: Infinity }
                    }}
                    className="absolute h-4 w-2 bg-blue-500 opacity-50"
                    style={{ top: "30%" }}
                  />
                  <motion.div
                    animate={{
                      x: [200, 100, 0, 100, 200],
                      transition: { duration: 4, repeat: Infinity }
                    }}
                    className="absolute h-4 w-2 bg-green-500 opacity-50"
                    style={{ top: "50%" }}
                  />
                  
                  {/* User avatars */}
                  <div className="absolute top-2 right-2 flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-900">S</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-900">M</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for modern collaborative development
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {keyFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 relative overflow-hidden group ${feature.comingSoon ? 'border-dashed border-blue-300' : ''}`}
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {feature.languages && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-3">Supported Languages</p>
                        <div className="flex flex-wrap gap-3">
                          {feature.languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                              {lang.icon}
                              <span className="text-sm">{lang.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              See Collab in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the power of real-time collaboration
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="aspect-video relative bg-zinc-900">
              {/* This would be replaced with an actual video or interactive demo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
              
              {/* Placeholder for video thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Watch the Demo</h3>
                  <p className="text-gray-300">See how Collab transforms the way teams code together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              Why Choose Collab?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The modern solution for collaborative coding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              What Developers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                text: "Collab has completely transformed how our team works together. The real-time collaboration is seamless and intuitive.",
                author: "Sarah K.",
                role: "Senior Developer at TechCorp"
              },
              {
                text: "Finally, a coding platform that works like Google Docs. This is a game changer for remote teams like ours.",
                author: "Mike R.",
                role: "Tech Lead at StartupX"
              },
              {
                text: "The instant code execution and version control make this tool indispensable for our daily workflow.",
                author: "Alex M.",
                role: "Full Stack Developer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl relative shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-5xl text-blue-200 absolute top-4 left-4">&quot;</div>
                <p className="text-neutral-700 mb-6 relative z-10">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                Start Coding with Your Team Now!
              </h2>
              <p className="text-xl text-blue-200 mb-10">
                Join thousands of developers who are already experiencing the future of collaborative coding.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button 
                  onClick={() => !session && signIn('github')}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center gap-2 shadow-lg"
                >
                  {session ? (
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <FaLaptopCode size={20} />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <FaGithub size={20} />
                      Get Started for Free
                    </>
                  )}
                </Button>
              </motion.div>
              
              <p className="mt-6 text-blue-200 text-sm">
                No credit card required. Free for individual developers and small teams.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}