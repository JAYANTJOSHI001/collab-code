"use client"

import React, { useEffect } from 'react';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FaGithub, FaCode, FaUsers, FaPlay, FaHistory, FaComments, FaMoon, FaShare } from 'react-icons/fa';
import { useRouter } from "next/navigation";

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

const codeExamples = [
  {
    title: "Real-time Collaboration",
    language: "typescript",
    code: `// Real-time collaboration in action
function Editor() {
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });
    
    socket.on("user-joined", (user) => {
      setUsers([...users, user]);
      showNotification(\`\${user.name} joined\`);
    });
  }, []);

  // Multiple cursors support
  const handleCursorMove = (position) => {
    socket.emit("cursor-move", { position });
  };
}`
  },
  {
    title: "Python Code Execution",
    language: "python",
    code: `# Execute code in real-time
class CodeExecutor:
    def __init__(self):
        self.output = []
        
    def run_code(self, code: str):
        try:
            # Secure sandbox environment
            result = exec(code)
            self.output.append({
                'type': 'success',
                'result': result
            })
        except Exception as e:
            self.output.append({
                'type': 'error',
                'error': str(e)
            })
            
# Live execution
executor = CodeExecutor()
executor.run_code(user_input)`
  },
  {
    title: "Git Integration",
    language: "bash",
    code: `# Seamless Git operations
$ git checkout -b feature/new-component
$ git add src/components/NewFeature.tsx
$ git commit -m "Add new collaborative feature"

# Real-time branch updates
$ git pull origin main
$ git push origin feature/new-component

# Create PR directly from the editor
$ gh pr create --title "New Feature" --body "..."
`
  }
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
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
      ease: "easeInOut"
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-50"
        style={{ scaleX: scaleProgress }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black text-white min-h-screen flex items-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-white"
              initial={{ opacity: 0.1 }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
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

        <div className="container mx-auto px-4 py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: yPosAnim, opacity: opacityAnim }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Floating shapes */}
            <motion.div
              animate={floatingAnim}
              className="absolute -left-20 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={floatingAnim}
              transition={{ delay: 1 }}
              className="absolute -right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"
            />

            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight relative">
              Code Together,
              <br />
              <span className="text-neutral-400">Instantly.</span>
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
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:bg-neutral-100 transition-colors"
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
              <div className="bg-neutral-900 rounded-xl p-6 text-left shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-sm md:text-base font-mono overflow-x-auto">
                  <code className="language-typescript">
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
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Animated dots background */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-black rounded-full"
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for
              <br />
              <span className="text-neutral-400">Modern Development</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl hover:bg-neutral-50 transition-all relative group"
              >
                <motion.div
                  className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ filter: "blur(20px)" }}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-optimized sections */}
      <section className="py-32 bg-black text-white overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center md:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Seamless Collaboration
              </h2>
              <p className="text-xl text-neutral-400">
                Work together in real-time, just like you would in Google Docs or Figma.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
                <img
                  src="/collaboration.png"
                  alt="Collaboration"
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced testimonials with hover effects */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Developers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-2xl bg-neutral-50 hover:shadow-xl transition-all relative group"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -top-4 -right-4 text-4xl"
                >
                  "
                </motion.div>
                <p className="text-lg mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-neutral-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA with floating elements */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Start Collaborating?
            </h2>
            <p className="text-xl mb-12 text-neutral-400">
              Join thousands of developers who are already using our platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('github')}
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:bg-neutral-100 transition-colors"
            >
              <FaGithub size={24} />
              Start Coding Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Responsive footer */}
      <footer className="py-12 bg-white border-t border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Terms</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Privacy</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">Community</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-black transition-colors">API</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
