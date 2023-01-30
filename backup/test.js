var http = require('http');

var server = http.createServer();

var host = '192.168.1.27';
var port = 3000;
server.listen(port, function() {
	console.log('starting the web server. : %d', port);

});

server.on('connection', function(socket) {
	var addr = socket.address();
	console.log('Client log in the server. : %s, #d', addr.address, addr.port);
});

server.on('request', function(req, res) {
	console.log('Client request to the server.');
	console.dir(req);
});

server.on('close', function() {
	console.log('Server is closed.');
});

