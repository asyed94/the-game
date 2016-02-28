var ExtendedSprite = function(game, givenX, givenY, spriteSheet) {
	// Call Phaser.Sprite and give it required parameters
	Phaser.Sprite.call(this, game, givenX, givenY, spriteSheet);

	// Extend the Sprite to include properties from Tiled
	this.tiledProperties = {};
}

// Inherit from Phaser.Sprite
ExtendedSprite.prototype = Object.create(Phaser.Sprite.prototype);
ExtendedSprite.prototype.constructor = ExtendedSprite;