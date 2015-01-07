var injectTapEventPlugin = require('./node_modules/material-ui/node_modules/react-tap-event-plugin');

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

module.exports = {
  Titlebar: require ('./components/titlebar.jsx')
};
