Game.Tile = function (properties) {
  properties = properties || {};
  // Call the glyph constructor with our properties
  Game.Glyph.call(this, properties);
  // Set up the properties, we use false by default
  this._isWalkable = properties['isWalkable'] || false;
  this._isDiggable = properties['isDiggable'] || false;
}
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Standard getters

Game.Tile.prototype.isWalkable = function() {
  return this._isWalkable;
}
Game.Tile.prototype.isDiggable = function() {
  return this._isDiggable;
}

Game.Tile.nullTile = new Game.Tile({})
Game.Tile.floorTile = new Game.Tile({
  character: '.',
  isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
  character: '#',
  foreground: '#A0622D',
  isDiggable: true
});
Game.Tile.stairsUpTile = new Game.Tile({
  character: '<',
  foreground: 'white',
  isWalkable: true
});
Game.Tile.stairsDownTile = new Game.Tile({
  character: '>',
  foreground: 'white',
  isWalkable: true
});
Game.Tile.rockTile = new Game.Tile({
  character: '0',
  foreground: 'grey',
});