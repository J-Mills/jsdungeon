var Game = {
  _display: null,
  _currentScreen: null,
  _screenWidth: 80,
  _screenHeight: 24,
  init: function () {
    // Initialization goes here
    // Create a display X characters wide and Y characters high
    this._display = new ROT.Display({
      width: this._screenWidth,
      height: this._screenHeight + 1,
      fontFamily: 'monospace',
    });
    // Create a helper function for binding to an event
    // and making it send it to the screen
    var game = this; // so that we don't lose this
    var bindEventToScreen = function (event) {
      window.addEventListener(event, function (e) {
        // When an event is received, sent it to the screen if it exists
        if (game._currentScreen !== null) {
          // Send the event type and data to the screen
          game._currentScreen.handleInput(event, e);
        }
      });
    }
    // Bind keyboard input events
    bindEventToScreen('keydown');
    //bindEventToScreen('keyup');
    //bindEventToScreen('keypress');
  },
  getDisplay: function () {
    return this._display;
  },
  getScreenWidth: function () {
    return this._screenWidth;
  },
  getScreenHeight: function () {
    return this._screenHeight;
  },
  switchScreen: function (screen) {
    // Notify previous screen that we exited
    if (this._currentScreen !== null) {
      this._currentScreen.exit();
    }
    // Clear the display
    this.getDisplay().clear();
    // Update current screen, notify that we entered and render
    this._currentScreen = screen;
    if (this._currentScreen) {
      this._currentScreen.enter();
      this.refresh();
    }
  },
  refresh: function () {
    // Clear the screen
    this._display.clear();
    // Render the screen
    this._currentScreen.render(this._display);
  }
};

window.onload = function () {
  // Check if the rot.js library works in this browser
  if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported in your browser.");
  } else {
    // Initialize game
    Game.init();
    // Add container to the page
    document.body.appendChild(Game.getDisplay().getContainer());
    // Load the start screen
    Game.switchScreen(Game.Screen.startScreen);

    // var foreground, background, colors;
    // for (var i = 0; i < 15; i++) {
    //   // Calculate the foreground colour, getting darker
    //   // and the background colour, getting lighter
    //   foreground = ROT.Color.toRGB(
    //     [255 - (i * 20),
    //      255 - (i * 20),
    //      255 - (i * 20)
    //     ]);
    //   background = ROT.Color.toRGB([i * 20, i * 20, i * 20]);
    //   // Create the color format specifier
    //   colors = "%c{" + foreground + "}%b{" + background + "}";
    //   // Draw the text at col 2 and row i
    //   display.drawText(2, i, colors + "Hello world!");
    // };
  };
};
