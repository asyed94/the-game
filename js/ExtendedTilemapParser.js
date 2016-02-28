
ExtendedTilemapParser = function() {
}

/**
* Creates sprites for any objects in the given Tiled Object Layer whose image data comes from
* an image collection or a tileset (has a gid). The resource used must be present in the Phaser Cache with its key
* the same as its filename. e.g: filename:"my-image.png", key:"my-image.png". Also, all objects must be uniqely named.
* 
* @method ExtendedTilemapParser#createSpritesFromObjects
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.Tilemap} map - A Tilemap created from Tiled Map Editor data.
* @param {string} tiledObjectLayerName - The name of the Object Layer in the Tiled map data which contains the objects to make into sprites.
* @param {string} [CustomClass=Phaser.Sprite] - You can give your own class that extends Phaser.Sprite here.
* @param {Object} [propertiesContainer] - An object to contain the sprite objects Tiled properties.
* @return {Object} An object containing the sprites.
*/
ExtendedTilemapParser.createSpritesFromObjects = function(game, map, tiledObjectLayerName, CustomClass, propertiesContainer) {

	if (typeof CustomClass === 'undefined') { CustomClass = Phaser.Sprite; }

	// An object to hold all sprites that will be created
	var spriteContainer = {};

	// For each object in the Object Layer, map its gid to a resource
	for (object in map.objects[tiledObjectLayerName]) {
		var thisObject = map.objects[tiledObjectLayerName][object];
		var thisObjectsTileset = null;
		var type = null;
		var sprite;
		var resource;

		// If the object doesn't have a gid, warn and continue
		if (typeof thisObject.gid === 'undefined') {
			console.warn("ExtendedTilemapParser.createSpritesFromObjects - Object without gid encountered; skipping");
			continue;
		}

		// Find the tileset or image collection that contains this gid
		for (tileset in map.tilesets) {
			var thisTileset = map.tilesets[tileset];
			if (thisObject.gid >= thisTileset.firstgid) {
				thisObjectsTileset = thisTileset;
				type = "tileset";
			}
		}
		for (imagecollection in map.imagecollections) {
			var thisImageCollection = map.imagecollections[imagecollection];
			if (thisObject.gid >= thisImageCollection.firstgid) {
				thisObjectsTileset = thisImageCollection;
				type = "imagecollection";
			}
		}

		// If thisObjectsTileset is a tileset...
		if (type === "tileset") {
			// Get the image data of this tile from the tileset
			var canvas = new Phaser.Canvas.create(thisObjectsTileset.tileWidth, thisObjectsTileset.tileHeight);
			var context = canvas.getContext('2d');
			thisObjectsTileset.draw(context, 0, 0, thisObject.gid);
			var bitmapdata = new Phaser.BitmapData(game, thisObjectsTileset.tileWidth, thisObjectsTileset.tileHeight);
			bitmapdata.load(canvas);
			resource = bitmapdata;
		}
		// Otherwise, if thisObjectsTileset is an image collection...
		else if (type === "imagecollection") {
			// Get the correct Phaser Cache key for this objects gid
			for (i in thisObjectsTileset.images) {
				thisImage = thisObjectsTileset.images[i];
				if (thisObject.gid == thisImage.gid) {
					resource = thisImage.image;
				}
			}
		}

		if (typeof resource === 'undefined') {
			// Warn and continue
			console.warn("ExtendedTilemapParser.createSpritesFromObjects - Could not find resource for object; skipping.")
			continue;
		}

		// Create the sprite
		sprite = new CustomClass(game, thisObject.x, thisObject.y, resource);
		sprite.name = thisObject.name;
		sprite.visible = thisObject.visible;
		if (typeof thisObject.rotation !== 'undefined') {
			sprite.angle = thisObject.rotation;
		}

		// Turn Tiled's bottom left coordinate into Phasers equivalent top left coordinate
		sprite.y -= sprite.height;

		// Add the sprite to the sprite container object
		spriteContainer[thisObject.name] = sprite;

		// If a properties container was given, copy the objects properties into it
		if (typeof propertiesContainer !== 'undefined') { 
			propertiesContainer[thisObject.name] = thisObject.properties;
		}
	}

	return spriteContainer;
}

/**
* Creates P2 physics bodies for any hand drawn (no gid) objects in the given Tiled Object Layer 
* 
* @method ExtendedTilemapParser#createP2BodiesFromObjects
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.Tilemap} map - A Tilemap created from Tiled Map Editor data.
* @param {string} tiledObjectLayerName - The name of the Object Layer in the Tiled map data which contains the objects to make into P2 bodies.
* @param {Object} [propertiesContainer] - An object to contain the P2 Body objects Tiled properties.
* @return {Object} An object containing Phaser.Physics.P2.Bodys.
*/
ExtendedTilemapParser.createP2BodiesFromObjects = function(game, map, tiledObjectLayerName, propertiesContainer) {

	var P2BodyContainer = {};

	for (object in map.objects[tiledObjectLayerName]) {
		var thisObject = map.objects[tiledObjectLayerName][object];
		var thisP2Body = new Phaser.Physics.P2.Body(game, undefined, 0, 0, 1);
		var thisWidth;
		var thisHeight;

		if (typeof thisObject.name === 'undefined') {
			console.warn("ExtendedTilemapParser - Please uniqely name all Tiled objects!");
			continue;
		}

		// Create the correct shape for the P2 body

		//polygon
		if (typeof thisObject.polygon !== 'undefined') {

			// Calculate this polygons width, height, and centroid coordinates 
			var highestX = null;
			var lowestX = null;
			var totalX = 0;
			var highestY = null;
			var lowestY = null;
			var totalY = 0;
			var thisCentroidX = 0;
			var thisCentroidY = 0;

			for (point in thisObject.polygon) {
				thisX = thisObject.polygon[point][0];
				thisY = thisObject.polygon[point][1];

				totalX += thisX;
				totalY += thisY;

				if (highestX === null) {
					highestX = thisX;
				}
				else {
					if (thisX > highestX) {
						highestX = thisX;
					}
				}

				if (lowestX === null) {
					lowestX = thisX;
				}
				else {
					if (thisX < lowestX) {
						lowestX = thisX;
					}
				}

				if (highestY === null) {
					highestY = thisY;
				}
				else {
					if (thisY > highestY) {
						highestY = thisY;
					}
				}

				if (lowestY === null) {
					lowestY = thisY;
				}
				else {
					if (thisY < lowestY) {
						lowestY = thisY;
					}
				}
			}

			thisWidth = highestX - lowestX;
			thisHeight = highestY - lowestY;
			thisCentroidX = totalX/thisObject.polygon.length;
			thisCentroidY = totalY/thisObject.polygon.length;

			thisP2Body.addPolygon({}, thisObject.polygon);

			// Position the polygon in the correct location

			// Covering my bases (A bug in Phaser <= 2.3.0)
			var posX = thisObject.x;
			var posY = thisObject.y;
			if (typeof posX === 'undefined') { posX = 0; }
			if (typeof posY === 'undefined') { posY = 0; }

			thisP2Body.x = posX + thisCentroidX;
			thisP2Body.y = posY + thisCentroidY;
		}

		// Object Tile
		else if (typeof thisObject.gid !== 'undefined') {
			// Skip it
			continue;
		}

		// polyline
		else if (typeof thisObject.polyline !== 'undefined') {
			// TODO: Implement polyline
			continue;
		}

		// ellipse
		else if (typeof thisObject.ellipse !== 'undefined') {
			// TODO: Implement ellipse
			continue;	
		}

		// if nothing else, rectangle
		else {
			// Create the rectangle with the given dimensions
			thisP2Body.setRectangle(thisObject.width, thisObject.height);

			// Position the rectangle in the correct location

			// Covering my bases (A bug in Phaser <= 2.3.0)
			var posX = thisObject.x;
			var posY = thisObject.y;
			if (typeof posX === 'undefined') { posX = 0; }
			if (typeof posY === 'undefined') { posY = 0; }

			thisP2Body.x = posX + thisObject.width/2;
			thisP2Body.y = posY + thisObject.height/2;

			thisWidth = thisObject.width;
			thisHeight = thisObject.height;
		}

		// Add the P2 Body to the container object
		P2BodyContainer[thisObject.name] = thisP2Body;

		// Add the Tiled properties to the propertiesContainer object, if one was given
		if (typeof propertiesContainer !== 'undefined') { 
			propertiesContainer[thisObject.name] = thisObject.properties;
			// Add width and height to the properties container
			propertiesContainer[thisObject.name]["width"] = thisWidth;
			propertiesContainer[thisObject.name]["height"] = thisHeight;
		}
	}

	return P2BodyContainer;
}

ExtendedTilemapParser.prototype = {
};

ExtendedTilemapParser.prototype.constructor = ExtendedTilemapParser;