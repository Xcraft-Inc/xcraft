var React          = require ('react');
var Router         = require ('react-router');
var Route          = Router.Route;
var Redirect       = Router.Redirect;
var DefaultRoute   = Router.DefaultRoute;
var Lokthar        = require ('./app-template.jsx');
var Home           = require ('./app-home.jsx');
var xMaterials     = require ('xcraft-materials')('web');
var PackageList    = xMaterials.PackageList;

var AppRoutes = (
  <Route name="root" path="/" handler={Lokthar}>
    <Route name="packagelist" handler={PackageList} />
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
