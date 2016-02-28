var DaGame = {};

DaGame.Boot = function(game) {

};

DaGame.Boot.prototype = {

	init: function() {

		// No multi touch
		this.input.maxPointers = 1;

		// Pause when focus lost
		this.stage.disableVisibilityChange = true;

		if (this.game.device.desktop)
		{
			// Desktop specific settings
			this.scale.pageAlignHorizontally = true;
		}
		else
		{
			// Mobile specific settings
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			this.scale.setMinMax(512, 288, 1920, 1080);
			this.scale.forceLandscape = true;
			this.scale.pageAlignHorizontally = true;
		}

	},

	preload: function() {
		// Load assets for Preloader state
		this.load.image('preloaderBackground', '../assets/preloader_background.png');
		this.load.image('preloaderBar', '../assets/preloader_bar.png');
	},

	create: function() {
		// Begin Preloader state
		this.state.start('Preloader');
	}
};