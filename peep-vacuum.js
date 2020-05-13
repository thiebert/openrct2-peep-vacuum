// Sample script that adds functions for manipulating peeps

// #5827: change guest's clothes colours 
var downCoord;
var currentCoord;

function selectTheMap() {
  var left = Math.min(downCoord.x, currentCoord.x);
  var right = Math.max(downCoord.x, currentCoord.x);
  var top = Math.min(downCoord.y, currentCoord.y);
  var bottom = Math.max(downCoord.y, currentCoord.y);
  ui.tileSelection.range = {
    leftTop: {
      x: left,
      y: top
    },
    rightBottom: {
      x: right,
      y: bottom
    }
  };
}

function removePeeps(x, y) {
  for (var i = 0; i < map.numEntities; i++) {
    var entity = map.getEntity(i);
    if (entity && entity.type === 'peep') {
      if (entity.x == x && entity.y == y) {
        entity.remove();
      }
    }
  }
}

function removePeepsOnSelection() {
  var left = Math.min(downCoord.x, currentCoord.x);
  var right = Math.max(downCoord.x, currentCoord.x);
  var top = Math.min(downCoord.y, currentCoord.y);
  var bottom = Math.max(downCoord.y, currentCoord.y);
  for (var x = left; x <= right; x += 32) {
    for (var y = top; y <= bottom; y += 32) {
      removePeeps(x, y);
    }
  }
}

var main = function () {
  if (typeof ui === 'undefined') {
    return;
  }
  var window = null;
  ui.registerMenuItem("Activate Peep Vacuum", function () {
    if (ui.tool && ui.tool.id == "peep-vacuum-tool") {
      ui.tool.cancel();
    } else {
      ui.activateTool({
        id: "peep-vacuum-tool",
        cursor: "cross_hair",
        onStart: function (e) {
          ui.mainViewport.visibilityFlags |= (1 << 7);
        },
        onDown: function (e) {
          downCoord = e.mapCoords;
          currentCoord = e.mapCoords;
        },
        onMove: function (e) {
          if (e.mapCoords.x != 0 || e.mapCoords.y != 0) {
            if (e.isDown) {
              currentCoord = e.mapCoords;
              selectTheMap();
            } else {
              downCoord = e.mapCoords;
              currentCoord = e.mapCoords;
              selectTheMap();
            }
          }
        },
        onUp: function (e) {
          removePeepsOnSelection();
          ui.tileSelection.range = null;
        },
        onFinish: function () {
          ui.tileSelection.range = null;
          ui.mainViewport.visibilityFlags &= ~(1 << 7);
          if (window != null)
            window.close();
        },
      });

      if (window == null) {
        var width = 220;
        var buttonWidth = 50;
        window = ui.openWindow({
          classification: 'park',
          title: "Peep Vacuum",
          width: width,
          height: 60,
          widgets: [{
              type: 'label',
              name: 'label-description',
              x: 3,
              y: 23,
              width: width - 6,
              height: 26,
              text: "Drag to remove peeps."
            },
            {
              type: 'button',
              name: "button-cancel",
              x: width - buttonWidth - 3,
              y: 40,
              width: buttonWidth,
              height: 16,
              text: "Cancel",
              onClick: function () {
                if (window != null)
                  window.close();
              }
            }
          ],
          onClose: function () {
            window = null;
            if (ui.tool && ui.tool.id == "peep-vacuum-tool") {
              ui.tool.cancel();
            }
          }
        });
      } else {
        window.bringToFront();
      }
    }
  });
};

registerPlugin({
  name: 'Peep Tools',
  version: '1.0',
  authors: ['OpenRCT2'],
  type: 'remote',
  main: main
});