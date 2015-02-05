'use strict';

var xcraftReaction = require ('./actions/xcraftReaction.js');

module.exports = function (type, busClient) {
  if (busClient) {
    xcraftReaction (busClient);
  } else {
    xcraftReaction ();
  }

  switch (type) {
  case 'web': {
    var injectTapEventPlugin = require ('./node_modules/material-ui/node_modules/react-tap-event-plugin');

    /* Needed for onTouchTap
     * Can go away when react 1.0 release
     * Check this repo:
     * https://github.com/zilverline/react-tap-event-plugin
     */
    injectTapEventPlugin();
    return {
      Desktop: require ('./web-components/desktop.jsx'),
      Launcher: require ('./web-components/launcher.jsx'),
      Window: require ('./web-components/window.jsx'),
      Workspace: require ('./web-components/workspace.jsx'),
      Titlebar: require ('./web-components/titlebar.jsx'),
      ActivityList: require ('./web-components/activitylist.jsx'),
      PackageList: require ('./web-components/packagelist.jsx'),
      GadgetList: require ('./web-components/gadgetlist.jsx'),
      Actions: require ('./actions/webComponentsActions.js')
    };
  }

  default:
  case 'tty': {
    return {
      XcraftLogo: require ('./tty-components/xcraftlogo.js'),
      ActivityList: require ('./tty-components/activitylist.js'),
      PackageList: require ('./tty-components/packagelist.js'),
      Actions: require ('./actions/ttyComponentsActions.js')
    };
  }
  }
};
