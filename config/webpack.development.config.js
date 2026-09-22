/**
 * Webpack Development Configuration
 */

const path = require('path');
const { merge } = require('webpack-merge');
const loaders = require('./webpack.loaders');
const getPlugins = require('./webpack.plugins');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
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
  plugins: getPlugins('development', 'development'),
  devServer: {
    static: {
      directory: path.resolve(__dirname, '../public'),
      publicPath: '/',
    },
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    open: false,
    hot: true,
    historyApiFallback: true,
    compress: true,
    liveReload: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/webpack'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single',
  },
};
