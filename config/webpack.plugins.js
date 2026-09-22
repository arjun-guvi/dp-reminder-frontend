/**
 * Webpack Plugins Configuration
 * Contains all plugin configurations
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const Dotenv = require('dotenv-webpack');

// Helper to determine which .env file to load
const getEnvFile = (env) => {
  const envMap = {
    development: '.env.development',
    production: '.env.production',
    beta: '.env.beta',
  };
  return envMap[env] || '.env.development';
};

module.exports = (env, mode) => {
  const plugins = [
    // HTML Webpack Plugin
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/web/index.html'),
      filename: 'index.html',
      inject: true,
      minify: mode === 'production' ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true,
      } : false,
    }),
    // Environment Variables
    new Dotenv({
      path: path.resolve(__dirname, `../env/${getEnvFile(env)}`),
      safe: false,
      systemvars: mode === 'production',
      defaults: true,
    }),
    // Define Plugin for mode
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
    }),
  ];

  // Add linting plugins only in development
  if (mode === 'development') {
    plugins.push(
      new ESLintPlugin({
        eslintPath: require.resolve('eslint'),
        context: path.resolve(__dirname, '../src'),
        failOnError: false,
        emitWarning: true,
      }),
      new StylelintPlugin({
        context: path.resolve(__dirname, '../src'),
        files: '**/*.(scss|css)',
        emitWarning: true,
      })
    );
  }

  return plugins;
};
