var injectTapEventPlugin = require ('./node_modules/material-ui/node_modules/react-tap-event-plugin');
var xcraftReaction       = require ('./actions/xcraftReaction.js');
// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin ();


// Init xcraftBus2app
xcraftReaction ();

module.exports = {
  Workspace: require ('./components/workspace.jsx'),
  Titlebar: require ('./components/titlebar.jsx'),
  ActivityList: require ('./components/activitylist/activitylist.jsx'),
  PackageList: require ('./components/packagelist/packagelist.jsx'),
  ComponentsActions: require ('./actions/componentsActions.js')
};
