const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
      };
      
      // Add Monaco Editor webpack plugin
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'html', 'css', 'json'],
          features: ['coreCommands', 'find', 'format', 'hover', 'suggest']
        })
      );

      // Ensure CSS files are properly processed
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