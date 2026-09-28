const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        // Don't exclude node_modules to allow processing xterm.css
        include: undefined,
        exclude: undefined
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'html', 'css', 'json'],
      features: ['coreCommands', 'find', 'format', 'hover', 'suggest']
    })
  ]
};