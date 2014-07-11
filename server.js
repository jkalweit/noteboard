var port = process.env.PORT || 1337;

var fs = require('fs');
var http = require('http');
var server = http.createServer(function (req, res) {

    var file = req.url;
    if(file == '/') file = '/index.html';

    fs.readFile('.' + file, function (err, data) {

        if(err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }

        res.writeHead(200);
        res.end(data);
    });

}).listen(port);