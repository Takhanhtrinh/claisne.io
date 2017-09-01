/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = (_entries, _options = {}) => {
  const options = _options;

  if (options.directory == null) {
    options.directory = '.';
  }

  const PROD = process.argv.includes('-p');

  const plugins = [
    new webpack.LoaderOptionsPlugin({
      context: __dirname,
    }),
    new ExtractTextWebpackPlugin('css/[name].css'),
  ];

  if (options.images === true) {
    plugins.push(
      new CopyWebpackPlugin([
        { from: path.join('src', options.directory, '/img/'), to: 'img/' },
        { from: path.join('src', options.directory, '/assets/'), to: 'assets/' },
      ]));
  }

  if (PROD === true) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
      }));

    plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: true,
        drop_console: true,
      },
      output: { comments: false },
    }));

    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  }

  const entries = {};

  _entries.forEach((entry) => {
    entries[entry] = path.join(__dirname, 'src', options.directory, entry);
  });

  return {
    entry: entries,
    output: {
      path: path.join(__dirname, path.join('/dist/', options.directory)),
      filename: 'js/[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /mapbox/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['env', {
                target: {
                  browser: ['> 5%'],
                },
              }]],
            },
          },
        },
        {
          test: /\.css$/,
          use: ExtractTextWebpackPlugin.extract({
            fallback: 'style-loader',
            use: { loader: 'css-loader' },
          }),
        },
        {
          test: /\.scss$/,
          use: ExtractTextWebpackPlugin.extract({
            use: [
              { loader: 'css-loader' },
              { loader: 'sass-loader' },
            ],
          }),
        },
        {
          test: /\.ejs$/,
          use: 'ejs-loader',
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: 'file-loader?name=/fonts/[name].[ext]',
        },
        {
          exclude: /ionicons/,
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'file-loader?name=/img/[name].[ext]',
            'image-webpack-loader',
          ],
        },
        { test: /\.csv$/, loader: 'dsv-loader' },
      ],
    },
    plugins: Object.keys(entries).map(entry =>
      new HtmlWebpackPlugin({
        entry,
        chunks: [entry],
        filename: `${entry}.html`,
        template: path.join('src', options.directory, 'template.ejs'),
        cache: true,
        hash: true,
      })).concat(plugins),
  };
};
