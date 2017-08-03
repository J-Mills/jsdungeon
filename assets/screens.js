Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
  enter: function () { console.log('Entered the start screen.'); },
  exit: function () { console.log('Exited the start screen'); },
  render: function (display) {
    // Render our prompt to the screen
    display.drawText(29, 9, '%c{yellow}Javascript Roguelike');
    display.drawText(28, 10, 'Press [Enter] to start!');
    display.drawText(33, 14, '%c{yellow}/|%c{grey}________________');
    display.drawText(27, 15, '%c{red}O%c{yellow}|===|*|%c{grey}________________>');
    display.drawText(33, 16, '%c{yellow}\\|');
    // display.drawText(40, 3, 'O');
  },
  handleInput: function (inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.cutsceneScreen);
      }
    }
  }
}

// Define a cutscene screen
Game.Screen.cutsceneScreen = {
  enter: function () { console.log('Entered the cutscene screen'); },
  exit: function () { console.log('Exited the cutscene screen.'); },
  render: function (display) {
    display.drawText(1, 1, '%c{green}You stand at the mouth of a cave...');
    display.drawText(1, 2, '%c{white}Press [Enter] to descend.');
  },
  handleInput: function (inputType, inputData) {
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.playScreen)
      }
    }
  }
}

// Define our playing screen
Game.Screen.playScreen = {
  _map: null,
  _player: 0,
  enter: function () {
    var map = [];
    // Create a map based on our size parameters
    var mapWidth = 100;
    var mapHeight = 48;
    for (var x = 0; x < mapWidth; x++) {
      // Create the nested array for the y values
      map.push([]);
      // Add all the tiles
      for (var y = 0; y < mapHeight; y++) {
        map[x].push(Game.Tile.nullTile);
      }
    }
    // Setup the map generator
    var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
    // var generator = new ROT.Map.Uniform(mapWidth, mapHeight, { timeLimit: 5000 });
    generator.randomize(0.5);
    var totalIterations = 3;
    // Iteratively smooth the map
    for (var i = 0; i < totalIterations - 1; i++) {
      generator.create();
    }
    // Smooth it one last time and then update the map
    generator.create(function (x, y, v) {
      if (v === 1) {
        map[x][y] = Game.Tile.floorTile;
      } else {
        map[x][y] = Game.Tile.wallTile;
      }
    });
    // Create our map from the tiles and player
    this._player = new Game.Entity(Game.PlayerTemplate);
    this._map = new Game.Map(map, this._player);
    // Start the map's engine
    this._map.getEngine().start();
    // this._map = new Game.Map(map);
    // // Create our player and set the position
    // this._player = new Game.Entity(Game.PlayerTemplate);
    // var position = this._map.getRandomFloorPosition();
    // this._player.setX(position.x);
    // this._player.setY(position.y);
    console.log('Entered the play screen.');
  },
  exit: function () { console.log('Exited the play screen.'); },
  render: function (display) {
    var screenWidth = Game.getScreenWidth();
    var screenHeight = Game.getScreenHeight();
    // Make sure the x-axis doesn't go beyond the left bound
    var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
    // Make sure we still have enough space to fit an entire game screen
    topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
    // Make sure the y-axis doesn't go above the top bound
    var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
    // Make sure we still have enough space to fit an entire game screen
    topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
    // Iterate through all map cells
    for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
        // Fetch the glyph for the tile and render it to the screen
        var tile = this._map.getTile(x, y);
        display.draw(
          x - topLeftX,
          y - topLeftY,
          tile.getChar(),
          tile.getForeground(),
          tile.getBackground());
      }
    }
    // Render the player
    display.draw(
      this._player.getX() - topLeftX,
      this._player.getY() - topLeftY,
      this._player.getChar(),
      this._player.getForeground(),
      this._player.getBackground(),
    );
    // Render the entities
    var entities = this._map.getEntities();
    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      // Only render the entity if they would show up on the screen
      if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
        entity.getX() < topLeftX + screenWidth &&
        entity.getY() < topLeftY + screenHeight) {
        display.draw(
          entity.getX() - topLeftX, 
          entity.getY() - topLeftY,    
          entity.getChar(), 
          entity.getForeground(), 
          entity.getBackground()
        );
      }
    }
  },
  handleInput: function (inputType, inputData) {
    if (inputType === 'keydown') {
      // If Enter is pressed, go to the win screen
      // If Esc is pressed, go to the lose screen
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.winScreen);
      } else if (inputData.keyCode === ROT.VK_ESCAPE) {
        Game.switchScreen(Game.Screen.loseScreen);
      }
      // Movement
      if (inputData.keyCode === ROT.VK_A) {
        this.move(-1, 0);
      } else if (inputData.keyCode === ROT.VK_D) {
        this.move(1, 0);
      } else if (inputData.keyCode === ROT.VK_W) {
        this.move(0, -1);
      } else if (inputData.keyCode === ROT.VK_S) {
        this.move(0, 1);
      }
      // Unlock the engine
      this._map.getEngine().unlock();
    }
  },
  move: function (dX, dY) {
    var newX = this._player.getX() + dX;
    var newY = this._player.getY() + dY;
    // Try to move to the new cell
    this._player.tryMove(newX, newY, this._map);
  }
}

// Define our winning screen
Game.Screen.winScreen = {
  enter: function () { console.log('Entered win screen.'); },
  exit: function () { console.log('Exited win screen.'); },
  render: function (display) {
    // Render our prompt to the screen
    for (var i = 0; i < 22; i++) {
      // Generate random background colors
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);
      var background = ROT.Color.toRGB([r, g, b]);
      display.drawText(2, i + 1, '%b{' + background + '}You win!');
    }
  },
  handleInput: function (inputType, inputData) {
    // Nothing to do here
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.winScreen);
      }
    }
  }
}

// Define our losing screen
Game.Screen.loseScreen = {
  enter: function () { console.log('Entered lose screen.'); },
  exit: function () { console.log('Exited lose screen'); },
  render: function (display) {
    // Render our prompt to the screen
    for (var i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red} You Lose! :(');
    }
  },
  handleInput: function (inputType, inputData) {
    // Nothing to do here
  }
}