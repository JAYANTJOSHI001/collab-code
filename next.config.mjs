import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add the Monaco Editor webpack plugin
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'html', 'css', 'json', 'python', 'java'],
          filename: 'static/[name].worker.js',
        })
      );
    }
    
    return config;
  },
};

export default nextConfig;