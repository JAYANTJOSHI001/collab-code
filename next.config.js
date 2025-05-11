const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([
  "monaco-editor",
]);

const nextConfig = withTM({
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
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
    }

    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    config.module.rules.push({
      test: /tailwindcss-animate\/index\.js$/,
      type: 'javascript/auto',
    });

    return config;
  },
});

module.exports = nextConfig