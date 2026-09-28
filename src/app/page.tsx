"use client"

import React from 'react';
import { signIn } from 'next-auth/react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FaGithub, FaCode, FaUsers, FaPlay, FaHistory, FaComments, FaMoon, FaShare} from 'react-icons/fa';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';

const features = [
  {
    icon: <FaCode size={24} />,
    title: 'Real-Time Collaboration',
    description: 'Work together in real-time, with multiple cursors and instant updates.',
  },
  {
    icon: <FaCode size={24} />,
    title: 'Multiple Language Support',
    description: 'Supports JavaScript, Python, C++, and many more languages.',
  },
  {
    icon: <FaPlay size={24} />,
    title: 'Code Execution',
    description: 'Run code directly within the platform.',
  },
  {
    icon: <FaHistory size={24} />,
    title: 'Version Control & History',
    description: 'Rewind and track every change with built-in version control.',
  },
  {
    icon: <FaComments size={24} />,
    title: 'Chat & Comments',
    description: 'Discuss code live with built-in chat and inline comments.',
  },
  {
    icon: <FaMoon size={24} />,
    title: 'Dark Mode & Themes',
    description: 'Customizable themes for a comfortable coding experience.',
  }
];

const steps = [
  {
    icon: <FaCode size={24} />,
    title: 'Create a Room',
    description: 'Start a session instantly with one click.',
  },
  {
    icon: <FaShare size={24} />,
    title: 'Share the Link',
    description: 'Invite others to collaborate in real-time.',
  },
  {
    icon: <FaUsers size={24} />,
    title: 'Code Together',
    description: 'Edit, run, and discuss code in real time.',
  }
];

const testimonials = [
  {
    text: "This is exactly what I've been looking for! The real-time collaboration is seamless.",
    author: "Sarah K.",
    role: "Senior Developer"
  },
  {
    text: "Finally, a coding platform that works like Google Docs. Game changer for our team.",
    author: "Mike R.",
    role: "Tech Lead"
  },
  {
    text: "The instant code execution and version control make this tool indispensable.",
    author: "Alex M.",
    role: "Full Stack Developer"
  }
];

const faqs = [
  {
    question: "Is this platform free to use?",
    answer: "Yes, Collab is free for individual developers and small teams. We also offer premium plans for larger organizations with advanced features."
  },
  {
    question: "What programming languages are supported?",
    answer: "We support all major programming languages including JavaScript, TypeScript, Python, Java, C++, Go, Ruby, and many more."
  },
  {
    question: "How secure is my code?",
    answer: "Your code is encrypted in transit and at rest. We use industry-standard security practices and never share your code with third parties."
  },
  {
    question: "Can I integrate with GitHub?",
    answer: "Yes, you can authenticate with GitHub and import/export projects directly to your repositories."
  },
  {
    question: "How many people can collaborate simultaneously?",
    answer: "Our free tier supports up to 5 simultaneous collaborators. Premium plans allow for unlimited team members."
  }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax effect for hero section
  const yPosAnim = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacityAnim = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Floating animation for visual elements
  const floatingAnim = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors">
      <PublicNavbar />
      
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-40"
        style={{ scaleX: scaleProgress }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-black via-blue-950 to-black text-white min-h-screen flex items-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-blue-400"
              initial={{ opacity: 0.1 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                y: ["0%", "100%"],
              }}
              transition={{
                duration: 8,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ top: `${i * 10}%` }}
            />
          ))}
        </div>

        {/* Update hero content styles */}
        <div className="container mx-auto px-4 py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: yPosAnim, opacity: opacityAnim }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Update floating shapes */}
            <motion.div
              animate={floatingAnim}
              className="absolute -left-20 top-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={floatingAnim}
              transition={{ delay: 1 }}
              className="absolute -right-20 bottom-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
            />

            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight relative bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
              Code Together,
              <br />
              <span className="text-blue-500">Instantly.</span>
              <motion.span
                className="absolute -right-8 top-0 text-2xl"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 mb-12 leading-relaxed">
              Like Google Docs, but for developers. A seamless, real-time coding platform where you and your team can collaborate instantly. No setup, no hassle.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('github')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
            >
              <FaGithub size={24} />
              Start Coding Now
            </motion.button>

            {/* Code Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 relative"
            >
              <div className="bg-zinc-900 rounded-xl p-6 text-left shadow-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-sm md:text-base font-mono overflow-x-auto">
                  <code className="language-typescript text-gray-300">
                    {`// Real-time collaboration in action
                      function Editor() {
                        const [code, setCode] = useState("");
                        const [users, setUsers] = useState([]);

                        useEffect(() => {
                          socket.on("code-update", (newCode) => {
                            setCode(newCode);
                          });
                        }, []);

                        // Multiple cursors...
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
                  style={{ top: "40%" }}
                />
                <motion.div
                  animate={{
                    x: [200, 100, 0, 100, 200],
                    transition: { duration: 4, repeat: Infinity }
                  }}
                  className="absolute h-4 w-2 bg-green-500 opacity-50"
                  style={{ top: "60%" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-black via-blue-950 to-black relative overflow-hidden">
        {/* Update animated dots background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-400">
              Everything You Need for
              <br />
              <span className="text-blue-500">Modern Development</span>
            </h2>
          </motion.div>

          {/* Update feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="p-6 rounded-2xl bg-blue-950/50 backdrop-blur-lg border border-blue-900/50 hover:border-blue-700/50 transition-all relative group shadow-lg hover:shadow-xl"
              >
                <motion.div
                  className="absolute inset-0 bg-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ filter: "blur(20px)" }}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center mb-4 shadow-md"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-blue-200">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Get started in seconds with these simple steps
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center max-w-xs"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-16 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300" style={{ width: "calc(100% - 4rem)" }} />
                  )}
                </div>
                <div className="w-16 h-16 rounded-xl bg-white border border-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-md">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-neutral-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              What Developers Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Join thousands of satisfied developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
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

      {/* FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-blue-700">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="mb-6"
              >
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                    <span className="text-lg">{faq.question}</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 mt-3 mb-4 px-4">{faq.answer}</p>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-b from-blue-900 to-black text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              animate={{
                y: [0, 1000],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Start Coding Together Today
            </h2>
            <p className="text-xl mb-12 text-blue-200">
              Join thousands of developers who are already using our platform to collaborate in real-time.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('github')}
              className="bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-xl shadow-blue-500/20"
            >
              <FaGithub size={24} />
              Sign in with GitHub
            </motion.button>
            <p className="mt-6 text-blue-300">
              No credit card required. Free for individual developers.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
