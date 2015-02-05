require ('../sass/launcher.scss');
var React        = require ('react');
var ipc          = require ('ipc');
var remote       = require ('remote');
var Launcher     = React.createClass ({

  mixins: [],

  propTypes: {
    menuEntries: React.PropTypes.array
  },

  render: function () {
    return (
      <ul className="drawer">
        {this._renderLauncher ()}
      </ul>
    );
  },

  _renderLauncher: function () {
    var menuEntry;
    var menuEntryComponent, itemComponent, itemListComponent;
    var launcher = [];


    for (var i=0; i < this.props.menuEntries.length; i++) {
      menuEntry = this.props.menuEntries[i];
      itemListComponent = [];
      for (var ii=0; ii < menuEntry.items.length; ii++) {
        item = menuEntry.items[ii];
        itemComponent = (
          <li key={ii}>
            <a href="#" onTouchTap={item.action}>
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </a>
          </li>
        );
        itemListComponent.push (itemComponent);
      };

      menuEntryComponent = (
        <li key={i} index={i}>
          <a href="#">
            <i className={menuEntry.icon}></i>
            <span>{menuEntry.name}</span>
          </a>
          <ul>
            {itemListComponent}
          </ul>
        </li>
      );
      launcher.push (menuEntryComponent);
    }
    return launcher;
  }

});

module.exports = Launcher;
