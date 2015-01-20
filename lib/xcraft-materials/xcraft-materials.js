var xcraftReaction       = require ('./actions/xcraftReaction.js');

var webComponents = {
  Window: require ('./web-components/window.jsx'),
  Workspace: require ('./web-components/workspace.jsx'),
  Titlebar: require ('./web-components/titlebar.jsx'),
  ActivityList: require ('./web-components/activitylist/activitylist.jsx'),
  PackageList: require ('./web-components/packagelist/packagelist.jsx'),
  Actions: require ('./actions/webComponentsActions.js')
};

var consoleComponents = {
  Logo: require ('./console-components/logo.js')
};

module.exports = function (type, busClient) {
  console.log ('Xcraft-materials init');
  if (busClient) {
    xcraftReaction (busClient);
  } else {
    xcraftReaction ();
  }
  if (type === 'web') {
    var injectTapEventPlugin = require ('./node_modules/material-ui/node_modules/react-tap-event-plugin');
    // Needed for onTouchTap
    // Can go away when react 1.0 release
    // Check this repo:
    // https://github.com/zilverline/react-tap-event-plugin
    injectTapEventPlugin();
    return webComponents;
  } else {
    return consoleComponents;
  }
}
