require ('./main.less');
var React          = require ('react');
var Router         = require ('react-router');
var Route          = Router.Route;
var Redirect       = Router.Redirect;
var DefaultRoute   = Router.DefaultRoute;
var App            = require ('./app.jsx');
var Home           = require ('./home.jsx');
var xMaterials     = require ('xcraft-materials')('web');

var AppRoutes = (
  <Route name="root" path="/" handler={App}>
    <DefaultRoute handler={Home}/>
  </Route>
);

Router
  .create({
    routes: AppRoutes,
    scrollBehavior: Router.ScrollToTopBehavior
  })
  .run(function (Handler) {
    // whenever the url changes, this callback is called again
    React.render(<Handler/>, document.body);
  });
