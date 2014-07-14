var port = process.env.PORT || 1337;

var fs = require('fs');
var http = require('http');
var server = http.createServer(function (req, res) {

    var file = req.url;
    if (file == '/') file = '/index.html';

    fs.readFile('public' + file, function (err, data) {

        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }

        res.writeHead(200);
        res.end(data);
    });

}).listen(port)


function saveDb(room, db) {
    fs.writeFile('./' + room + '.json', JSON.stringify(db), function (err) {
        if (err) {
            console.log(room + ': Error saving db: ' + err);
        } else {
            console.log(room + ' db saved.');
        }
    });
}

function loadDb(room, callback) {
    var path = './' + room + '.json';
    console.log('loading db: ' + path);
    if (fs.existsSync(path)) {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                console.log(room + ': Could not load db: ' + err);
                callback(null);
            }
            console.log('loaded db: ' + path + ': ' + data);
            callback(JSON.parse(data));
        });
    } else {
        console.log('no db: ' + path);
        callback(null);
    }
}


var io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('a user connected');

    //socket.emit('dbupdated', db);

    socket.on('join', function(room) {
        console.log('joining: ' + room);
        socket.join(room);
        var db = loadDb(room, function(db) {
            console.log('sending: ' + JSON.stringify(db));
            socket.emit('dbupdated', room, db);
        });
    });


    socket.on('updatedb', function (room, newdb) {
        console.log(room + ' updatedb! ' + JSON.stringify(newdb));

        saveDb(room, newdb);

        io.to(room).emit('dbupdated', room, newdb);
        //socket.broadcast.emit('dbupdated', db);
    });
});
