var util = require("util"),
	io = require("socket.io").listen(8000),
	Player = require("./Player").Player,
	players,
	arrows,
	bombs,
	bombPlayersHit;
	
function init() {
	players = [];
	arrows = [];
	bombs = [];
	bombPlayersHit = [];
	
//	socket = io.listen(8000);
	
	then = Date.now(); // Set first time for animation deltatime loop
	
	logic();
	
	setEventHandlers();
};

var setEventHandlers = function() {
	io.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);
	
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("key down", onKeyDown);
	client.on("key up", onKeyUp);
	client.on("player killed", onPlayerKilled);
	client.on('ping', function(client) {
	  this.emit('pong');
	});
	
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);
	
	var removePlayer = playerById(this.id);
	
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};
	
	this.broadcast.emit("remove player", {id: removePlayer.getId()}); // Sends message to all the other players that a player has disconnected and to remove the player
	players.splice(players.indexOf(removePlayer), 1); // Removes player from players array
};

function onNewPlayer(data) {
	var newPlayer = new Player(data.seq, data.x, data.y, data.health);
	newPlayer.setId(this.id);
	
	//send player id to the new player
	this.emit("set player id", { seq: newPlayer.getLocalSeq(), id: newPlayer.getId() });
	
	//send new player to other players
	this.broadcast.emit("new player", {id: newPlayer.getId(), x: newPlayer.getX(), y: newPlayer.getY(), health: newPlayer.getHealth()});
	
	//send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.getId(), x: existingPlayer.getX(), y: existingPlayer.getY(), health: existingPlayer.getHealth()});
	};
	
	players.push(newPlayer);
};

function onKeyDown(data) {	
	var player = playerById(this.id);

	if (!player) {
		util.log("Player not found: "+this.id);
		return;
	};
	
	if (data.seq < player.getRemoteSeq()) {
		util.log("Old remote packet discarded: "+data.seq);
		return;
	};
	
	util.log("New remote packet received: "+data.seq);
		
	player.setRemoteSeq(data.seq);
	
	if (player.getHealth() <= 0) { return; };
	
	if (data.key == 'bow') { // shoot arrow if bowshot
		
		if (player.getDirection() == 'left') { arrowX = data.x - 8; arrowY = data.y + 10 }
		else if (player.getDirection() == 'right') { arrowX = data.x + 10; arrowY = data.y + 10 };
		
		setTimeout(function() {arrows.push({ direction: player.getDirection(), shooter: player.getId(), speed: 800, x: arrowX, y: arrowY })}, 300);
	} else if (data.key == 'pickup') {
		// if holding bomb: throw it
		if (player.getHolding()) {
			var bomb = bombById(player.getHolding());
			bomb.x = player.getX() - 24;
			bomb.y = player.getY() + 6;
			bomb.held = false;
			player.setHolding(false);
		} else { // if bomb within reach: pick it up
			var x = player.getX();
			var y = player.getY();
			var i;
			var bombId = false;
			for (i = 0; i < bombs.length; i++) {
				if ((x - (bombs[i].x + 24)) <= 12 && (x - (bombs[i].x + 24)) >= 0 && y < (bombs[i].y + 28) && y > (bombs[i].y - 24)) {
					player.setHolding(bombs[i].id);
					bombs[i].held = true;
					bombs[i].lastHeldBy = player.getId();
					bombId = bombs[i].id;
					break;
				};
			};
			if (player.getHolding()) {
				io.sockets.emit("set hold", { id: player.getId(), bombId: bombId } );
			};
		};
	} else if (data.key == 'bomb') {
		var bombId = newBombId();
		io.sockets.emit("set hold", { id: player.getId(), bombId: bombId } );
		bombs.push( { id: bombId, explosionStep: 0, x: player.getX() - 24, y: player.getY() + 4, width: 24, height: 28, held: true, lastHeldBy: player.getId(), timer: 0, boom: false, playersHit: [] } );
		player.setHolding(bombId);
	};
	
	player.setX(data.x);
	player.setY(data.y);
	player.setKey(data.key, true);
	
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getId() !== this.id) {
			var seq = players[i].getLocalSeq() + 1;
			players[i].setLocalSeq(seq);
			io.sockets.socket(players[i].getId()).emit("key down", { seq: seq ,id: player.getId(), key: data.key, x: player.getX(), y: player.getY()});
		};
	};
//	this.broadcast.emit("key down", {id: player.getId(), key: data.key, x: player.getX(), y: player.getY()});
};

function onKeyUp(data) {
	var player = playerById(this.id);
	
	if (!player) {
		util.log("Player not found: "+this.id);
		return;
	};
	
	if (data.seq < player.getRemoteSeq()) {
		util.log("Old remote packet discarded: "+data.seq);
		return;
	};
	
	util.log("New remote packet received: "+data.seq);
		
	player.setRemoteSeq(data.seq);
	
	if (player.getHealth() <= 0) { return; };
	
	player.setKey(data.key, false);
	
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getId() !== this.id) {
			var seq = players[i].getLocalSeq() + 1;
			players[i].setLocalSeq(seq);
			io.sockets.socket(players[i].getId()).emit("key up", { seq: seq ,id: player.getId(), key: data.key});
		};
	};
//	this.broadcast.emit("key up", {id: player.getId(), key: data.key});
};

function onPlayerKilled(data) {
	var playerKilled = playerById(this.id);
	
	if (!playerKilled) {
		util.log("Player not found: "+this.id);
		return;
	};
	
	playerKilled.setHealth(0);
	
	this.broadcast.emit("player killed", {id: playerKilled.id, killer: data.killer, weapon: data.weapon });
};

/**************************************************
** GAME LOGIC UPDATE
**************************************************/
function logic() {
	// define time passed since last logic iteration (in seconds)
	now = Date.now();
	deltatime = (now - then) / 1000;
	
	// Update players & items they're holding
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getHealth() > 0) {
			players[i].update(deltatime, players, arrows, bombs, io);
		};
	};
	
	// Update arrows
	var i;
	for (i = 0; i < arrows.length; i++) {
		// remove arrow when out of bounds
		if (arrows[i].x > 800 || arrows[i].x + 30 < 0 || arrows[i].y > 600 || arrows[i].y + 10 < 0) {
			arrows.splice(i,1);
			continue;
		};
		// update location
		if (arrows[i].direction == 'left') { arrows[i].x -= arrows[i].speed * deltatime; }
		else if (arrows[i].direction == 'up') { arrows[i].y -= arrows[i].speed * deltatime; }
		else if (arrows[i].direction == 'right') { arrows[i].x += arrows[i].speed * deltatime; }
		else if (arrows[i].direction == 'down') { arrows[i].y += arrows[i].speed * deltatime; };
	};
	
	// Update bombs
	var i;
	for (i = 0; i < bombs.length; i++) {
		bombs[i].timer += deltatime;
		// explosion hit detection
		if (bombs[i].boom) {
			if (bombs[i].held) {
				bombs[i].held = false;
				var player = playerById(bombs[i].lastHeldBy);
				bombs[i].x = player.getX() + 2;
				bombs[i].y = player.getY();
			};
			var j;
			for (j = 0; j < players.length; j++) {
				if (players[i].getHealth() > 0 &&
				bombs[i].playersHit.indexOf(players[j].getId()) == -1 &&
				collide(players[j].getX(),players[j].getY(),32,32,bombs[i].x,bombs[i].y,bombs[i].width,bombs[i].height)) {
					var newHealth = players[j].getHealth() - 5;
					players[j].setHealth(newHealth);
					io.sockets.emit("hit", { hitter: bombs[i].lastHeldBy, hittee: players[j].getId(), health: newHealth, arrow: false });
					bombs[i].playersHit.push(players[j].getId()); // keep track of players hit to prevent multiple registered hits from one explosion
				};
			};
			if (bombs[i].timer >= 0.05) {
				bombs[i].timer = 0;
				switch (bombs[i].explosionStep) {
				default:
					bombs[i].explosionStep = 1;
					bombs[i].x -= 2;
					bombs[i].y -= 2;
					bombs[i].width = 28;
					bombs[i].height = 32;
					break;
				case 1:
					bombs[i].explosionStep = 2;
					bombs[i].x -= 17;
					bombs[i].y -= 15;
					bombs[i].width = 62;
					bombs[i].height = 62;
					break;
				case 2:
					bombs[i].explosionStep = 3;
					bombs[i].width = 62;
					bombs[i].height = 62;
					break;
				case 3:
					bombs[i].explosionStep = 4;
					bombs[i].x += 15;
					bombs[i].y += 15;
					bombs[i].width = 32;
					bombs[i].height = 32;
					break;
				case 4:
					bombs[i].explosionStep = 5;
					bombs[i].x -= 9;
					bombs[i].y -= 9;
					bombs[i].width = 50;
					bombs[i].height = 50;
					break;
				case 5:
					bombs[i].explosionStep = 6;
					bombs[i].x -= 2;
					bombs[i].y -= 6;
					bombs[i].width = 54;
					bombs[i].height = 62;
					break;
				case 6:
					bombs[i].explosionStep = 7;
					bombs[i].y += 2;
					bombs[i].width = 54;
					bombs[i].height = 58;
					break;
				case 7:
					bombs[i].explosionStep = 8;
					bombs[i].x -= 2;
					bombs[i].width = 54;
					bombs[i].height = 60;
					break;
				case 8:
					bombs.splice(bombs.indexOf(bombs[i]),1);
					break;
				};
			};
		} else if (bombs[i].timer > 3) {
			bombs[i].boom = true;
			bombs[i].timer = 0.1;
		} else if (bombs[i].held) {
			var player = playerById(bombs[i].lastHeldBy);
			bombs[i].x = player.getX() + 4;
			bombs[i].y = player.getY() - 24;
		};
	};
	
	then = now; // define time at which last frame was drawn for deltatime calculation
	setTimeout(logic, 1000 / 60);
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
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

init();

// packet sequence number
function nextSeq(seq) {
	seq++;
	return seq;
};