var SocketServer = require('ws').Server;
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config');
var app = express();
var compiler = webpack(config);

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
});
app.use(devMiddleware);

app.use(express.static(__dirname));

var server = app.listen(9090);
const wss = new SocketServer({server});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    });
});

module.exports = server;


