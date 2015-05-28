/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down) {
	var up = false,
		left = false,
		right = false,
		down = false,
		A = A || false,
		S = S || false;
		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				if (left == false) {
					left = true;
					localPlayer.setKey("left", true);
					socket.emit("key down", "left");
				};
				break;
			case 38: // Up
				if (up == false) {
					up = true;
					localPlayer.setKey("up", true);
					socket.emit("key down", "up");
				};
				break;
			case 39: // Right
				if (right == false) {
					localPlayer.setKey("right", true);
					right = true; // Will take priority over the left key
					socket.emit("key down", "right");
				};
				break;
			case 40: // Down
				if (down == false) {
					down = true;
					localPlayer.setKey("down", true);
					socket.emit("key down", "down");
				};
				break;
			case 65: // A
				if (that.A != 'blocked') {
					that.A = true;
					socket.emit("key down", "A");
				};
				break;
			case 83: // S
				if (that.S != 'blocked') {
					that.S = true;
					socket.emit("key down", "S");
				};
				break;
		};
	};
	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				left = false;
				localPlayer.setKey("left", false);
				socket.emit("key up", "left");
				break;
			case 38: // Up
				up = false;
				localPlayer.setKey("up", false);
				socket.emit("key up", "up");
				break;
			case 39: // Right
				right = false;
				localPlayer.setKey("right", false);
				socket.emit("key up", "right");
				break;
			case 40: // Down
				down = false;
				localPlayer.setKey("down", false);
				socket.emit("key up", "down");
				break;
			case 65: // A
				that.A = false;
				break;
			case 83: // S
				that.S = false;
				break;
		};
	};

	return {
//		up: up,
//		left: left,
//		right: right,
//		down: down,
		A: A,
		S: S,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};