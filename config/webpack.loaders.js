/**
 * Webpack Loaders Configuration
 * Contains all loader rules for different file types
 */

const path = require('path');

module.exports = [
  // JavaScript/JSX files - Babel loader
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    },
  },
  // CSS files
  {
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, '../postcss.config.js'),
          },
        },
      },
    ],
  },
  // SCSS files
  {
    test: /\.scss$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, '../postcss.config.js'),
          },
        },
      },
      'sass-loader',
    ],
  },
  // Images
  {
    test: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'images/[name].[contenthash][ext]',
    },
  },
  // Fonts
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name].[contenthash][ext]',
    },
  },
  // Other assets
  {
    test: /\.(pdf|doc|docx|xls|xlsx)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/[name].[contenthash][ext]',
    },
  },
];
