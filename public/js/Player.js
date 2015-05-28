/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startHealth) {
	var x = startX,				// player x position
		y = startY,				// player y position
		health = startHealth,	// player health
		id,
		width = 32,
		height = 32,
		keys = { left: false,	// key input
				up: false,
				right: false,
				down: false,
				slash: false,
				bow: false,
				pickup: false,
				bomb: false },
		allowMove = true,		// false if current player action should prevent movement
		direction = 'down',		// direction player is facing
		prevDirection,			// Direction player was facing last update
		// walking
		moveAmount = 200,		// move speed in pixels per second
		stepInterval = 0.09,	// Time between walking animation sprite
		stepTimer = 0.09,		// Counts time between step animation sprite changes
		stepIteration = 0,
		// slash animation
		slashTimer = 0.03,		// Counter for slash animation
		slashInterval = 0.03,	// Time between slash sprite draws in seconds
		slashDmg = 3,			// Slash attack damage
		// bow animation
		bowTimer = 0.1,			// Counts time between bow animation sprite changes
		bowInterval = 0.1,		// Time between bow draw animation sprite changes
		// pickup, holding & throwing
		pickupTimer = 0.1,
		pickupInterval = 0.1,
		holding = false,		// contains bomb ID if holding a bomb
		throwTimer = 0.1,
		throwInterval = 0.1,
		// hit flash
		hitFlash = false,		// Duration of sprite flash after hit
		hitFlashTimer = 0,		// Tracks time for hit flash
		spriteOff = false,		// True sprite is not to be drawn
		// knockback
		knockback = false,		// True if being knocked back by hit
		knockbackTimer = 0,		// Keeps track of knockback progress
		knockbackTime = 0.07,	// Knockback duration in seconds
		knockbackDistance = 32,	// Knockback distance in pixels
		
		maxHealth = 10,			// maximum player health
		deathTimer = 0.1,		// Timer for death animation
		deathInterval = 0.1,	// Time between death animation sprites in seconds
		dead = false,			// True when death animation has finished
		sprite = imgs.linkDown,	// sprite to be drawn
		drawX = x,				// x position for sprite drawing
		drawY = y;				// y position for sprite drawing
		
	
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
		} else if (key == "bomb") { keys.bomb = status; };
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
	
	var setKnockback = function(direction) {
		knockback = direction;
	};
	
	var setHitFlash = function() {
		hitFlash = true;
	};
	
	var getArrows = function() {
		return arrows;
	};
	
	var getHealth = function() {
		return health;
	};
	
	var setHealth = function(newHealth) {
		health = newHealth;
	};
	
	var getId = function() {
		return id;
	};
	
	var setId = function(newId) {
		id = newId;
	};
	
	var update = function(deltatime) {
		
		if (dead) {
			return;
		};
		
		if (keys.slash || keys.bow || keys.pickup || keys.bomb) { allowMove = false; }
		else { allowMove = true; };
		
		////////////////////////////////////////////////////
		// reset to standing still sprite
		////////////////////////////////////////////////////	
		if (health > 0 && !keys.left && !keys.up && !keys.right && !keys.down && !keys.slash && !keys.bow && !keys.pickup && !holding) {
			if (direction == 'left') { sprite = imgs.linkLeft;
			} else if (direction == 'right') { sprite = imgs.linkRight;
			} else if (direction == 'up') { sprite = imgs.linkUp;
			} else if (direction == 'down') { sprite = imgs.linkDown;
			};
		};
	
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
				var speed = knockbackDistance / knockbackTime;
				if (knockback == 'left') { x -= speed * deltatime; }
				else if (knockback == 'right') { x += speed * deltatime; }
				else if (knockback == 'up') { y -= speed * deltatime; }
				else if (knockback == 'down') { y += speed * deltatime; };
				knockbackTimer += deltatime;
			} else {
				knockbackTimer = 0;
				knockback = false;
			};
		};
		
		////////////////////////////////////////////////////
		// hit flash
		////////////////////////////////////////////////////
		if (hitFlash) {
			hitFlashTimer += deltatime;
			if (hitFlashTimer < 0.15 && hitFlashTimer > 0.05) {
				spriteOff = true;
			} else { spriteOff = false; };
			if (hitFlashTimer >= 0.5) {
				hitFlash = false;
				hitFlashTimer = 0;
				spriteOff = false;
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
		if (y < 42 - 16) {
			y = 42 - 16;
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
				
/*				var x2 = players[i].getX();
				var y2 = players[i].getY();
				if (y < y2 + height &&
				y + height > y2 &&
				x < x2 + width &&
				x + width > x2) {				
					if (((x + width) - x2) < ((y + height) - y2) && ((x + width) - x2) < ((x2 + width) - x) && ((x + width) - x2) < ((y2 + height) - y)) {
						x = x2 - width;
					} else if (((x2 + width) - x) < ((y + height) - y2) && ((x2 + width) - x) < ((x + width) - x2) && ((x2 + width) - x) < ((y2 + height) - y)) {
						x = x2 + width;
					} else if (((y2 + height) - y) < ((y + height) - y2) && ((y2 + height) - y) < ((x + width) - x2) && ((y2 + height) - y) < ((x2 + width) - x)) {
						y = y2 + height;
					} else if (((y + height) - y2) < ((y2 + height) - y) && ((y + height) - y2) < ((x + width) - x2) && ((y + height) - y2) < ((x2 + width) - x)) {
						y = y2 - height;
					};*/
				
			};
		};
		
		////////////////////////////////////////////////////
		// detect collisions with non-exloding bombs
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
		// sword slashing animation and hitbox
		////////////////////////////////////////////////////
		if (keys.slash) {
			slashTimer += deltatime;
			if (slashTimer >= slashInterval) {
				slashTimer = 0;
				if (direction == 'left') {
					switch (sprite) {
					default:
						sprite = imgs.linkLeftSlash1;
						hitbox = {x: x - 8, y: y - 20};
						break;
					case imgs.linkLeftSlash1:
						sprite = imgs.linkLeftSlash2;
						hitbox = {x: x - 26, y: y - 14};
						break;
					case imgs.linkLeftSlash2:
						sprite = imgs.linkLeftSlash3;
						hitbox = {x: x - 42, y: y - 2};
						break;
					case imgs.linkLeftSlash3:
						sprite = imgs.linkLeftSlash4;
						hitbox = {x: x - 46, y: y + 12};
						break;
					case imgs.linkLeftSlash4:
						sprite = imgs.linkLeftSlash5;
						hitbox = {x: x - 40, y: y + 26};
						break;
					case imgs.linkLeftSlash5:
						sprite = imgs.linkLeftSlash6;
						hitbox = {x: x - 16, y: y + 38};
						break;
					case imgs.linkLeftSlash6:
						sprite = imgs.linkLeftSlash7;
						hitbox = {x: x + 4, y: y + 40};
						break;
					case imgs.linkLeftSlash7:
						sprite = imgs.linkLeft;
						hitbox = false;
						keys.slash = false;
						slashTimer = slashInterval;
					};
				} else if (direction == 'right') {
					switch (sprite) {
					default:
						sprite = imgs.linkRightSlash1;
						hitbox = {x: x + 32, y: y - 20};
						break;
					case imgs.linkRightSlash1:
						sprite = imgs.linkRightSlash2;
						hitbox = {x: x + 50, y: y - 14};
						break;
					case imgs.linkRightSlash2:
						sprite = imgs.linkRightSlash3;
						hitbox = {x: x + 66, y: y - 2};
						break;
					case imgs.linkRightSlash3:
						sprite = imgs.linkRightSlash4;
						hitbox = {x: x + 74, y: y + 12};
						break;
					case imgs.linkRightSlash4:
						sprite = imgs.linkRightSlash5;
						hitbox = {x: x + 64, y: y + 26};
						break;
					case imgs.linkRightSlash5:
						sprite = imgs.linkRightSlash6;
						hitbox = {x: x + 40, y: y + 38};
						break;
					case imgs.linkRightSlash6:
						sprite = imgs.linkRightSlash7;
						hitbox = {x: x + 20, y: y + 40};
						break;
					case imgs.linkRightSlash7:
						sprite = imgs.linkRight;
						hitbox = false;
						keys.slash = false;
						slashTimer = slashInterval;
					};
				} else if (direction == 'up') {
					switch (sprite) {
					default:
						sprite = imgs.linkUpSlash1;
						hitbox = {x: x + 40, y: y - 6};
						break;
					case imgs.linkUpSlash1:
						sprite = imgs.linkUpSlash2;
						hitbox = {x: x + 36, y: y - 24};
						break;
					case imgs.linkUpSlash2:
						sprite = imgs.linkUpSlash3;
						hitbox = {x: x + 24, y: y - 38};
						break;
					case imgs.linkUpSlash3:
						sprite = imgs.linkUpSlash4;
						hitbox = {x: x + 6, y: y - 46};
						break;
					case imgs.linkUpSlash4:
						sprite = imgs.linkUpSlash5;
						hitbox = {x: x - 10, y: y - 38};
						break;
					case imgs.linkUpSlash5:
						sprite = imgs.linkUpSlash6;
						hitbox = {x: x - 24, y: y - 20};
						break;
					case imgs.linkUpSlash6:
						sprite = imgs.linkUpSlash7;
						hitbox = {x: x - 32, y: y - 2};
						break;
					case imgs.linkUpSlash7:
						sprite = imgs.linkUp;
						hitbox = false;
						keys.slash = false;
						slashTimer = slashInterval;
					};
				} else if (direction == 'down') {
					switch (sprite) {
					default:
						sprite = imgs.linkDownSlash1;
						hitbox = {x: x - 18, y: y + 22};
						break;
					case imgs.linkDownSlash1:
						sprite = imgs.linkDownSlash2;
						hitbox = {x: x - 10, y: y + 50};
						break;
					case imgs.linkDownSlash2:
						sprite = imgs.linkDownSlash3;
						hitbox = {x: x + 6, y: y + 62};
						break;
					case imgs.linkDownSlash3:
						sprite = imgs.linkDownSlash4;
						hitbox = {x: x + 20, y: y + 70};
						break;
					case imgs.linkDownSlash4:
						sprite = imgs.linkDownSlash5;
						hitbox = {x: x + 38, y: y + 62};
						break;
					case imgs.linkDownSlash5:
						sprite = imgs.linkDownSlash6;
						hitbox = {x: x + 48, y: y + 44};
						break;
					case imgs.linkDownSlash6:
						sprite = imgs.linkDownSlash7;
						hitbox = {x: x + 54, y: y + 20};
						break;
					case imgs.linkDownSlash7:
						sprite = imgs.linkDown;
						hitbox = false;
						keys.slash = false;
						slashTimer = slashInterval;
					};
				} else {
					keys.slash = false;
					slashTimer = slashInterval;
				};
			};
		};
		
		////////////////////////////////////////////////////
		// bow draw animation
		////////////////////////////////////////////////////		
		if (keys.bow) {
			bowTimer += deltatime;
			if (bowTimer >= bowInterval) {
				bowTimer = 0;
				if (direction == 'left') {
					switch (sprite) {
					default:
						sprite = imgs.linkLeftBow1;
						break;
					case imgs.linkLeftBow1:
						sprite = imgs.linkLeftBow2;
						break;
					case imgs.linkLeftBow2:
						sprite = imgs.linkLeftBow5;
						break;
					case imgs.linkLeftBow5:
						sprite = imgs.linkLeftBow6;
						break;
					case imgs.linkLeftBow6:
						bowTimer = bowInterval;
						sprite = imgs.linkLeft;
						keys.bow = false;
						break;
					};
				} else if (direction == 'right') {
					switch (sprite) {
					default:
						sprite = imgs.linkRightBow1;
						break;
					case imgs.linkRightBow1:
						sprite = imgs.linkRightBow2;
						break;
					case imgs.linkRightBow2:
						sprite = imgs.linkRightBow5;
						break;
					case imgs.linkRightBow5:
						sprite = imgs.linkRightBow6;
						break;
					case imgs.linkRightBow6:
						bowTimer = bowInterval;
						sprite = imgs.linkRight;
						keys.bow = false;
						break;
					};
				} else {
					keys.bow = false;
				};
			};
		};
		
				
		////////////////////////////////////////////////////
		// bomb animation
		////////////////////////////////////////////////////
		if (keys.bomb) {
			keys.pickup = true;
			keys.bomb = false;
		};
		
		////////////////////////////////////////////////////
		// pickup animation
		////////////////////////////////////////////////////		
		if (keys.pickup) {
			if (!holding) {
				pickupTimer += deltatime;
				if (pickupTimer >= pickupInterval) {
					pickupTimer = 0;
					if (direction == 'left') {
						switch (sprite) {
						default:
							sprite = imgs.linkLeftPickup1;
							break;
						case imgs.linkLeftPickup1:
							sprite = imgs.linkLeftPickup2;
							break;
						case imgs.linkLeftPickup2:
							sprite = imgs.linkLeftPickup3;
							break;
						case imgs.linkLeftPickup3:
							pickupTimer = pickupInterval;
							sprite = imgs.linkLeftHold;
							keys.pickup = false;
							break;
						};
					} else {
						keys.pickup = false;
					};
				};
			} else if (holding) {
				pickupTimer += deltatime;
				if (pickupTimer >= pickupInterval) {
					pickupTimer = 0;
					if (direction == 'left') {
						switch (sprite) {
						default:
							sprite = imgs.linkLeftThrow1;
							break;
						case imgs.linkLeftThrow1:
							sprite = imgs.linkLeftThrow2;
							break;
						case imgs.linkLeftThrow2:
							sprite = imgs.linkLeftThrow3;
							break;
						case imgs.linkLeftThrow3:
							pickupTimer = pickupInterval;
							sprite = imgs.linkLeft;
							keys.pickup = false;
							break;
						};
					} else {
						keys.pickup = false;
					};
				};
			} else {
				keys.pickup = false;
			};
		};
		
		////////////////////////////////////////////////////
		// walking animation
		////////////////////////////////////////////////////
		if (!allowMove) { // set stepTimer = stepInterval so walking animation begins immediately upon moving
			stepTimer = stepInterval;
		};
		
		if (allowMove && (keys.left || keys.up || keys.right || keys.down)) {
			stepTimer += deltatime;
			
			if (prevDirection != direction) {
				stepTimer = stepInterval;
			};
			
			if (stepTimer >= stepInterval) {
				stepTimer = 0;
				if (holding && direction == 'left') {
						switch (sprite) {
						default:
							sprite = imgs.linkLeftHoldStep1;
							break;
						case imgs.linkLeftHoldStep1:
							sprite = imgs.linkLeftHoldStep2;
							break;
						case imgs.linkLeftHoldStep2:
							sprite = imgs.linkLeftHoldStep3;
							break;
						case imgs.linkLeftHoldStep3:
							sprite = imgs.linkLeftHold;
							break;
						case imgs.linkLeftHold:
							sprite = imgs.linkLeftHoldStep1;
							break;
						};
				} else {
					if (direction == 'left') {
						switch (stepIteration) {
						default:
							sprite = imgs.linkLeftStep1;
							stepIteration = 1;
							break;
						case 1:
							sprite = imgs.linkLeftStep2;
							stepIteration = 2;
							break;
						case 2:
							sprite = imgs.linkLeftStep3;
							stepIteration = 3;
							break;
						case 3:
							sprite = imgs.linkLeft;
							stepIteration = 4;
							break;
						case 4:
							sprite = imgs.linkLeftStep4;
							stepIteration = 5;
							break;
						case 5:
							sprite = imgs.linkLeftStep5;
							stepIteration = 6;
							break;
						case 6:
							sprite = imgs.linkLeftStep6;
							stepIteration = 7;
							break;
						case 7:
							sprite = imgs.linkLeft;
							stepIteration = 0;
							break;
						};
					} else if (direction == 'right') {
						switch (stepIteration) {
						default:
							sprite = imgs.linkRightStep1;
							stepIteration = 1;
							break;
						case 1:
							sprite = imgs.linkRightStep2;
							stepIteration = 2;
							break;
						case 2:
							sprite = imgs.linkRightStep3;
							stepIteration = 3;
							break;
						case 3:
							sprite = imgs.linkRight;
							stepIteration = 4;
							break;
						case 4:
							sprite = imgs.linkRightStep4;
							stepIteration = 5;
							break;
						case 5:
							sprite = imgs.linkRightStep5;
							stepIteration = 6;
							break;
						case 6:
							sprite = imgs.linkRightStep6;
							stepIteration = 7;
							break;
						case 7:
							sprite = imgs.linkRight;
							stepIteration = 0;
							break;
						};
					} else if (direction == 'up') {
						switch (stepIteration) {
						default:
							sprite = imgs.linkUpStep1;
							stepIteration = 1;
							break;
						case 1:
							sprite = imgs.linkUpStep2;
							stepIteration = 2;
							break;
						case 2:
							sprite = imgs.linkUpStep3;
							stepIteration = 3;
							break;
						case 3:
							sprite = imgs.linkUp;
							stepIteration = 4;
							break;
						case 4:
							sprite = imgs.linkUpStep4;
							stepIteration = 5;
							break;
						case 5:
							sprite = imgs.linkUpStep5;
							stepIteration = 6;
							break;
						case 6:
							sprite = imgs.linkUpStep6;
							stepIteration = 7;
							break;
						case 7:
							sprite = imgs.linkUp;
							stepIteration = 0;
							break;
						};
					} else if (direction == 'down') {
						switch (stepIteration) {
						default:
							sprite = imgs.linkDownStep1;
							stepIteration = 1;
							break;
						case 1:
							sprite = imgs.linkDownStep2;
							stepIteration = 2;
							break;
						case 2:
							sprite = imgs.linkDownStep3;
							stepIteration = 3;
							break;
						case 3:
							sprite = imgs.linkDown;
							stepIteration = 4;
							break;
						case 4:
							sprite = imgs.linkDownStep4;
							stepIteration = 5;
							break;
						case 5:
							sprite = imgs.linkDownStep5;
							stepIteration = 6;
							break;
						case 6:
							sprite = imgs.linkDownStep6;
							stepIteration = 7;
							break;
						case 7:
							sprite = imgs.linkDown;
							stepIteration = 0;
							break;
						};
					};
				};
			};
		};
		
		////////////////////////////////////////////////////
		// Death animation
		////////////////////////////////////////////////////
		
		if (health <= 0) {
			health = 0;
			if (deathTimer > deathInterval) {
				deathTimer = 0;
				switch (sprite) {
				default:
					sprite = imgs.linkDie1;
					break;
				case imgs.linkDie1:
					sprite = imgs.linkDie2;
					break;
				case imgs.linkDie2:
					sprite = imgs.linkDie3;
					break;
				case imgs.linkDie3:
					sprite = imgs.linkDie4;
					break;
				case imgs.linkDie4:
					sprite = imgs.linkDie5;
					break;
				case imgs.linkDie5:
					sprite = imgs.linkDie6;
					dead = true;
					break;
				};
			};
			deathTimer += deltatime;
		};
		
		////////////////////////////////////////////////////
		// Set x and y drawing offset for current sprite
		////////////////////////////////////////////////////
		if (keys.slash) {
			if (direction == 'left') {
				if (sprite == imgs.linkLeftSlash1) { drawX = x - 8; drawY = y - 20; }
				else if (sprite == imgs.linkLeftSlash2) { drawX = x - 26; drawY = y - 14; }
				else if (sprite == imgs.linkLeftSlash3) { drawX = x - 42; drawY = y - 14; }
				else if (sprite == imgs.linkLeftSlash4) { drawX = x - 46; drawY = y - 14; }
				else if (sprite == imgs.linkLeftSlash5) { drawX = x - 40; drawY = y - 12; }
				else if (sprite == imgs.linkLeftSlash6) { drawX = x - 16; drawY = y - 14; }
				else if (sprite == imgs.linkLeftSlash7) { drawX = x - 2; drawY = y - 14; }
				else { drawX = x; drawY = y - 14; };
			} else if (direction == 'right') {
				if (sprite == imgs.linkRightSlash1) { drawX = x + 32 + (8 - sprite.width) ; drawY = y - 20; }
				else if (sprite == imgs.linkRightSlash2) { drawX = x + 32 + (26 - sprite.width); drawY = y - 14; }
				else if (sprite == imgs.linkRightSlash3) { drawX = x + 32 + (42 - sprite.width); drawY = y - 14; }
				else if (sprite == imgs.linkRightSlash4) { drawX = x + 32 + (46 - sprite.width); drawY = y - 14; }
				else if (sprite == imgs.linkRightSlash5) { drawX = x + 32 + (40 - sprite.width); drawY = y - 12; }
				else if (sprite == imgs.linkRightSlash6) { drawX = x + 32 + (16 - sprite.width); drawY = y - 14; }
				else if (sprite == imgs.linkRightSlash7) { drawX = x + 32 +(2 - sprite.width); drawY = y - 14; }
				else { drawX = x; drawY = y - 14; };
			} else if (direction == 'up') {
				if (sprite == imgs.linkUpSlash1) { drawX = x - 2; drawY = y - 18; }
				else if (sprite == imgs.linkUpSlash2) { drawX = x - 2; drawY = y - 24; }
				else if (sprite == imgs.linkUpSlash3) { drawX = x - 2; drawY = y - 38; }
				else if (sprite == imgs.linkUpSlash4) { drawX = x - 2; drawY = y - 46; }
				else if (sprite == imgs.linkUpSlash5) { drawX = x - 10; drawY = y - 38; }
				else if (sprite == imgs.linkUpSlash6) { drawX = x - 24; drawY = y - 20; }
				else if (sprite == imgs.linkUpSlash7) { drawX = x - 32; drawY = y - 18; }
				else { drawX = x - 2; drawY = y - 16; };
			} else if (direction == 'down') {
				if (sprite == imgs.linkDownSlash1) { drawX = x - 18; drawY = y - 12; }
				else if (sprite == imgs.linkDownSlash2) { drawX = x - 10; drawY = y - 4; }
				else if (sprite == imgs.linkDownSlash3) { drawX = x - 4; drawY = y - 6; }
				else if (sprite == imgs.linkDownSlash4) { drawX = x - 2; drawY = y - 4; }
				else if (sprite == imgs.linkDownSlash5) { drawX = x - 2; drawY = y - 8; }
				else if (sprite == imgs.linkDownSlash6) { drawX = x - 2; drawY = y - 10; }
				else if (sprite == imgs.linkDownSlash7) { drawX = x - 2; drawY = y - 14; }
				else { drawX = x - 2; drawY = y - 14; };
			} else { drawX = x; drawY = y; };
		} else if (keys.bow) {
			if (direction == 'left') {
				if (sprite == imgs.linkLeftBow1) { drawX = x - 10; drawY = y - 14; }
				else if (sprite == imgs.linkLeftBow2) { drawX = x - 8; drawY = y - 14; }
				else if (sprite == imgs.linkLeftBow5) { drawX = x - 4; drawY = y - 14; }
				else if (sprite == imgs.linkLeftBow6) { drawX = x - 2; drawY = y - 14; };
			} else if (direction == 'right') {
				if (sprite == imgs.linkRightBow1) { drawX = x - 6; drawY = y - 14; }
				else if (sprite == imgs.linkRightBow2) { drawX = x - 14; drawY = y - 14; }
				else if (sprite == imgs.linkRightBow5) { drawX = x - 10; drawY = y - 14; }
				else if (sprite == imgs.linkRightBow6) { drawX = x - 8; drawY = y - 14; };
			};
		} else if (keys.pickup) {
			if (direction == 'left') {
				if (sprite == imgs.linkLeftPickup1) { drawX = x - 12; drawY = y - 10; }
				else if (sprite == imgs.linkLeftPickup2) { drawX = x - 4; drawY = y - 10; }
				else if (sprite == imgs.linkLeftPickup3) { drawX = x + 6; drawY = y - 12; };
			};
		} else if (holding && direction == 'left') {
			if (sprite == imgs.linkLeftHold) { drawX = x; drawY = y - 14; }
			else if (sprite == imgs.linkLeftHoldStep1) { drawX = x - 2; drawY = y - 14; }
			else if (sprite == imgs.linkLeftHoldStep2) { drawX = x - 6; drawY = y - 16; }
			else if (sprite == imgs.linkLeftHoldStep3) { drawX = x - 2; drawY = y - 14; };
		} else if (health <= 0) {
			if (sprite == imgs.linkDie1) { drawX = x - 4; drawY = y - 16; }
			else if (sprite == imgs.linkDie2) { drawX = x; drawY = y - 16; }
			else if (sprite == imgs.linkDie3) { drawX = x - 4; drawY = y - 16; }
			else if (sprite == imgs.linkDie4) { drawX = x - 2; drawY = y - 16; }
			else if (sprite == imgs.linkDie5) { drawX = x - 12; drawY = y - 10; }
			else if (sprite == imgs.linkDie6) { drawX = x - 30; drawY = y; }
		} else if (direction == 'left') {
			if (sprite == imgs.linkLeftStep1) { drawX = x - 6; drawY = y - 16; }
			else if (sprite == imgs.linkLeftStep2) { drawX = x - 6; drawY = y - 18; }
			else if (sprite == imgs.linkLeftStep3) { drawX = x - 6; drawY = y - 16; }
			else if (sprite == imgs.linkLeftStep4) { drawX = x - 6; drawY = y - 16; }
			else if (sprite == imgs.linkLeftStep5) { drawX = x - 6; drawY = y - 18; }
			else if (sprite == imgs.linkLeftStep6) { drawX = x - 6; drawY = y - 16; }
			else { drawX = x - 6; drawY = y - 14; };
		} else if (direction == 'right') {
			if (sprite == imgs.linkRightStep1) { drawX = x; drawY = y - 16; }
			else if (sprite == imgs.linkRightStep2) { drawX = x - 8; drawY = y - 18; }
			else if (sprite == imgs.linkRightStep3) { drawX = x - 10; drawY = y - 16; }
			else if (sprite == imgs.linkRightStep4) { drawX = x; drawY = y - 16; }
			else if (sprite == imgs.linkRightStep5) { drawX = x - 8; drawY = y - 18; }
			else if (sprite == imgs.linkRightStep6) { drawX = x - 10; drawY = y - 16; }
			else { drawX = x; drawY = y - 14;};
		} else if (direction == 'up') {
			drawX = x;
			if (sprite == imgs.linkUpStep1) { drawY = y - 16; }
			else if (sprite == imgs.linkUpStep2) { drawY = y - 20; }
			else if (sprite == imgs.linkUpStep3) { drawY = y - 18; }
			else if (sprite == imgs.linkUpStep4) { drawY = y - 16; }
			else if (sprite == imgs.linkUpStep5) { drawY = y - 20; }
			else if (sprite == imgs.linkUpStep6) { drawY = y - 18; }
			else { drawY = y - 14; };
		} else if (direction == 'down') {
			drawX = x - 4;
			if (sprite == imgs.linkDownStep1) { drawY = y - 24; }
			else if (sprite == imgs.linkDownStep2) { drawY = y - 24; }
			else if (sprite == imgs.linkDownStep3) { drawY = y - 18; }
			else if (sprite == imgs.linkDownStep4) { drawY = y - 24; }
			else if (sprite == imgs.linkDownStep5) { drawY = y - 24; }
			else if (sprite == imgs.linkDownStep6) { drawY = y - 18; }
			else { drawY = y - 16; };
		} else {
			drawX = x - 4;
			drawY = y - 14;
		};
		
		prevDirection = direction;
	};

	var render = function(ctx) {

//		ctx.fillRect(x, y, width, height); // player hitbox

		// Health bar
		ctx.fillStyle = "red";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.fillRect(x, y + 34, 32 * (health / maxHealth), 8);
		ctx.strokeRect(x, y + 34, 32, 8);
		
		if (!spriteOff) {
			ctx.drawImage(sprite, drawX, drawY);
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
		getArrows: getArrows,
		setKnockback: setKnockback,
		setHitFlash: setHitFlash,
		getHealth: getHealth,
		setHealth: setHealth,
		getId: getId,
		setId: setId,
		update: update,
		render: render
	};
};