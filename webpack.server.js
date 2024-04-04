const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  target: 'node',
  mode: 'none',
  stats: 'errors-warnings',
  entry: {
    app: './bin/www'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: './public'
  },
  devtool: false,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'ecosystem.json'),
        to: path.resolve(__dirname, 'dist', 'ecosystem.json')
      },
      {
        from: path.resolve(__dirname, 'package.json'),
        to: path.resolve(__dirname, 'dist', 'package.json')
      }
    ]),
    new Dotenv()
  ],
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/test/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: 'current'
                  }
                }
              ]
            ]
            // cacheDirectory: true
          }
        }
      }
    ]
  }
};
