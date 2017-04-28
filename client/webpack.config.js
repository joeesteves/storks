const webpack = require('webpack')
module.exports = {
  entry: './client/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  devtool: "source-map",

  module: {
    loaders: [
      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
      { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000&name=assets/fonts/[hash].[ext]' },
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
}