/* Webpack config */
module.exports = {
  target: 'atom',
  debug: true,
  devtool: 'source-map',
  entry: {
    main: './app.jsx'
  },
  output: {
    path: './release/',
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ['bower_components', 'node_modules'],
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
      {test: /\.jsx$/, loader: 'jsx-loader?harmony&insertPragma=React.DOM'},
      {test: /\.png$/, loader: 'url-loader?limit=100000&mimetype=image/png'},
      {test: /\.gif$/, loader: 'url-loader?limit=100000&mimetype=image/gif'},
      {test: /\.jpg$/, loader: 'file-loader'},
      {test: /\.(ttf|eot|svg|woff)/, loader: 'file-loader'}
    ]
  },
  plugins: [
  ]
};
