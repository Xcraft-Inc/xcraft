var React          = require ('react');
var Router         = require ('react-router');
var Route          = Router.Route;
var Redirect       = Router.Redirect;
var DefaultRoute   = Router.DefaultRoute;
var Goblin         = require ('./goblin.jsx');

var AppRoutes = (
  <Route name="root" path="/" handler={Goblin}>
    <DefaultRoute handler={Goblin}/>
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
