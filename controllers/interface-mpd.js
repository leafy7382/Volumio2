var net = require('net');

// keep track of 'idle' clients (listeners)
var idles = []
// helper class (contains most MPD output/formats)
var helper = require('./interface-mpd-helper');

// MPD info
var mpdPort = 6500;
var mpdAddress = '0.0.0.0';

// Define the InterfaceMPD class
module.exports = InterfaceMPD;
function InterfaceMPD () {
	
	// create server
	var protocolServer = net.createServer(function(client) {
		// set Encoding (TODO check if this is necessary)
		client.setEncoding('utf8');
		
		// MPD welcome command
		client.write("OK MPD 0.19.0\n"); // TODO not hardcoded?
		
		// Incoming message (maybe a command?)
		var buffer = ""; //Buffer since we may not receive whole lines
		var lineIndex = 0;  //Store the index of "\n" (<- end of line sign)
		client.on('data', function(data) {
			// add new incoming data to our buffer
			buffer += data.toString(); 
			// check if we have a complete line
			lineIndex = buffer.indexOf('\n'); 
			
			if(lineIndex == -1) {
				return; // our buffer has received no full line yet
			}
			
			// while we still have a complete line in our buffer (os.EOL == end of line (\r\n))
			while(results = buffer.split(/\r?\n/)) {
				// get 1 line from our buffer to process
				var message = results[0];
				// Handle message elsewhere (keep it clean)
				handleMessage(message, client);
				
				buffer = buffer.substring(lineIndex+1); // Cuts off the processed line
				break;
			}	
		});	
	}).listen(mpdPort, mpdAddress); // start server
	
	// On server error
	protocolServer.on('error', function(err) {
		if (err.code === 'EADDRINUSE') {
			// address is in use
			console.log("Failed to bind MPD protocol to port " + mpdPort +
			": Address in use.");
		} else {
			throw err;
		}
	});
}

// ================================ PUBLIC FUNCTIONS
// Receive console messages from commandRouter and broadcast to all connected clients
InterfaceMPD.prototype.printConsoleMessage = function (message) {

	console.log('InterfaceMPD::printConsoleMessage');
	// Push the message all clients
	//this.libSocketIO.emit('printConsoleMessage', message);

	// Return a resolved empty promise to represent completion
	return libQ();

}

// Receive player queue updates from commandRouter and broadcast to all connected clients
InterfaceMPD.prototype.volumioPushQueue = function (queue, connWebSocket) {

	console.log('InterfaceMPD::volumioPushQueue');
	
	// TODO
}

// Receive player state updates from commandRouter and broadcast to all connected clients
InterfaceMPD.prototype.volumioPushState = function (state, connWebSocket) {

	console.log('InterfaceMPD::volumioPushState');
	
	// TODO

}
// END OF PUBLIC FUNCTIONS

// ================================ INTERNAL FUNCTIONS

// Incoming message handler
function handleMessage(message, client) {
	// some vars to help extract command/parameters from line
	var nSpaceLocation = 0;
	var sCommand = '';
	var sParam = '';
	
	// check if there is a space
	nSpaceLocation = message.indexOf(' ');
	if(nSpaceLocation == -1) {
		// no space, only 1 command
		sCommand = message.substring(/\r?\n/);
	} else {
		// a space, before space command, rest parameter
		sCommand = message.substring(0,nSpaceLocation);
		sParam = message.substring(nSpaceLocation+1, message.length);
	}
	console.log("Incoming command: " + sCommand + "\nParam: "+sParam);
	
	switch(sCommand) {
		case command.ADD :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.COMMANDS :
			socket.write(printCommandList());
			socket.write("OK\n");
			break;
		case command.NOTCOMMANDS :
			socket.write("OK\n");
			break;  
		case command.TAGTYPES :
			socket.write(printTagTypes());
			socket.write("OK\n");
			break;
		case command.OUTPUTS :
			// Hardcoded, but MUST be tied to system later	
			socket.write("outputid: 0\n");
			socket.write("outputname: Default\n");
			socket.write("outputenabled: 1\n");	                 
			socket.write("OK\n");
			break;    
		case command.NOIDLE :
			socket.write("OK\n");
			break;	
		case command.CROSSFADE :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.DELETE :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.NEXT :
			logStart('Client requests Volumio next' )
				.then(commandRouter.volumioNext.bind(commandRouter))
				.catch(console.log)
				.done(logDone);
			socket.write("OK\n");
			break;
		case command.PAUSE :
			logStart('Client requests Volumio pause' )
				.then(commandRouter.volumioPause.bind(commandRouter))
				.catch(console.log)
				.done(logDone);
			socket.write("OK\n");
			break;
		case command.PLAY :
			logStart('Client requests Volumio play' )
				.then(commandRouter.volumioPlay.bind(commandRouter))
				.catch(console.log)
				.done(logDone);
			socket.write("OK\n");
			break;
		case command.PLAYLISTID :
			// Temporary Disabled and HardCoded
			//socket.write(printArray(protocol.getPlaylistId()));
			//socket.write("OK\n");
			socket.write("ACK [50@0] {playlistid} No such song\n");
			break;
		case command.URLHANDLERS:
			socket.write("handler: http://\n");
			socket.write("handler: mms://\n");
			socket.write("handler: mmsh://\n");
			socket.write("handler: mmst://\n");
			socket.write("handler: mmsu://\n");
			socket.write("handler: gopher://\n");
			socket.write("handler: rtp://\n");
			socket.write("handler: rtsp://\n");
			socket.write("handler: rtmp://\n");
			socket.write("handler: rtmpt://\n");
			socket.write("handler: rtmps://\n");
			socket.write("OK\n");
			break;        
		case command.PREVIOUS:
			logStart('Client requests Volumio previous' )
				.then(commandRouter.volumioPrevious.bind(commandRouter))
				.catch(console.log)
				.done(logDone);
			socket.write("OK\n");
			break;
		case command.RANDOM :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.REPEAT :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.SEEK:
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.SETVOL:
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.SHUFFLE :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.SINGLE :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.STATS :
			socket.write(printArray(protocol.getStats()));
			socket.write("OK\n");
			break;
		case command.STATUS :
			socket.write(printArray(protocol.getStatus()));
			socket.write("OK\n");
			break;
		case command.STOP :
			logStart('Client requests Volumio stop' )
				.then(commandRouter.volumioStop.bind(commandRouter))
				.catch(console.log)
				.done(logDone);
			socket.write("OK\n");
			break;
		case command.UPDATE :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		case command.VOLUME :
			sendSingleCommandToCore(sCommand, sParam);
			socket.write("OK\n");
			break;
		default:
			console.log("default");
	}
}

function logDone () {

	console.log('------------------------------');
	return libQ();

}

function logStart (sCommand) {

	console.log('\n---------------------------- ' + sCommand);
	return libQ();

}
// END OF INTERNAL FUNCTIONS