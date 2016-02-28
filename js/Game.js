DaGame.Game = function (game) {

	// When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

	this.game;      //  a reference to the currently running game (Phaser.Game)
	this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
	this.camera;    //  a reference to the game camera (Phaser.Camera)
	this.cache;     //  the game cache (Phaser.Cache)
	this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
	this.load;      //  for preloading assets (Phaser.Loader)
	this.math;      //  lots of useful common math operations (Phaser.Math)
	this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
	this.stage;     //  the game stage (Phaser.Stage)
	this.time;      //  the clock (Phaser.Time)
	this.tweens;    //  the tween manager (Phaser.TweenManager)
	this.state;     //  the state manager (Phaser.StateManager)
	this.world;     //  the game world (Phaser.World)
	this.particles; //  the particle manager (Phaser.Particles)
	this.physics;   //  the physics manager (Phaser.Physics)
	this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

	// You can use any of these from any function within this State.
	// But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

	// Declare containters for game objects from the Tiled map 
	var SpriteGroup;
	var ObjectLayer1Sprites;
	var CollisionLayer1Objects;
};

DaGame.Game.prototype = {


	create: function() {
		// Enable P2 physics
		this.game.physics.startSystem(Phaser.Physics.P2JS);

		// Turn on impact events
		this.game.physics.p2.setImpactEvents(true);

		// Parse the map
		var map = this.game.add.tilemap('level2');

		// Create SpriteGroup
		SpriteGroup = this.game.add.group();

		// Create tile layers
		map.addTilesetImage('tilesetformattedupdate1.png');
		var layer1 = map.createLayer('Tile Layer 1');
		var layer2 = map.createLayer('Tile Layer 2');
		var layer3 = map.createLayer('Tile Layer 3');

		// Create Sprites for all objects in "Object Layer 1"
		ObjectLayer1SpritesProperties = {};
		ObjectLayer1Sprites = ExtendedTilemapParser.createSpritesFromObjects(this.game, map, "Object Layer 1", undefined, ObjectLayer1SpritesProperties);

		// Create P2 Collision Bodys from all objects in "Collision Layer 1"
		CollisionLayer1ObjectsProperties = {};
		CollisionLayer1Objects = ExtendedTilemapParser.createP2BodiesFromObjects(this.game, map, "Collision Layer 1", CollisionLayer1ObjectsProperties);

		// Post-processing on the created sprites
		for (sprite in ObjectLayer1Sprites) {
			var thisSprite = ObjectLayer1Sprites[sprite];

			// Calculate bottom left coordinates for the sprite
			var posX = thisSprite.x;
			var posY = thisSprite.y + thisSprite.height;

			// Set the sprites center of mass to the bottom-left, and position it accordingly for proper y pos based sorting
			thisSprite.anchor = new Phaser.Point(0, 1);		// Bottom left
			thisSprite.x = posX;
			thisSprite.y = posY;

			// If a P2 Collision body exists with the same name as the sprite, add it to the sprite
			if (typeof CollisionLayer1Objects[thisSprite.name] !== 'undefined') {
				var thisP2CollisionBody = CollisionLayer1Objects[thisSprite.name];

				// Add sprite to P2 body 
				thisP2CollisionBody.sprite = thisSprite;

				// Add P2 body to sprite (It gets centered on the sprites center of mass)
				thisSprite.body = thisP2CollisionBody;

				// This is how you offset the P2 body from the sprite its gonna be connected to
				var thisP2Width = CollisionLayer1ObjectsProperties[thisSprite.name]["width"];
				var thisP2Height = CollisionLayer1ObjectsProperties[thisSprite.name]["height"];
				var bottomLeftSpriteX = thisSprite.x;
				var bottomLeftSpriteY = thisSprite.y;
				var centeredP2X = thisP2CollisionBody.x;
				var centeredP2Y = thisP2CollisionBody.y;
				var bottomLeftP2X = centeredP2X - thisP2Width/2;
				var bottomLeftP2Y = centeredP2Y + thisP2Height/2;
				var offsetX = bottomLeftSpriteX - bottomLeftP2X;
				var offsetY = bottomLeftSpriteY - bottomLeftP2Y;

				// Adding the P2 body to the sprite caused the sprite to shift up and left, correct that
				thisSprite.body.x = bottomLeftP2X + offsetX;
				thisSprite.body.y = bottomLeftP2Y + offsetY;

				// To offset the P2 body, we need to remove the shape from it, then add it again with the correct offset
				// First, save the current shape
				var thisShape = thisP2CollisionBody.data.shapes[0];
				// Second, remove the shape from the P2 body
				thisP2CollisionBody.removeShape(thisShape);
				// Third, add it again with the correct offsets
				thisP2CollisionBody.addShape(thisShape, thisP2Width/2 - offsetX, -thisP2Height/2 - offsetY);

				// Set the P2 bodys properties correctly

				thisSprite.body.addToWorld();
			}

			// Add the sprite to the SpriteGroup for y pos bases sorting
			SpriteGroup.add(thisSprite);
		}

		// Add any remaining P2 Collision bodies to the world
		for (P2Body in CollisionLayer1Objects) {
			thisP2Body = CollisionLayer1Objects[P2Body];

			// Add this body to the world, if it hasn't been added to a sprite
			if (typeof thisP2Body.sprite !== 'undefined') {
				thisP2Body.kinematic = true;
				thisP2Body.debug = true;
				thisP2Body.addToWorld();
			}
		}

		/*
		//DBG
		var thisCollisionObj = new Phaser.Physics.P2.Body(this.game, null, 100, 100, 1);
		thisCollisionObj.kinematic = true;
		thisCollisionObj.debug = true;
		thisCollisionObj.setRectangle(50, 50);

		thisCollisionObj.x = 200;

		thisCollisionObj.debug = false;
		thisCollisionObj.debug = true;

		thisCollisionObj.addToWorld();
		*/

		// Create the player
		var hero = new Player(this.game, this.world.width/2, this.world.height/2, 'heroSpriteSheet');
		ObjectLayer1Sprites["hero"] = hero;
		SpriteGroup.add(hero);

/*
		// Create chairs
		var chairs = [];

		for (i = 0; i < 10; i++) {
			// Randomly place the chairs through out the screen
			chairs[i] = new Phaser.Sprite(this.game, Math.floor(Math.random()*this.world.width), Math.floor(Math.random()*this.world.height), 'chairImg');

			// Set the anchor point of the chairs to their centers
			chairs[i].anchor = new Phaser.Point(0.5, 0.5);

			// Enable p2 physics for the chairs
			this.game.physics.p2.enable(chairs[i]);
			chairs[i].body.fixedRotation = true;
			chairs[i].body.setRectangle(21, 16, -0.5, 18);
			chairs[i].body.mass = 1;
			chairs[i].body.damping = 0.9;

			// Add the chairs to the objectsCG and set to collide with playerCG
			chairs[i].body.setCollisionGroup(objectsCG);
			chairs[i].body.collides(playerCG);
			chairs[i].body.collides(objectsCG);

			// Make the chairs static
			//chairs[i].body.dynamic = false;

			//DBG
			//chairs[i].body.debug = true;

			// Add the chairs to the game
			chairs[i].game.add.existing(chairs[i]);
		}
*/

		//DBG
		//hero.body.debug = true;

		// The last thing to do is move the SpriteGroup to the very top so it displays above the tiles.
		this.world.bringToTop(SpriteGroup);
	},

	update: function() {

		// Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

		// This function sorts the objects in the world group by y to give the illusion of depth.
		SpriteGroup.sort('y', Phaser.Group.SORT_ASCENDING);
	},

	quitGame: function(pointer) {

		// Here you should destroy anything you no longer need.
		// Stop music, delete sprites, purge caches, free resources, all that good stuff.

		// Go back to the MainMenu state
		this.state.start('MainMenu');

	}

};
