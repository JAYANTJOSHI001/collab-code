"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PublicNavbar from '@/components/ui/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  FaGithub, 
  FaSearch, 
  FaCode, 
  FaProjectDiagram, 
  FaHistory, 
  FaTerminal, 
  FaComments, 
  FaQuestion,
  FaLaptopCode,
  FaBook,
  FaTools,
  FaExclamationTriangle
} from 'react-icons/fa';
import Footer from '@/components/ui/Footer';

export default function DocsPage() {
  // Documentation categories
  const docCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <FaBook size={20} className="text-blue-500" />,
      description: "Learn the basics of Collab and start your first project"
    },
    {
      id: "faq",
      title: "FAQ",
      icon: <FaQuestion size={20} className="text-purple-500" />,
      description: "Answers to commonly asked questions"
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <FaTools size={20} className="text-amber-500" />,
      description: "Solutions to common issues"
    }
  ];

  // Getting started steps
  const gettingStartedSteps = [
    {
      title: "Sign up with GitHub",
      description: "Click the 'Sign in with GitHub' button on the homepage. You'll be redirected to GitHub to authorize Collab.",
      image: "/docs/signup.png" // Placeholder path
    },
    {
      title: "Create a new project",
      description: "From your dashboard, click 'New Project'. Give it a name and select a template or start from scratch.",
      image: "/docs/dashboard.png" // Placeholder path
    },
    {
      title: "Invite collaborators",
      description: "Open your project settings and click 'Invite'. Enter GitHub usernames or email addresses to invite team members.",
      image: "/docs/share.png" // Placeholder path
    },
    {
      title: "Start coding together",
      description: "Open the editor and start coding! You'll see your collaborators' cursors in real-time as they work.",
      image: "/docs/coding.png" // Placeholder path
    }
  ];

  // Feature guides
  const featureGuides = [
    {
      id: "live-collaboration",
      title: "Live Code Collaboration",
      icon: <FaCode size={24} className="text-blue-500" />,
      description: "Work with teammates on the same file in real-time",
      content: "Collab's real-time collaboration allows multiple developers to work on the same file simultaneously. Changes appear instantly for all participants, with each user's cursor visible and color-coded.",
      steps: [
        "Open a project and navigate to a file",
        "Share the project link with collaborators",
        "See real-time updates as everyone types",
        "Hover over a colored cursor to see who's editing"
      ]
    },
    {
      id: "project-management",
      title: "Project Management",
      icon: <FaProjectDiagram size={24} className="text-purple-500" />,
      description: "Create, organize and manage your coding projects",
      content: "Organize your work with powerful project management features. Create multiple projects, invite team members, and set custom permissions.",
      steps: [
        "Create projects from the dashboard",
        "Organize files in folders",
        "Set access permissions for team members",
        "Track project activity and contributions"
      ]
    },
    {
      id: "editor-features",
      title: "Editor Features",
      icon: <FaLaptopCode size={24} className="text-indigo-500" />,
      description: "Powerful code editing with syntax highlighting and more",
      content: "Collab uses Monaco Editor (the same editor powering VS Code) to provide a professional coding experience with syntax highlighting, auto-completion, and more.",
      steps: [
        "Choose from light or dark themes",
        "Adjust font size and editor settings",
        "Use keyboard shortcuts for efficiency",
        "Enable language-specific features"
      ]
    },
    {
      id: "version-control",
      title: "Version Control",
      icon: <FaHistory size={24} className="text-amber-500" />,
      description: "Track changes and restore previous versions",
      content: "Never lose your work with built-in version control. Track changes, view previous versions, and restore code as needed.",
      steps: [
        "View the history of any file",
        "Compare changes between versions",
        "Restore code to a previous state",
        "See who made specific changes"
      ]
    },
    {
      id: "github-integration",
      title: "GitHub Integration",
      icon: <FaGithub size={24} className="text-gray-800" />,
      description: "Seamlessly connect with your GitHub repositories",
      content: "Import existing GitHub repositories or export your Collab projects to GitHub with just a few clicks.",
      steps: [
        "Connect your GitHub account",
        "Import repositories to Collab",
        "Push changes back to GitHub",
        "Manage repository settings"
      ]
    },
    {
      id: "code-execution",
      title: "Running Code in Browser",
      icon: <FaTerminal size={24} className="text-red-500" />,
      description: "Execute code directly in your browser",
      content: "Run your code directly in the browser without any setup. See results instantly in a dedicated console panel.",
      steps: [
        "Select a supported language (JavaScript, Python)",
        "Write your code in the editor",
        "Click 'Run' to execute",
        "View output in the console panel"
      ]
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Is Collab free to use?",
      answer: "Yes, Collab is free for individual developers and small teams. We also offer premium plans for larger teams with additional features and support."
    },
    {
      question: "What programming languages are supported?",
      answer: "Collab supports syntax highlighting for over 30 programming languages including JavaScript, TypeScript, Python, Java, C++, Ruby, PHP, Go, and more. Code execution is currently supported for JavaScript and Python."
    },
    {
      question: "How do I recover lost code?",
      answer: "Collab automatically saves your work and maintains a version history. To recover lost code, go to the file's history tab and restore a previous version."
    },
    {
      question: "Can I use Collab for open-source projects?",
      answer: "Absolutely! Collab is perfect for open-source collaboration. You can import your GitHub repositories and collaborate with contributors in real-time."
    },
    {
      question: "How many collaborators can work on a project?",
      answer: "The free plan supports up to 5 simultaneous collaborators. Premium plans allow for unlimited collaborators."
    },
    {
      question: "Is my code secure?",
      answer: "Yes, we take security seriously. All code is encrypted in transit and at rest. We never share your code with third parties, and private projects remain completely private."
    },
    {
      question: "Can I work offline?",
      answer: "Currently, Collab requires an internet connection for real-time collaboration. We're working on an offline mode that will sync changes when you reconnect."
    },
    {
      question: "How do I report bugs or request features?",
      answer: "You can report bugs or request features through our GitHub repository or by contacting support at support@collabcode.dev."
    }
  ];

  // Troubleshooting issues
  const troubleshootingIssues = [
    {
      issue: "Can't sign in with GitHub",
      solution: "Make sure you're allowing pop-ups in your browser. Try clearing your browser cache and cookies, then attempt to sign in again. If the problem persists, check if GitHub is experiencing any service disruptions."
    },
    {
      issue: "Changes aren't syncing in real-time",
      solution: "Check your internet connection. If you're connected but still experiencing issues, try refreshing the page. If the problem continues, another collaborator might have conflicting changes. Try to coordinate with your team."
    },
    {
      issue: "Editor is slow or unresponsive",
      solution: "Large files can cause performance issues. Try breaking your code into smaller files. Also, check if you have too many browser tabs open, as this can affect performance. Clearing your browser cache may also help."
    },
    {
      issue: "Can't invite collaborators",
      solution: "Ensure you have the correct permissions for the project. Only project owners and admins can invite new collaborators. Also, verify that you're entering the correct GitHub username or email address."
    },
    {
      issue: "Code execution not working",
      solution: "Make sure you're using a supported language for execution (currently JavaScript and Python). Check for syntax errors in your code. If the problem persists, try using a different browser."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-black to-blue-900 text-white">
        <div className="container mx-auto px-4 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Comprehensive Guides for Seamless Collaboration
            </h1>
            <p className="text-xl text-blue-200 mb-12">
              Get started with Collab, explore its features, and troubleshoot any issues effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {docCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="block h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Documentation Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12">
                <TabsTrigger value="getting-started" className="text-sm md:text-base">Getting Started</TabsTrigger>
                <TabsTrigger value="faq" className="text-sm md:text-base">FAQ</TabsTrigger>
                <TabsTrigger value="troubleshooting" className="text-sm md:text-base">Troubleshooting</TabsTrigger>
              </TabsList>
              
              {/* Getting Started Tab */}
              <TabsContent value="getting-started" id="getting-started">
                <div className="bg-white rounded-xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold mb-6 text-blue-900">Getting Started with Collab</h2>
                  <p className="text-gray-600 mb-8">
                    Welcome to Collab! Follow these simple steps to start collaborating with your team in real-time.
                  </p>
                  
                  <div className="space-y-12">
                    {gettingStartedSteps.map((step, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex gap-8 items-start"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-4">{step.description}</p>
                        </div>
                        <div className="flex-1">
                          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                            <Image
                              src={step.image}
                              alt={step.title}
                              width={500}
                              height={300}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              {/* FAQ Tab */}
              <TabsContent value="faq" id="faq">
                <div className="bg-white rounded-xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold mb-6 text-blue-900">Frequently Asked Questions</h2>
                  <p className="text-gray-600 mb-8">
                    Find answers to common questions about Collab.
                  </p>

                  <Accordion type="single" collapsible className="space-y-4">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border border-gray-200 rounded-lg">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <span className="text-left font-semibold">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-gray-600">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              {/* Troubleshooting Tab */}
              <TabsContent value="troubleshooting" id="troubleshooting">
                <div className="bg-white rounded-xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold mb-6 text-blue-900">Troubleshooting Guide</h2>
                  <p className="text-gray-600 mb-8">
                    Find solutions to common issues and get help when you need it.
                  </p>

                  <div className="space-y-6">
                    {troubleshootingIssues.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="border border-gray-200 rounded-xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                            <FaExclamationTriangle size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{item.issue}</h3>
                            <p className="text-gray-600">{item.solution}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}