
DaGame.Preloader = function(game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

DaGame.Preloader.prototype = {

	preload: function() {

		// Create background and loading bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(166, 191, 'preloaderBar');

		// This sets preloadBar sprite as a loader sprite.
		this.load.setPreloadSprite(this.preloadBar);

		// Load MainMenu assets
		this.load.image('titlepage', '../assets/title.png');
		this.load.image('playButton', '../assets/play_button.png');
		this.load.audio('titleMusic', ['../assets/main_menu.mp3']);

		// Load other game assets
		this.load.spritesheet('heroSpriteSheet', '../assets/testing/character-sprite-sheet.png', 32, 48);
		this.load.tilemap('level2', '../assets/testing/level2-polygon-test.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tilesetformattedupdate1.png', '../assets/testing/tilesetformattedupdate1.png');
		this.load.image('armor-down.png', '../assets/testing/armor-down.png');
		this.load.image('chair-down.png', '../assets/testing/chair-down.png');
		this.load.image('chair-down-small.png', '../assets/testing/chair-down-small.png');
		this.load.image('chair-left.png', '../assets/testing/chair-left.png');
		this.load.image('chair-left-small.png', '../assets/testing/chair-left-small.png');
		this.load.image('chair-right.png', '../assets/testing/chair-right.png');
		this.load.image('chair-right-small.png', '../assets/testing/chair-right-small.png');
		this.load.image('table-round.png', '../assets/testing/table-round.png');
		this.load.image('table-rect.png', '../assets/testing/table-rect.png');
	},

	create: function() {

		// Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function() {

		// Wait for sound to decode before beginning MainMenu state
		if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
