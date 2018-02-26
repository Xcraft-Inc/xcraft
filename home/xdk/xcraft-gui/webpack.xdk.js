/* Webpack config */
var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __WEBPACK__: true,
});

module.exports = {
  target: 'atom',
  debug: true,
  context: __dirname,
  devtool: 'source-map',
  entry: {
    main: './app.jsx',
  },
  output: {
    path: './release/',
    filename: 'bundle.js',
    publicPath: './release/',
  },
  resolve: {
    modulesDirectories: ['bower_components', 'node_modules'],
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
      {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'},
      {test: /\.jsx$/, loader: 'jsx-loader?harmony&insertPragma=React.DOM'},
      {test: /\.png$/, loader: 'url-loader?limit=100000&mimetype=image/png'},
      {test: /\.gif$/, loader: 'url-loader?limit=100000&mimetype=image/gif'},
      {test: /\.jpg$/, loader: 'url-loader?limit=100000&mimetype=image/jpg'},
      {test: /\.(ttf|eot|svg|woff)/, loader: 'file-loader'},
    ],
  },
  plugins: [definePlugin],
};
