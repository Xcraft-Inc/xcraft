var actions = require ('../actions/ttyComponentsActions.js');
var displayLogo = actions.displayLogo;
module.exports = function () {
  displayLogo.listen(function () {
    console.log ('\n____  ___                   _____  __   ');
    console.log ('\\   \\/  /________________ _/ ____\\/  |_ ');
    console.log (' \\     // ___\\_  __ \\__  \\\\   __\\\\   __\\');
    console.log (' /     \\  \\___|  | \\// __ \\|  |   |  |  ');
    console.log ('/___/\\  \\___  >__|  (____  /__|   |__|  ');
    console.log ('    \\_/   \\/           \\/            \n');
  });
};
