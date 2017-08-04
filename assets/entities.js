// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
  name: 'Moveable',
  tryMove: function (x, y, map) {
    var tile = map.getTile(x, y);
    var target = map.getEntityAt(x, y);
    // If an entity is there, don't walk onto it
    if (target) {
      // If we are an attacker, try to attack the target
      if (this.hasMixin('Attacker')) {
        this.attack(target);
        return true;
      } else {
        return false;
      }  
      // Check if we can walk on the tile
      // and if so just walk on it
    } else if (tile.isWalkable()) {
      // Update the entity's position
      this._x = x;
      this._y = y;
      return true;
    // Check if the tile is diggable and if so, dig it  
    } else if (tile.isDiggable()) {
      map.dig(x, y);
      return true;
    }
    return false;
  }
}

// Main player's actor mixin
Game.Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act: function () {
    // Re-render the screen
    Game.refresh();
    // Lock the engine and wait asynchronously
    // for the player to press a key
    this.getMap().getEngine().lock();
    // Clear the message queue
    this.clearMessages();
  }
}

Game.Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init: function () {
    this._growthsRemaining = 5;
  },
  act: function () {
    // Check if we are going to try growing this turn
    if (this._growthsRemaining > 0) {
      if (Math.random() <= 0.02) {
        // Generate the coordinates of a random adjacent square
        // by genearting an offset between [-1, 0, 1] for both the x and y
        // directions. To do this we generate a number from 0-2 and then -1
        var xOffset = Math.floor(Math.random() * 3) - 1;
        var yOffset = Math.floor(Math.random() * 3) - 1;
        // Make sure we aren't trying to spawn on the same tile
        if (xOffset != 0 || yOffset != 0) {
          // Check if we can actally spawn at that location, and if so, grow!
          if (this.getMap().isEmptyFloor(
          this.getX() + xOffset,
          this.getY() + yOffset)) {
            var entity = new Game.Entity(Game.FungusTemplate);
            entity.setX(this.getX() + xOffset);
            entity.setY(this.getY() + yOffset);
            this.getMap().addEntity(entity);
            this._growthsRemaining--;

            // Send a message nearby
            Game.sendMessageNearby(this.getMap(),
              entity.getX(), entity.getY(),
              'The %c{green}Fungus%c{white} is spreading!');
          }
        }
      }
    }
  }
}

Game.Mixins.Destructible = {
  name: 'Destructible',
  init: function (template) {
    this._maxHp = template['maxHp'] || 10;
    // We allow taking in hp from the template in case we want more than 10
    this._hp = template['hp'] || this._maxHp;
    this._defenseValue = template['defenseValue'] || 0;
  },
  getHp: function () {
    return this._hp;
  },
  getMaxHp: function () {
    return this._maxHp;
  },
  getDefenseValue: function () {
    return this._defenseValue;
  },
  takeDamage: function (attacker, damage) {
    this._hp -= damage;
    // If have 0 or less HP, then remove ourselves from the map
    if (this._hp <= 0) {
      Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
      Game.sendMessage(this, 'You die!');
      this.getMap().removeEntity(this);
    }
  }
}

Game.Mixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init: function (template) {
    this._attackValue = template['attackValue'] || 1;
  },
  getAttackValue: function () {
    return this._attackValue;
  },
  attack: function (target) {
    // If the target is destructible, calculate the damage
    // based on attack and defense value
    if (target.hasMixin('Destructible')) {
      var attack = this.getAttackValue();
      var defense = target.getDefenseValue();
      var max = Math.max(0, attack - defense);
      var damage = 1 + Math.floor(Math.random() * max);

      Game.sendMessage(this, 'You strike the %s for %d damage!',
        [target.getName(), damage]);
      Game.sendMessage(target, 'The %s strikes you for %d damage!',
        [this.getName(), damage]);
      
      target.takeDamage(this, damage);
    }
  }
}

Game.Mixins.MessageRecipient = {
  name: 'MessageRecipient',
  init: function (template) {
    this._messages = [];
  },
  receiveMessage: function (message) {
    this._messages.push(message);
  },
  getMessages: function () {
    return this._messages;
  },
  clearMessages: function () {
    this._messages = [];
  }
}

Game.sendMessage = function (recipient, message, args) {
  // Make sure the recipient can receive the message before doing anything
  if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
    // If args were passed then format message, else no formatting necessary
    if (args) {
      message = vsprintf(message, args);
    }
    recipient.receiveMessage(message);
  }
}

Game.sendMessageNearby = function (map, centerX, centerY, message, args) {
  // If args were passed then format message, else no formatting necessary
  if (args) {
    message = vsprintf(message, args);
  }
  // Get the nearby entities
  entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
  // Iterate through nearby entities, send the message if they can get it
  for (var i = 0; i < entities.length; i++) {
    if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
      entities[i].receiveMessage(message);
    }
  }
}

// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  maxHp: 40,
  attackValue: 10,
  mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor, Game.Mixins.Attacker, Game.Mixins.Destructible, Game.Mixins.MessageRecipient]
}

Game.FungusTemplate = {
  name: '%c{green}Fungus%c{white}',
  character: 'F',
  foreground: 'green',
  maxHp: 10,
  mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}