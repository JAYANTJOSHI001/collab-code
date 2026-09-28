import React from 'react';
import PublicNavbar from '@/components/ui/PublicNavbar';
import Footer from '@/components/ui/Footer';
import DocSidebar from './DocSidebar';
import TableOfContents from './TableOfContents';
import DocSearch from './DocSearch';
import DocBreadcrumb from './DocBreadcrumb';
import DocVersionSelector from './DocVersionSelector';

interface DocLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const DocLayout: React.FC<DocLayoutProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <div className="pt-20 pb-16 bg-gradient-to-b from-black to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-blue-200 mb-8">
                {description}
              </p>
            )}
            
            <div className="max-w-xl mx-auto mt-8">
              <DocSearch />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4 bg-gray-900 text-white p-6 rounded-lg sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto">
            <DocSidebar />
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <DocBreadcrumb />
                <div className="hidden md:block">
                  <DocVersionSelector />
                </div>
              </div>
              
              <div className="md:hidden mb-6">
                <TableOfContents />
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-3/4">
                  {children}
                </div>
                
                <div className="lg:w-1/4 hidden lg:block">
                  <div className="sticky top-24 space-y-6">
                    <TableOfContents />
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-2">Need more help?</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Can&apos;t find what you&apos;re looking for in our documentation?
                      </p>
                      <a 
                        href="/contact" 
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded inline-block transition-colors"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DocLayout;