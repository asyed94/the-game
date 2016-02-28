var Player = function(game, givenX, givenY, spriteSheet) {

	// Call Phaser.Sprite and pass it required parameters
	Phaser.Sprite.call(this, game, givenX, givenY, spriteSheet);

	// Set player animations and player anchor
	this.anchor = new Phaser.Point(0.5, 0.5);

	this.animations.add('down', [0, 1, 2, 3], 10, true);
	this.animations.add('idle-down', [0], 10, false);
	this.animations.add('left', [4, 5, 6, 7], 10, true);
	this.animations.add('idle-left', [4], 10, false);
	this.animations.add('up', [8, 9, 10, 11], 10, true);
	this.animations.add('idle-up', [8], 10, false);
	this.animations.add('right', [12, 13, 14, 15], 10, true);
	this.animations.add('idle-right', [12], 10, false);

	// Enable p2 physics for the player
	game.physics.p2.enable(this, true);
	var bottomLeftX = this.x - this.width/2;
	var bottomLeftY = this.y + this.height/2;
	this.anchor = new Phaser.Point(0, 1);
	this.body.x = bottomLeftX;
	this.body.y = bottomLeftY;
	this.body.fixedRotation = true;
	this.body.mass = 1;
	this.body.setRectangle(22, 16, 15.5, -8);

	// Variables for player movement
	this.direction = null;
	this.accel = 400;
	this.maxVel = 100;
	this.decel = 400;
	this.keys = [];

	// Create arrow keys container object
	this.cursors = game.input.keyboard.createCursorKeys();

	// Setup key down event listener
	var self = this;
	game.input.keyboard.onDownCallback = function(e) {
		if (self.keys[self.keys.length - 1] != e.keyCode) {
			self.keys.push(e.keyCode);
		}
	}

	// Setup key up event listener
	game.input.keyboard.onUpCallback = function(e) {
		var index = self.keys.indexOf(e.keyCode);
		self.keys.splice(index, 1);
	}

	// Add yourself to the game
	game.add.existing(this);
};

// Inherit from Phaser.Sprite
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

// Automatically called by World.update ~60 Hz
Player.prototype.update = function() {
	this.updateMovement();
	this.updateAnimation();
}

Player.prototype.updateMovement = function () {
	// Set player direction based on most recent key pressd
	switch (this.keys[this.keys.length - 1]) {
		case Phaser.Keyboard.UP:
			this.direction = "up";
			break;
		case Phaser.Keyboard.DOWN:
			this.direction = "down";
			break;
		case Phaser.Keyboard.LEFT:
			this.direction = "left";
			break;
		case Phaser.Keyboard.RIGHT:
			this.direction = "right";
			break;
	}

	// Handle key presses with this object
	var movement = new Phaser.Point(0, 0);
	var absVelX = Math.abs(this.body.velocity.x);
	var absVelY = Math.abs(this.body.velocity.y);

	// If opposing keys are pressed, increment and decrement the movement point by the same amount
	if (this.cursors.up.isDown) {movement.y -= 1}
	if (this.cursors.down.isDown) {movement.y += 1}
	if (this.cursors.left.isDown) {movement.x -= 1}
	if (this.cursors.right.isDown) {movement.x += 1}

	// Move the player based on final state of the movement point object
	if (movement.x < 0) {	// LEFT
		this.body.force.x = -this.accel;
	} 
	else if (movement.x > 0) {	// RIGHT
		this.body.force.x = this.accel;
	} else {
		// Apply opposite damping force
		if (Math.round(absVelX) > 3) { this.body.force.x = (-(this.body.velocity.x/absVelX))*this.accel; }
		// Stop if velocity close to 0
		if (Math.round(absVelX) <= 3) { this.body.force.x = 0; this.body.velocity.x = 0; }
	}

	if (movement.y < 0) {	// UP
		this.body.force.y = -this.accel;
	}
	else if (movement.y > 0) {	// DOWN
		this.body.force.y = this.accel;
	} else {
		// Apply opposite damping force
		if (Math.round(absVelY) > 3) { this.body.force.y = (-(this.body.velocity.y/absVelY))*this.accel; }
		// Stop if velocity close to 0
		if (Math.round(absVelY) <= 3) { this.body.force.y = 0; this.body.velocity.y = 0; }
	}

	// Make sure player body is within speed limit
	var vel = new Phaser.Point(this.body.velocity.x, this.body.velocity.y);
	if (vel.getMagnitude() > this.maxVel) {
		vel.setMagnitude(this.maxVel);
		this.body.velocity.x = vel.x;
		this.body.velocity.y = vel.y;
	}
}

Player.prototype.updateAnimation = function() {

	// Play correct anim based on current direction
	switch (this.direction) {
		case "up":
			if (this.body.velocity.y != 0 || this.body.velocity.x != 0) { this.animations.play("up"); }
			else { this.animations.play("idle-up"); }
			break;
		case "down":
			if (this.body.velocity.y != 0 || this.body.velocity.x != 0) { this.animations.play("down"); }
			else { this.animations.play("idle-down"); }
			break;
		case "right":
			if (this.body.velocity.x != 0 || this.body.velocity.y != 0) { this.animations.play("right"); }
			else { this.animations.play("idle-right"); }
			break;
		case "left":
			if (this.body.velocity.x != 0 || this.body.velocity.y != 0) { this.animations.play("left"); }
			else { this.animations.play("idle-left"); }
			break;
	}
}