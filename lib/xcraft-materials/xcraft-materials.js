var xcraftReaction       = require ('./actions/xcraftReaction.js');
var injectTapEventPlugin = require ('./node_modules/material-ui/node_modules/react-tap-event-plugin');

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Init xcraftBus2app
xcraftReaction ();

module.exports = {
  Appspace: require ('./web-components/appspace.jsx'),
  Workspace: require ('./web-components/workspace.jsx'),
  Titlebar: require ('./web-components/titlebar.jsx'),
  ActivityList: require ('./web-components/activitylist/activitylist.jsx'),
  PackageList: require ('./web-components/packagelist/packagelist.jsx'),
  ComponentsActions: require ('./actions/componentsActions.js')
};
