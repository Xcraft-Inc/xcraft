/* Webpack config */
var config = require ('xcraft-core-etc').load ('xcraft-contrib-lokthar');

module.exports = {
  target: 'web',
  debug: true,
  devtool: 'source-map',
  entry: {
    main: './app.js'
  },
  output: {
    path: '.',
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ['bower_components', 'node_modules'],
  },
  module: {
    loaders: [
    {test: /\.css/, loader: 'style-loader!css-loader'},
    {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
    {test: /\.js$/, loader: 'jsx-loader'},
    {test: /\.png/, loader: 'url-loader?limit=100000&mimetype=image/png'},
    {test: /\.gif/, loader: 'url-loader?limit=100000&mimetype=image/gif'},
    {test: /\.jpg/, loader: 'file-loader'}
    ]
  },
  plugins: [
  ]
};
