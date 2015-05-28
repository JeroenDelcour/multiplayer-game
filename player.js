var Player = function(seq, startX, startY, startHealth) {
	var localSeq = 0,
		remoteSeq = seq,
		x = startX,
		y = startY,
		width = 32,
		height = 32,
		health = startHealth,
		maxHealth = 10,			// Maximum health
		keys = { left: false,	// key input
				up: false,
				right: false,
				down: false,
				slash: false,
				bow: false,
				pickup: false,
				bomb: false },
		allowMove = true,		// false if current player action should prevent movement
		direction = "down",		// Tracks direction player is facing
		holding = false,		// contains bomb ID if holding a bomb
		moveAmount = 200,		// move speed in pixels per second
		arrowDmg = 2,
		knockback = false,		// true if being knocked back by hit
		knockbackTimer = 0,		// Keeps track of knockback progress
		knockbackTime = 0.07,	// Knockback duration in seconds
		knockbackDistance = 32,	// Knockback distance in pixels
		slashDmg = 3,			// Slash attack damage
		slashTimer = 0.03,		// Counter for slash hitbox position changes
		slashInterval = 0.03,	// Time between slash hitbox position changes in seconds
		slashStep = false,		// Tracks current animation step for hitbox position
		hitbox = [],			// hitbox for sword slash
		playersHit = [],		// Stores hits by player id to prevent multiple hits from one swing
		id;
		
	var getLocalSeq = function() {
		return localSeq;
	};
	
	var setLocalSeq = function(newSeq) {
		localSeq = newSeq;
	};
	
	var getRemoteSeq = function() {
		return remoteSeq;
	};
	
	var setRemoteSeq = function(newSeq) {
		remoteSeq = newSeq;
	};
	
	var setId = function(newId) {
		id = newId;
	};
	
	var getId = function() {
		return id;
	};
	
	var getX = function() {
		return x;
	};
	
	var getY = function() {
		return y;
	};
	
	var setX = function(newX) {
		x = newX;
	};
	
	var setY = function(newY) {
		y = newY;
	};
	
	var getDirection = function() {
		return direction;
	};
	
	var setKey = function(key, status) {
		if (key == "left") { keys.left = status;
		} else if (key == "up") { keys.up = status;
		} else if (key == "right") { keys.right = status;
		} else if (key == "down") { keys.down = status;
		} else if (key == "slash") { keys.slash = status;
		} else if (key == "bow") { keys.bow = status;
		} else if (key == "pickup") { keys.pickup = status;
			setTimeout(keys.pickup = false, 300);
		} else if (key == "bomb") { keys.bomb = status;
			setTimeout(keys.bomb = false, 300);
		};
	};
	
	var getKeys = function() {
		return keys;
	};
		
	var getHolding = function() {
		return holding;
	};
	
	var setHolding = function(bombId) {
		holding = bombId;
	};
	
	var getHolding = function() {
		return holding;
	};
	
	var setHolding = function(bombId) {
		holding = bombId;
	};
	
	var setKnockback = function(direction) {
		knockback = direction;
	};
	
	var getHealth = function() {
		return health;
	};
	
	var setHealth = function(newHealth) {
		health = newHealth;
	};
	
	var getHitbox = function() {
		return hitbox;
	};
	
	var update = function(deltatime, players, arrows, bombs, io) {
		
		if (health <= 0) { return; };
		
		if (keys.slash || keys.bow || keys.pickup || keys.bomb) { allowMove = false; }
		else { allowMove = true; };
		
		////////////////////////////////////////////////////
		// key movement
		////////////////////////////////////////////////////
		
		if (allowMove) {
			// Up key takes priority over down
			if (keys.up) {
				y -= moveAmount * deltatime;
				direction = 'up';
			} else if (keys.down) {
				y += moveAmount * deltatime;
				direction = 'down';
			};

			// Left key takes priority over right
			if (keys.left) {
				x -= moveAmount * deltatime;
				direction = 'left';
			} else if (keys.right) {
				x += moveAmount * deltatime;
				direction = 'right';
			};
		};
		
		////////////////////////////////////////////////////
		// knockback
		////////////////////////////////////////////////////
		if (knockback) {
			if (knockbackTimer < knockbackTime) {
				require("util").log("knockback "+knockback); 
				var speed = knockbackDistance / knockbackTime;
				if (knockback == 'left') { x -= speed * deltatime; }
				else if (knockback == 'right') { x += speed * deltatime; }
				else if (knockback == 'up') { y -= speed * deltatime; }
				else if (knockback == 'down') { y += speed * deltatime; };
				knockbackTimer += deltatime;
			} else {
				require("util").log("position: "+x+" "+y);
				knockbackTimer = 0;
				knockback = false;
			};
		};	
		
		////////////////////////////////////////////////////
		// keep player within bounds
		////////////////////////////////////////////////////
		if (x + width > 744) {
			x = 744 - width;
		};
		if (y + height > 514) {
			y = 514 - height;
		};
		if (x < 56) {
			x = 56;
		};
		if (y < 42) {
			y = 42;
		};
		
		////////////////////////////////////////////////////
		// detect collisions with other players
		////////////////////////////////////////////////////
		var i;
		for (i = 0; i < players.length; i++) {
			if (players[i].getHealth() > 0 && players[i].getId() != id) {
				if (collide(x,y,width,height,players[i].getX(),players[i].getY(),width,height)) {
					var newPosition = collisionBump(x,y,width,height,players[i].getX(),players[i].getY(),width,height);
					x = newPosition.x;
					y = newPosition.y;
				};
			};
		};
		
		////////////////////////////////////////////////////
		// detect collisions with non-exploding bombs
		////////////////////////////////////////////////////
		var i;
		for (i = 0; i < bombs.length; i++) {
			if (!bombs[i].boom && !bombs[i].held) {
			if (collide(x,y,width,height,bombs[i].x,bombs[i].y,24,28)) {
					var newPosition = collisionBump(x,y,width,height,bombs[i].x,bombs[i].y,24,28);
					x = newPosition.x;
					y = newPosition.y;
				};
			};
		};
		
		////////////////////////////////////////////////////
		// bow draw
		////////////////////////////////////////////////////
		if (keys.bow) {
			setTimeout(function(){ keys.bow = false; }, 500);
		};
		
		////////////////////////////////////////////////////
		// sword slash hitbox
		////////////////////////////////////////////////////
		if (keys.slash) {
			slashTimer += deltatime;
			// hitbox iteration
			if (slashTimer >= slashInterval) {
				slashTimer = 0;
				if (direction == 'left') {
					switch (slashStep) {
					default:
						slashStep = 1;
						hitbox = {x: x - 8, y: y - 20};
						break;
					case 1:
						slashStep = 2;
						hitbox = {x: x - 26, y: y - 14};
						break;
					case 2:
						slashStep = 3;
						hitbox = {x: x - 42, y: y - 2};
						break;
					case 3:
						slashStep = 4;
						hitbox = {x: x - 46, y: y + 12};
						break;
					case 4:
						slashStep = 5;
						hitbox = {x: x - 40, y: y + 26};
						break;
					case 5:
						slashStep = 6;
						hitbox = {x: x - 16, y: y + 38};
						break;
					case 6:
						slashStep = 7;
						hitbox = {x: x + 4, y: y + 40};
						break;
					case 7:
						slashStep = false;
						hitbox = false;
						keys.slash = false;
						playersHit.length = 0;
						slashTimer = slashInterval;
					};
				} else if (direction == 'right') {
					switch (slashStep) {
					default:
						slashStep = 1;
						hitbox = {x: x + 32, y: y - 20};
						break;
					case 1:
						slashStep = 2;
						hitbox = {x: x + 50, y: y - 14};
						break;
					case 2:
						slashStep = 3;
						hitbox = {x: x + 66, y: y - 2};
						break;
					case 3:
						slashStep = 4;
						hitbox = {x: x + 74, y: y + 12};
						break;
					case 4:
						slashStep = 5;
						hitbox = {x: x + 64, y: y + 26};
						break;
					case 5:
						slashStep = 6;
						hitbox = {x: x + 40, y: y + 38};
						break;
					case 6:
						slashStep = 7;
						hitbox = {x: x + 20, y: y + 40};
						break;
					case 7:
						slashStep = false;
						hitbox = false;
						keys.slash = false;
						playersHit.length = 0;
						slashTimer = slashInterval;
					};
				} else if (direction == 'up') {
					switch (slashStep) {
					default:
						slashStep = 1;
						hitbox = {x: x + 40, y: y - 6};
						break;
					case 1:
						slashStep = 2;
						hitbox = {x: x + 36, y: y - 24};
						break;
					case 2:
						slashStep = 3;
						hitbox = {x: x + 24, y: y - 38};
						break;
					case 3:
						slashStep = 4;
						hitbox = {x: x + 6, y: y - 46};
						break;
					case 4:
						slashStep = 5;
						hitbox = {x: x - 10, y: y - 38};
						break;
					case 5:
						slashStep = 6;
						hitbox = {x: x - 24, y: y - 20};
						break;
					case 6:
						slashStep = 7;
						hitbox = {x: x - 32, y: y - 2};
						break;
					case 7:
						slashStep = false;
						hitbox = false;
						keys.slash = false;
						playersHit.length = 0;
						slashTimer = slashInterval;
					};
				} else if (direction == 'down') {
					switch (slashStep) {
					default:
						slashStep = 1;
						hitbox = {x: x - 18, y: y + 22};
						break;
					case 1:
						slashStep = 2;
						hitbox = {x: x - 10, y: y + 50};
						break;
					case 2:
						slashStep = 3;
						hitbox = {x: x + 6, y: y + 62};
						break;
					case 3:
						slashStep = 4;
						hitbox = {x: x + 20, y: y + 70};
						break;
					case 4:
						slashStep = 5;
						hitbox = {x: x + 38, y: y + 62};
						break;
					case 5:
						slashStep = 6;
						hitbox = {x: x + 48, y: y + 44};
						break;
					case 6:
						slashStep = 7;
						hitbox = {x: x + 54, y: y + 20};
						break;
					case 7:
						slashStep = false;
						hitbox = false;
						keys.slash = false;
						playersHit.length = 0;
						slashTimer = slashInterval;
					};
				} else {
					keys.slash = false;
				};
			};
		};
			
		////////////////////////////////////////////////////
		// hit detection
		////////////////////////////////////////////////////
		
		// sword
		var i;
		for (i = 0; i < players.length; i++) {
			if (players[i].getId() != id &&
			players[i].getHealth() > 0 &&
			playersHit.indexOf(players[i].getId()) == -1 &&
			collide(players[i].getX(),players[i].getY(),width,height,hitbox.x,hitbox.y,8,8)) {
				
				var newHealth = players[i].getHealth() - slashDmg;
				if (newHealth < 0) { newHealth = 0; };
				players[i].setHealth(newHealth);
				
				io.sockets.emit("hit", { hitter: id, hittee: players[i].getId(), health: newHealth, arrow: false });
				
				/*var x2 = players[i].getX();
				var y2 = players[i].getY();
				if (((x + 32) - x2) < ((y + 32) - y2) && ((x + 32) - x2) < ((x2 + 32) - x) && ((x + 32) - x2) < ((y2 + 32) - y)) {
					players[i].setKnockback("right");
				} else if (((x2 + 32) - x) < ((y + 32) - y2) && ((x2 + 32) - x) < ((x + 32) - x2) && ((x2 + 32) - x) < ((y2 + 32) - y)) {
					players[i].setKnockback("left");
				} else if (((y2 + 32) - y) < ((y + 32) - y2) && ((y2 + 32) - y) < ((x + 32) - x2) && ((y2 + 32) - y) < ((x2 + 32) - x)) {
					players[i].setKnockback("up");
				} else if (((y + 32) - y2) < ((y2 + 32) - y) && ((y + 32) - y2) < ((x + 32) - x2) && ((y + 32) - y2) < ((x2 + 32) - x)) {
					players[i].setKnockback("down");
				};*/
				
				playersHit.push(players[i].getId()); // keep track of players hit to prevent multiple registered hits from one strike
			};
		};
		
		// arrow
		var i;
		for (i = 0; i < arrows.length; i++) {
			if (arrows[i].shooter == id) { continue; };
			if ((arrows[i].direction == 'left' &&
				y < arrows[i].y + 10 &&
				y + height > arrows[i].y &&
				x < arrows[i].x + 8 &&
				x + width > arrows[i].x)
				||
				(arrows[i].direction == 'right' &&
				y < arrows[i].y + 10 &&
				y + height > arrows[i].y &&
				x < arrows[i].x + 30 &&
				x + width > arrows[i].x + 22)) {
				
				health -= arrowDmg;
				if (health < 0) { health = 0; };
				io.sockets.emit("hit", { hitter: arrows[i].shooter, hittee: id, health: health, arrow: true });
				arrows.splice(i,1);
			};
		};
	};
	return {
		getLocalSeq: getLocalSeq,
		setLocalSeq: setLocalSeq,
		getRemoteSeq: getRemoteSeq,
		setRemoteSeq: setRemoteSeq,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getDirection: getDirection,
		setKey: setKey,
		getKeys: getKeys,
		getHolding: getHolding,
		setHolding: setHolding,
		setKnockback: setKnockback,
		getHealth: getHealth,
		setHealth: setHealth,
		getHitbox: getHitbox,
		update: update,
		getId: getId,
		setId: setId,
	}
};

exports.Player = Player;

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/

// Collision detection
function collide(x,y,w,h,x2,y2,w2,h2) { // overlap
	if (y < y2 + h2 &&
		y + h > y2 &&
		x < x2 + w2 &&
		x + w > x2) {
			return true;
		} else {
			return false;
		};
};
function collisionBump(x,y,w,h,x2,y2,w2,h2) { // push intruding object back to edge of static object			
	if (((x + w) - x2) < ((y + h) - y2) && ((x + w) - x2) < ((x2 + w2) - x) && ((x + w) - x2) < ((y2 + h2) - y)) {
		x = x2 - w;
	} else if (((x2 + w2) - x) < ((y + h) - y2) && ((x2 + w2) - x) < ((x + w) - x2) && ((x2 + w2) - x) < ((y2 + h2) - y)) {
		x = x2 + w2;
	} else if (((y2 + h2) - y) < ((y + h) - y2) && ((y2 + h2) - y) < ((x + w) - x2) && ((y2 + h2) - y) < ((x2 + w2) - x)) {
		y = y2 + h2;
	} else if (((y + h) - y2) < ((y2 + h2) - y) && ((y + h) - y2) < ((x + w) - x2) && ((y + h) - y2) < ((x2 + w2) - x)) {
		y = y2 - h;
	};
	return { x: x, y: y };
};