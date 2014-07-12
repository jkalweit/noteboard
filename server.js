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

}).listen(port)


var db;

function saveDb() {
    fs.writeFile("./db.json", JSON.stringify(db), function(err) {
        if(err) {
            console.log('Error saving db: ' + err);
        } else {
            console.log('Db saved.');
        }
    });
}


function loadDb() {
    if(fs.existsSync('./db.json')){
        fs.readFile('./db.json', 'utf8', function (err, data) {
            if (err) {
                console.log('Could not load db: ' + err);
            }

            db = JSON.parse(data);
        });
    }

    if(!db) {
        db = {
        };
    }
}


loadDb();



var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('a user connected');

    io.emit('dbupdated', db);

    socket.on('updatedb', function(newdb) {
        console.log('updatedb! ' + JSON.stringify(newdb));

        db = newdb;
        saveDb();
        io.emit('dbupdated', db);
    });
});
