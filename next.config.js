const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
      };
      
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'html', 'css', 'json', 'python', 'java'],
          features: ['coreCommands', 'find', 'format', 'hover', 'suggest'],
          filename: 'static/[name].worker.js',
        })
      );

      const cssRule = config.module.rules.find(
        rule => rule.test && rule.test.toString().includes('css')
      );
      
      if (cssRule) {
        // Make sure the rule applies to all CSS files including node_modules
        cssRule.include = undefined;
        cssRule.exclude = undefined;
      }
    }

    return config;
  },
};

module.exports = nextConfig;