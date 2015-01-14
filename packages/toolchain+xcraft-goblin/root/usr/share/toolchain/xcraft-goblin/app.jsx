var React          = require ('react');
var Router         = require ('react-router');
var Route          = Router.Route;
var Redirect       = Router.Redirect;
var DefaultRoute   = Router.DefaultRoute;
var Desktop        = require ('./desktop.jsx');
var xMaterials     = require ('xcraft-materials');
var PackageList    = xMaterials.PackageList;

var AppRoutes = (
  <Route name="root" path="/" handler={Desktop}>
    <DefaultRoute handler={Desktop}/>
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
