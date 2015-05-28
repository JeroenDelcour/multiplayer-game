/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	localPlayer,	// Local player
	players,		// Players
	arrows,			// Arrows
	bombs,			// Bombs
	socket,			// Socket connection
	localSeq,		// Local packet localSequence number
	remoteSeq,		// Last recieved packet localSequence number
	now,			// Current time
	then, 			// Time last frame was rendered
	deltatime,		// Time between last and current frame
	pingIDs,		// IDs of pings for latency check
	latency,		// Latency
	imgs,			// Images
	messageboard;	// messageboard


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Set first time for animation deltatime loop
	then = Date.now();
	
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Define the canvas
	canvas.width = 800;
	canvas.height = 600;
//	canvas.style.margin="0px auto";
	canvas.style.border="1px solid black";
	
	// Load images
	imgsReady = false;
	imgs = [];
	imgs.linkLeft = new Image();
	imgs.linkLeft.src = "/mpgame/public/imgs/link_left.png";
	imgs.linkLeftStep1 = new Image();
	imgs.linkLeftStep1.src = "/mpgame/public/imgs/link_left_step1.png";
	imgs.linkLeftStep2 = new Image();
	imgs.linkLeftStep2.src = "/mpgame/public/imgs/link_left_step2.png";
	imgs.linkLeftStep3 = new Image();
	imgs.linkLeftStep3.src = "/mpgame/public/imgs/link_left_step3.png";
	imgs.linkLeftStep4 = new Image();
	imgs.linkLeftStep4.src = "/mpgame/public/imgs/link_left_step4.png";
	imgs.linkLeftStep5 = new Image();
	imgs.linkLeftStep5.src = "/mpgame/public/imgs/link_left_step5.png";
	imgs.linkLeftStep6 = new Image();
	imgs.linkLeftStep6.src = "/mpgame/public/imgs/link_left_step6.png";
	imgs.linkLeftSlash1 = new Image();
	imgs.linkLeftSlash1.src = "/mpgame/public/imgs/link_left_slash1.png";
	imgs.linkLeftSlash2 = new Image();
	imgs.linkLeftSlash2.src = "/mpgame/public/imgs/link_left_slash2.png";
	imgs.linkLeftSlash3 = new Image();
	imgs.linkLeftSlash3.src = "/mpgame/public/imgs/link_left_slash3.png";
	imgs.linkLeftSlash4 = new Image();
	imgs.linkLeftSlash4.src = "/mpgame/public/imgs/link_left_slash4.png";
	imgs.linkLeftSlash5 = new Image();
	imgs.linkLeftSlash5.src = "/mpgame/public/imgs/link_left_slash5.png";
	imgs.linkLeftSlash6 = new Image();
	imgs.linkLeftSlash6.src = "/mpgame/public/imgs/link_left_slash6.png";
	imgs.linkLeftSlash7 = new Image();
	imgs.linkLeftSlash7.src = "/mpgame/public/imgs/link_left_slash7.png";
	imgs.linkRight = new Image();
	imgs.linkRight.src = "/mpgame/public/imgs/link_right.png";
	imgs.linkRightStep1 = new Image();
	imgs.linkRightStep1.src = "/mpgame/public/imgs/link_right_step1.png";
	imgs.linkRightStep2 = new Image();
	imgs.linkRightStep2.src = "/mpgame/public/imgs/link_right_step2.png";
	imgs.linkRightStep3 = new Image();
	imgs.linkRightStep3.src = "/mpgame/public/imgs/link_right_step3.png";
	imgs.linkRightStep4 = new Image();
	imgs.linkRightStep4.src = "/mpgame/public/imgs/link_right_step4.png";
	imgs.linkRightStep5 = new Image();
	imgs.linkRightStep5.src = "/mpgame/public/imgs/link_right_step5.png";
	imgs.linkRightStep6 = new Image();
	imgs.linkRightStep6.src = "/mpgame/public/imgs/link_right_step6.png";
	imgs.linkRightSlash1 = new Image();
	imgs.linkRightSlash1.src = "/mpgame/public/imgs/link_right_slash1.png";
	imgs.linkRightSlash2 = new Image();
	imgs.linkRightSlash2.src = "/mpgame/public/imgs/link_right_slash2.png";
	imgs.linkRightSlash3 = new Image();
	imgs.linkRightSlash3.src = "/mpgame/public/imgs/link_right_slash3.png";
	imgs.linkRightSlash4 = new Image();
	imgs.linkRightSlash4.src = "/mpgame/public/imgs/link_right_slash4.png";
	imgs.linkRightSlash5 = new Image();
	imgs.linkRightSlash5.src = "/mpgame/public/imgs/link_right_slash5.png";
	imgs.linkRightSlash6 = new Image();
	imgs.linkRightSlash6.src = "/mpgame/public/imgs/link_right_slash6.png";
	imgs.linkRightSlash7 = new Image();
	imgs.linkRightSlash7.src = "/mpgame/public/imgs/link_right_slash7.png";
	imgs.linkUp = new Image();
	imgs.linkUp.src = "/mpgame/public/imgs/link_Up.png";
	imgs.linkUpStep1 = new Image();
	imgs.linkUpStep1.src = "/mpgame/public/imgs/link_up_step1.png";
	imgs.linkUpStep2 = new Image();
	imgs.linkUpStep2.src = "/mpgame/public/imgs/link_up_step2.png";
	imgs.linkUpStep3 = new Image();
	imgs.linkUpStep3.src = "/mpgame/public/imgs/link_up_step3.png";
	imgs.linkUpStep4 = new Image();
	imgs.linkUpStep4.src = "/mpgame/public/imgs/link_up_step4.png";
	imgs.linkUpStep5 = new Image();
	imgs.linkUpStep5.src = "/mpgame/public/imgs/link_up_step5.png";
	imgs.linkUpStep6 = new Image();
	imgs.linkUpStep6.src = "/mpgame/public/imgs/link_up_step6.png";
	imgs.linkUpSlash1 = new Image();
	imgs.linkUpSlash1.src = "/mpgame/public/imgs/link_up_slash1.png";
	imgs.linkUpSlash2 = new Image();
	imgs.linkUpSlash2.src = "/mpgame/public/imgs/link_up_slash2.png";
	imgs.linkUpSlash3 = new Image();
	imgs.linkUpSlash3.src = "/mpgame/public/imgs/link_up_slash3.png";
	imgs.linkUpSlash4 = new Image();
	imgs.linkUpSlash4.src = "/mpgame/public/imgs/link_up_slash4.png";
	imgs.linkUpSlash5 = new Image();
	imgs.linkUpSlash5.src = "/mpgame/public/imgs/link_up_slash5.png";
	imgs.linkUpSlash6 = new Image();
	imgs.linkUpSlash6.src = "/mpgame/public/imgs/link_up_slash6.png";
	imgs.linkUpSlash7 = new Image();
	imgs.linkUpSlash7.src = "/mpgame/public/imgs/link_up_slash7.png";
	imgs.linkDown = new Image();
	imgs.linkDown.src = "/mpgame/public/imgs/link_down.png";
	imgs.linkDownStep1 = new Image();
	imgs.linkDownStep1.src = "/mpgame/public/imgs/link_down_step1.png";
	imgs.linkDownStep2 = new Image();
	imgs.linkDownStep2.src = "/mpgame/public/imgs/link_down_step2.png";
	imgs.linkDownStep3 = new Image();
	imgs.linkDownStep3.src = "/mpgame/public/imgs/link_down_step3.png";
	imgs.linkDownStep4 = new Image();
	imgs.linkDownStep4.src = "/mpgame/public/imgs/link_down_step4.png";
	imgs.linkDownStep5 = new Image();
	imgs.linkDownStep5.src = "/mpgame/public/imgs/link_down_step5.png";
	imgs.linkDownStep6 = new Image();
	imgs.linkDownStep6.src = "/mpgame/public/imgs/link_down_step6.png";
	imgs.linkDownSlash1 = new Image();
	imgs.linkDownSlash1.src = "/mpgame/public/imgs/link_down_slash1.png";
	imgs.linkDownSlash2 = new Image();
	imgs.linkDownSlash2.src = "/mpgame/public/imgs/link_down_slash2.png";
	imgs.linkDownSlash3 = new Image();
	imgs.linkDownSlash3.src = "/mpgame/public/imgs/link_down_slash3.png";
	imgs.linkDownSlash4 = new Image();
	imgs.linkDownSlash4.src = "/mpgame/public/imgs/link_down_slash4.png";
	imgs.linkDownSlash5 = new Image();
	imgs.linkDownSlash5.src = "/mpgame/public/imgs/link_down_slash5.png";
	imgs.linkDownSlash6 = new Image();
	imgs.linkDownSlash6.src = "/mpgame/public/imgs/link_down_slash6.png";
	imgs.linkDownSlash7 = new Image();
	imgs.linkDownSlash7.src = "/mpgame/public/imgs/link_down_slash7.png";
	imgs.linkLeftBow1 = new Image();
	imgs.linkLeftBow1.src = "/mpgame/public/imgs/link_left_bow1.png";
	imgs.linkLeftBow2 = new Image();
	imgs.linkLeftBow2.src = "/mpgame/public/imgs/link_left_bow2.png";
	imgs.linkLeftBow3 = new Image();
	imgs.linkLeftBow3.src = "/mpgame/public/imgs/link_left_bow3.png";
	imgs.linkLeftBow4 = new Image();
	imgs.linkLeftBow4.src = "/mpgame/public/imgs/link_left_bow4.png";
	imgs.linkLeftBow5 = new Image();
	imgs.linkLeftBow5.src = "/mpgame/public/imgs/link_left_bow5.png";
	imgs.linkLeftBow6 = new Image();
	imgs.linkLeftBow6.src = "/mpgame/public/imgs/link_left_bow6.png";
	imgs.linkRightBow1 = new Image();
	imgs.linkRightBow1.src = "/mpgame/public/imgs/link_right_bow1.png";
	imgs.linkRightBow2 = new Image();
	imgs.linkRightBow2.src = "/mpgame/public/imgs/link_right_bow2.png";
	imgs.linkRightBow3 = new Image();
	imgs.linkRightBow3.src = "/mpgame/public/imgs/link_right_bow3.png";
	imgs.linkRightBow4 = new Image();
	imgs.linkRightBow4.src = "/mpgame/public/imgs/link_right_bow4.png";
	imgs.linkRightBow5 = new Image();
	imgs.linkRightBow5.src = "/mpgame/public/imgs/link_right_bow5.png";
	imgs.linkRightBow6 = new Image();
	imgs.linkRightBow6.src = "/mpgame/public/imgs/link_right_bow6.png";
	imgs.linkLeftPickup1 = new Image();
	imgs.linkLeftPickup1.src = "/mpgame/public/imgs/link_left_pickup1.png";
	imgs.linkLeftPickup2 = new Image();
	imgs.linkLeftPickup2.src = "/mpgame/public/imgs/link_left_pickup2.png";
	imgs.linkLeftPickup3 = new Image();
	imgs.linkLeftPickup3.src = "/mpgame/public/imgs/link_left_pickup3.png";
	imgs.linkLeftHold = new Image();
	imgs.linkLeftHold.src = "/mpgame/public/imgs/link_left_hold.png";
	imgs.linkLeftHoldStep1 = new Image();
	imgs.linkLeftHoldStep1.src = "/mpgame/public/imgs/link_left_hold_step1.png";
	imgs.linkLeftHoldStep2 = new Image();
	imgs.linkLeftHoldStep2.src = "/mpgame/public/imgs/link_left_hold_step2.png";
	imgs.linkLeftHoldStep3 = new Image();
	imgs.linkLeftHoldStep3.src = "/mpgame/public/imgs/link_left_hold_step3.png";
	imgs.linkLeftThrow1 = new Image();
	imgs.linkLeftThrow1.src = "/mpgame/public/imgs/link_left_throw1.png";
	imgs.linkLeftThrow2 = new Image();
	imgs.linkLeftThrow2.src = "/mpgame/public/imgs/link_left_throw2.png";
	imgs.linkLeftThrow3 = new Image();
	imgs.linkLeftThrow3.src = "/mpgame/public/imgs/link_left_throw3.png";
	imgs.linkLeftThrow4 = new Image();
	imgs.linkLeftThrow4.src = "/mpgame/public/imgs/link_left_throw4.png";
	imgs.linkDie1 = new Image();
	imgs.linkDie1.src = "/mpgame/public/imgs/link_die1.png";
	imgs.linkDie2 = new Image();
	imgs.linkDie2.src = "/mpgame/public/imgs/link_die2.png";
	imgs.linkDie3 = new Image();
	imgs.linkDie3.src = "/mpgame/public/imgs/link_die3.png";
	imgs.linkDie4 = new Image();
	imgs.linkDie4.src = "/mpgame/public/imgs/link_die4.png";
	imgs.linkDie5 = new Image();
	imgs.linkDie5.src = "/mpgame/public/imgs/link_die5.png";
	imgs.linkDie6 = new Image();
	imgs.linkDie6.src = "/mpgame/public/imgs/link_die6.png";
	// arrows
	imgs.arrowLeft = new Image();
	imgs.arrowLeft.src = "/mpgame/public/imgs/arrow_left.png";
	imgs.arrowRight = new Image();
	imgs.arrowRight.src = "/mpgame/public/imgs/arrow_right.png";
	// bombs
	imgs.bomb = new Image();
	imgs.bomb.src = "/mpgame/public/imgs/bomb.png";
	imgs.bombTick = new Image();
	imgs.bombTick.src = "/mpgame/public/imgs/bomb_tick.png";
	imgs.bombExplode1 = new Image();
	imgs.bombExplode1.src = "/mpgame/public/imgs/bomb_explode1.png";
	imgs.bombExplode2 = new Image();
	imgs.bombExplode2.src = "/mpgame/public/imgs/bomb_explode2.png";
	imgs.bombExplode3 = new Image();
	imgs.bombExplode3.src = "/mpgame/public/imgs/bomb_explode3.png";
	imgs.bombExplode4 = new Image();
	imgs.bombExplode4.src = "/mpgame/public/imgs/bomb_explode4.png";
	imgs.bombExplode5 = new Image();
	imgs.bombExplode5.src = "/mpgame/public/imgs/bomb_explode5.png";
	imgs.bombExplode6 = new Image();
	imgs.bombExplode6.src = "/mpgame/public/imgs/bomb_explode6.png";
	imgs.bombExplode7 = new Image();
	imgs.bombExplode7.src = "/mpgame/public/imgs/bomb_explode7.png";
	
	// Initialise keyboard controls
//	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width - (56 * 2) - 32)) + 56,
		startY = Math.round(Math.random()*(canvas.height - 86 - 42 - 32)) + 42;

	// Initialise the local player
	var startHealth = 10;
	localPlayer = new Player(startX, startY, startHealth);
	
	localSeq = 0,
	remoteSeq = 0,
	socket = io.connect("http://80.112.165.133", {port: 8000, transports: ["websocket"]});
	
	players = [];
	arrows = [];
	bombs = [];
	messageboard = [];
	players.push(localPlayer);
	
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);

	// Window resize
//	window.addEventListener("resize", onResize, false);
	
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("set player id", onSetPlayerId);
	socket.on("new player", onNewPlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("key down", onServerKeyDown);
	socket.on("key up", onServerKeyUp);
	socket.on("set hold", onSetHold);
	socket.on("hit", onHit);
	socket.on("player killed", onPlayerKilled);
	socket.on('pong', function() {
	  console.log('Latency (round-trip time): ' + (+new Date - emitTime));
	});
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

function onSocketConnected() {
    console.log("Connected to socket server");
	
	socket.emit("new player", {localSeq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY(), health: localPlayer.getHealth()});
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};

function onSetPlayerId(data) {
	localPlayer.setId(data.id);
	remoteSeq = data.seq;
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	
	var newPlayer = new Player(data.x, data.y, data.health);
	newPlayer.setId(data.id);
	players.push(newPlayer);
	
	messageboard.push(data.id+" connected");
};

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	players.splice(players.indexOf(removePlayer), 1);
	
	messageboard.push(data.id+" disconnected");
};

function onServerKeyDown(data) {
	var player = playerById(data.id);
	
	if (!player) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	if (localPlayer.getRemoteSeq() >= data.seq) {
		console.log("Old remote packet discarded: "+data.seq);
		return;
	};
	
	console.log("New remote packet received: "+data.seq);
		
	player.setRemoteSeq(data.seq);
	
	if (data.key == 'bow') {
		var arrowX;
		var arrowY;
		var arrowSprite;
		if (player.getDirection() == 'left') { arrowSprite = imgs.arrowLeft; arrowX = data.x - 8; arrowY = data.y + 10 }
		else if (player.getDirection() == 'right') { arrowSprite = imgs.arrowRight; arrowX = data.x + 10; arrowY = data.y + 10 };
		setTimeout(function() {arrows.push({ sprite: arrowSprite, speed: 800, x: arrowX, y: arrowY })}, 400);
	} else if (data.key == 'pickup') {
		if (player.getHolding()) {	// if holding bomb: throw it
			var bomb = bombById(player.getHolding());
			bomb.x = player.getX() - 24;
			bomb.y = player.getY() + 6;
			bomb.held = false;
			player.setHolding(false);
		};
	};
	
	player.setX(data.x);
	player.setY(data.y);
	player.setKey(data.key, true);
};

function onServerKeyUp(data) {
	var player = playerById(data.id);
	
	if (!player) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	if (localPlayer.getRemoteSeq() >= data.seq) {
		console.log("Old remote packet discarded: "+data.seq);
		return;
	};
	
	console.log("New remote packet received: "+data.seq);
		
	player.setRemoteSeq(data.seq);
	
	player.setKey(data.key, false);
};

function onSetHold(data) {
	var player = playerById(data.id);
	
	if (!player) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	if (!bombById(data.bombId)) { // if bomb doesn't exist: create it
		bombs.push( { id: data.bombId, sprite: imgs.bomb, x: player.getX() - 24, y: player.getY() + 4, held: true, timer: 0, boom: false } );
	};
	player.setHolding(data.bombId);
};

function onHit(data) {
	var hitter = playerById(data.hitter);
	var hittee = playerById(data.hittee);
	
	if (!hitter) {
		console.log("Player not found: "+this.id);
//		return;
	};
	if (!hittee) {
		console.log("Player not found: "+this.hitter);
		return;
	};
	
	hittee.setHealth(data.health);
	hittee.setHitFlash();
	
/*	if (!data.arrow) {
		var x = hittee.getX();
		var y = hittee.getY();
		var x2 = hitter.getX();
		var y2 = hitter.getY();
		if (((x + 32) - x2) < ((y + 32) - y2) && ((x + 32) - x2) < ((x2 + 32) - x) && ((x + 32) - x2) < ((y2 + 32) - y)) {
			hittee.setKnockback("left");
		} else if (((x2 + 32) - x) < ((y + 32) - y2) && ((x2 + 32) - x) < ((x + 32) - x2) && ((x2 + 32) - x) < ((y2 + 32) - y)) {
			hittee.setKnockback("right");
		} else if (((y2 + 32) - y) < ((y + 32) - y2) && ((y2 + 32) - y) < ((x + 32) - x2) && ((y2 + 32) - y) < ((x2 + 32) - x)) {
			hittee.setKnockback("down");
		} else if (((y + 32) - y2) < ((y2 + 32) - y) && ((y + 32) - y2) < ((x + 32) - x2) && ((y + 32) - y2) < ((x2 + 32) - x)) {
			hittee.setKnockback("up");
		};
	};*/

	if (hittee.getHealth() <= 0) {
		messageboard.push(hitter.getId()+" killed "+hittee.getId());
	} else {
		messageboard.push(hitter.getId()+" hit "+hittee.getId());
	};
};

function onPlayerKilled(data) {
	var playerKilled = playerById(data.id);
	var killer = playerById(data.killer);
	
	if (!playerKilled) {
		console.log("Player not found: "+this.id);
		return;
	};
	if (!killer) {
		console.log("Player not found: "+this.hitter);
		return;
	};
	
	if (data.weapon != 'sword') {
		killer.getArrows().splice(data.weapon, 1);
	};
	
	playerKilled.setHealth(0);
	messageboard.push(playerKilled.id+" was killed by "+data.killer);
};

/**************************************************
** KEYBOARD INPUT
**************************************************/
var up = false,
	left = false,
	right = false,
	down = false,
	A = false,
	S = false,
	E = false,
	D = false;
	
function onKeyDown(e) {
	if (localPlayer.getHealth() <= 0) { return; };

	var that = this,
		c = e.keyCode;
	switch (c) {
		// Controls
		case 37: // Left
			if (left == false) {
				left = true;
				localPlayer.setKey("left", true);
				socket.emit("key down", {key: "left", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 38: // Up
			if (up == false) {
				up = true;
				localPlayer.setKey("up", true);
				socket.emit("key down", {key: "up", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 39: // Right
			if (right == false) {
				localPlayer.setKey("right", true);
				right = true; // Will take priority over the left key
				socket.emit("key down", {key: "right", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 40: // Down
			if (down == false) {
				down = true;
				localPlayer.setKey("down", true);
				socket.emit("key down", {key: "down", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 65: // A
			if (A == false && !localPlayer.getKeys().slash && !localPlayer.getKeys().bow && !localPlayer.getKeys().pickup && !localPlayer.getHolding()) {
				A = true;
				localPlayer.setKey("slash", true);
				socket.emit("key down", {key: "slash", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 83: // S
			if (S == false && !localPlayer.getKeys().bow && !localPlayer.getKeys().slash && !localPlayer.getKeys().pickup && !localPlayer.getHolding() && (localPlayer.getDirection() == 'left' || localPlayer.getDirection() == 'right')) {
				S = true;
				localPlayer.setKey("bow", true);
				socket.emit("key down", {key: "bow", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
				
				// shoot arrow at correct time in animation:
				if (localPlayer.getDirection() == 'left') { 
					arrowSprite = imgs.arrowLeft;
					arrowX = localPlayer.getX() - 8;
					arrowY = localPlayer.getY() + 10;
				} else if (localPlayer.getDirection() == 'right') {
					arrowSprite = imgs.arrowRight;
					arrowX = localPlayer.getX() + 10;
					arrowY = localPlayer.getY() + 10;
				};
				setTimeout(function() {arrows.push({ sprite: arrowSprite, speed: 800, x: arrowX, y: arrowY })}, 300);
			};
			break;
		case 69: // E
			if (E == false && !localPlayer.getKeys().bow && !localPlayer.getKeys().slash && !localPlayer.getKeys().pickup && localPlayer.getDirection() == 'left') {
				E = true;
				localPlayer.setKey("pickup", true);
				// if holding bomb: throw it
				if (localPlayer.getHolding()) {
					var bomb = bombById(localPlayer.getHolding());
					bomb.x = localPlayer.getX() - 24;
					bomb.y = localPlayer.getY() + 6;
					bomb.held = false;
					localPlayer.setHolding(false);
				} else { // if bomb within reach: pick it up
					var x = localPlayer.getX();
					var y = localPlayer.getY();
					var i;
					for (i = 0; i < bombs.length; i++) {
						if ((x - (bombs[i].x + 24)) <= 12 && (x - (bombs[i].x + 24)) >= 0 && y < (bombs[i].y + 28) && y > (bombs[i].y - 24)) {
							localPlayer.setHolding(bombs[i].id);
							bombs[i].held = true;
							var bombId = bombs[i].id;
							break;
						};
					};
				};
				socket.emit("key down", {key: "pickup", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
		case 68: // D
			if (E == false && !localPlayer.getKeys().bow && !localPlayer.getKeys().slash && !localPlayer.getKeys().pickup && !localPlayer.getHolding() && localPlayer.getDirection() == 'left') {
				D = true;
				localPlayer.setKey("bomb", true);
				socket.emit("key down", {key: "bomb", seq: nextSeq(), x: localPlayer.getX(), y: localPlayer.getY()});
			};
			break;
	};
};

function onKeyUp(e) {
	if (localPlayer.getHealth() <= 0) { return; };
	
	var that = this,
		c = e.keyCode;
	switch (c) {
		case 37: // Left
			left = false;
			localPlayer.setKey("left", false);
			socket.emit("key up", { seq: nextSeq(), key: "left" });
			break;
		case 38: // Up
			up = false;
			localPlayer.setKey("up", false);
			socket.emit("key up", { seq: nextSeq(), key: "up" });
			break;
		case 39: // Right
			right = false;
			localPlayer.setKey("right", false);
			socket.emit("key up", { seq: nextSeq(), key: "right" });
			break;
		case 40: // Down
			down = false;
			localPlayer.setKey("down", false);
			socket.emit("key up", { seq: nextSeq(), key: "down" });
			break;
		case 65: // A
			A = false;
			break;
		case 83: // S
			S = false;
			break;
		case 69: // E
			E = false;
			break;
		case 68: // D
			D = false;
			break;
	};
};

/**************************************************
** GAME LOGIC UPDATE
**************************************************/
function logic() {
	// define time passed since last frame was drawn (in seconds)
	now = Date.now();
	deltatime = (now - then) / 1000;
	
	// Update players & items they're holding
	var i;
	for (i = 0; i < players.length; i++) {
		players[i].update(deltatime);
		if (players[i].getHolding()) {
			var bomb = bombById(players[i].getHolding());
			if (bomb.boom) {
				players[i].setHolding(false);
				bomb.x = players[i].getX() + 2;
				bomb.y = players[i].getY();
			} else {
				bomb.x = players[i].getX() + 4;
				bomb.y = players[i].getY() - 42;
			};
		};
	};
	
	// Update arrows
	var i;
	for (i = 0; i < arrows.length; i++) {
		// remove arrow when out of bounds
		if (arrows[i].x > canvas.width || arrows[i].x + 30 < 0 || arrows[i].y > canvas.height || arrows[i].y + 10 < 0) {
			arrows.splice(i,1);
			continue;
		};
		// update location
		if (arrows[i].sprite == imgs.arrowLeft) { arrows[i].x -= arrows[i].speed * deltatime; }
		else if (arrows[i].sprite == imgs.arrowUp) { arrows[i].y -= arrows[i].speed * deltatime; }
		else if (arrows[i].sprite == imgs.arrowRight) { arrows[i].x += arrows[i].speed * deltatime; }
		else if (arrows[i].sprite == imgs.arrowDown) { arrows[i].y += arrows[i].speed * deltatime; };
	};
	
	// Update bombs
	var i;
	for (i = 0; i < bombs.length; i++) {
		bombs[i].timer += deltatime;
		if (bombs[i].boom) { // explosion animation
			if (bombs[i].timer >= 0.05) {
				bombs[i].timer = 0;
				switch (bombs[i].sprite) {
				default:
					bombs[i].sprite = imgs.bombTick;
					bombs[i].x -= 2;
					bombs[i].y -= 2;
					break;
				case imgs.bombTick:
					bombs[i].sprite = imgs.bombExplode1;
					bombs[i].x -= 17;
					bombs[i].y -= 15;
					break;
				case imgs.bombExplode1:
					bombs[i].sprite = imgs.bombExplode2;
					break;
				case imgs.bombExplode2:
					bombs[i].sprite = imgs.bombExplode3;
					bombs[i].x += 15;
					bombs[i].y += 15;
					break;
				case imgs.bombExplode3:
					bombs[i].sprite = imgs.bombExplode4;
					bombs[i].x -= 9;
					bombs[i].y -= 9;
					break;
				case imgs.bombExplode4:
					bombs[i].sprite = imgs.bombExplode5;
					bombs[i].x -= 2;
					bombs[i].y -= 6;
					break;
				case imgs.bombExplode5:
					bombs[i].sprite = imgs.bombExplode6;
					bombs[i].y += 2;
					break;
				case imgs.bombExplode6:
					bombs[i].sprite = imgs.bombExplode7;
					bombs[i].x -= 2;
					break;
				case imgs.bombExplode7:
					bombs.splice(bombs.indexOf(bombs[i]),1);
					break;
				};
			};
		} else if (!bombs[i].boom && bombs[i].timer > 3) {
			bombs[i].boom = true;
			bombs[i].timer = 0.1;
		} else if (!bombs[i].boom && bombs[i].timer > 2.5) {
			bombs[i].sprite = imgs.bombTick;
		} else if (!bombs[i].boom && bombs[i].timer > 2) {
			bombs[i].sprite = imgs.bomb;
		} else if (!bombs[i].boom && bombs[i].timer > 1.5) {
			bombs[i].sprite = imgs.bombTick;
		} else if (!bombs[i].boom && bombs[i].timer > 1) {
			bombs[i].sprite = imgs.bomb;
		} else if (!bombs[i].boom && bombs[i].timer > 0.5) {
			bombs[i].sprite = imgs.bombTick;
		};
	};
	
	// Update messageboard
	if (messageboard.length > 10) {
/*		for (i = 0; i < messageboard.length; i++) {
			messageboard[i] = messageboard[i+1];
		};
		messageboard.splice(10,1);*/
		messageboard.shift();
	};
	
	// Sort game objects to be drawn by Y value for overlapping purposes
	players.sort(function(a,b){ return a.getY() - b.getY(); });
	
	then = now; // define time at which last frame was drawn for deltatime calculation
	
	setTimeout(logic, 1000 / 60);
};


/**************************************************
** GAME RENDER
**************************************************/
function render() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw players
	var i;
	for (i = 0; i < players.length; i++) {
		players[i].render(ctx);
	};
	
	// Draw arrows
	var i;
	for (i = 0; i < arrows.length; i++) {
		ctx.drawImage(arrows[i].sprite, arrows[i].x, arrows[i].y);
	};
	
	// Draw bombs
	var i;
	for (i = 0; i < bombs.length; i++) {
		ctx.drawImage(bombs[i].sprite, bombs[i].x, bombs[i].y);
	};
	
	// Draw messageboard
	ctx.fillStyle = '#fff';
	for (i = 0; i < messageboard.length; i++) {
		ctx.fillText(messageboard[i], 10, i * 16+ 16);
	};
	
	window.requestAnimFrame(render);
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getId() == id)
			return players[i];
	};

	return false;
};

// Find bomb by ID
function bombById(id) {
	var i;
	for (i = 0; i < bombs.length; i++) {
		if (bombs[i].id == id)
			return bombs[i];
	};

	return false;
};

// Set unique bomb ID
var bombIdCounter = 1;
function newBombId () {
	return bombIdCounter++;
};

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

// Ping server
/*setInterval(function() {
  emitTime = +new Date;
  socket.emit('ping');
}, 5000);*/

// packet localSequence number
function nextSeq() {
	localSeq++;
	console.log("Sending local packet: "+localSeq);
	return localSeq;
};