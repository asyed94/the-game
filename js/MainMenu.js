DaGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

DaGame.MainMenu.prototype = {

	create: function () {

		// Create MainMenu
		this.music = this.add.audio('titleMusic');
		this.music.play();

		this.add.sprite(0, 0, 'titlepage');

		this.playButton = this.add.sprite(166, 191, 'playButton');

		var startKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		startKey.onDown.add(this.startGame, this);


	},

	update: function () {

		// Do some nice funky main menu effect here

	},

	startGame: function () {

		// Stop the music
		this.music.stop();

		// Start Game state
		this.state.start('Game');

	}

};
