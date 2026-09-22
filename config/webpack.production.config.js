/**
 * Webpack Production Configuration
 */

const path = require('path');
const { merge } = require('webpack-merge');
const loaders = require('./webpack.loaders');
const getPlugins = require('./webpack.plugins');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../src/web/javascripts/index/index.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true,
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      CommonComponents: path.resolve(__dirname, '../src/web/javascripts/components/commonComponents'),
      Styles: path.resolve(__dirname, '../src/web/javascripts/styles'),
      '@': path.resolve(__dirname, '../src'),
      '@web': path.resolve(__dirname, '../src/web'),
      '@javascripts': path.resolve(__dirname, '../src/web/javascripts'),
      '@pages': path.resolve(__dirname, '../src/web/javascripts/pages'),
      '@components': path.resolve(__dirname, '../src/web/javascripts/components'),
      '@redux': path.resolve(__dirname, '../src/web/javascripts/redux'),
      '@api': path.resolve(__dirname, '../src/web/javascripts/apiCalls'),
      '@constant': path.resolve(__dirname, '../src/constant'),
    },
  },
  module: {
    rules: loaders,
  },
  plugins: getPlugins('production', 'production'),
  optimization: {
    minimize: true,
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
          test: /\.(css|scss)$/,
        },
      },
    },
    runtimeChunk: 'single',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
