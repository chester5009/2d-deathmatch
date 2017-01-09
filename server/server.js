/**
 * Created by chester on 04.01.17.
 */

var express = require('express');
var app = express();
var path=require("path");

app.use(express.static("/home/chester/programming/phpstormProjects/2d-deathmatch/client"));
app.get('/',function (req, res) {
   res.sendFile('/home/chester/programming/phpstormProjects/2d-deathmatch/client/index.html');
});
var WebSocket = new require('ws');

var SocketServer = new WebSocket.Server({
    port: 9595
});

var clients = {};
var players = {};
var bullets = {};
var field = {};
field.l = 0;
field.r = 1000;
field.t = 0;
field.b = 1000;
var speed=6;
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*var intersects = function(a, b) {
    var s1 = ( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1 ),
        s2 = ( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 ),
        s3 = ( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1 ),
        s4 = ( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 );

    return ((s1 && s2) || (s3 && s4)) || ((s1 && s4) || (s3 && s2));
};*/
function intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top);
}

function addBullet(id, dx, dy) {
    if (bullets[id] == null) {
        bullets[id] = [];
    }
    var newBullet;
    newBullet = {};
    newBullet.x = players[id].x+20;
    newBullet.y = players[id].y+20;
    newBullet.dx = dx/100*speed;
    newBullet.dy = dy/100*speed;
    bullets[id].push(newBullet);
    console.log("FIRE! " + bullets[id].length + " " + newBullet.x + " " + newBullet.y);
}

function removeBullet(i,bullet){
    var index=bullets[bullet].indexOf(bullets[bullet][i]);
    bullets[bullet].splice(index,1);
}


SocketServer.on('connection', function (ws) {

    var id = rand(0, 999999);
    console.log("connected id " + id);


    clients[id] = ws;
    players[id] = {};
    players[id].x = rand(field.l, field.r);
    players[id].y = rand(field.t, field.b);
    players[id].hp=100;
    ws.send(JSON.stringify({'type': 'field', 'data': field}));
    console.log(JSON.stringify({'type': 'field', 'data': field}));
    ws.on('message', function (message) {
        var msg = JSON.parse(message);
        switch (msg['type']) {
            case 'move':
                players[id].x += msg['data'].dx;
                players[id].y += msg['data'].dy;
                players[id].name = msg['data'].name;
                if (players[id].x < 0) players[id].x = 0;
                if (players[id].y < 0) players[id].y = 0;
                if (players[id].x + 40 > field.r) players[id].x = field.r - 40;
                if (players[id].y + 40 > field.b) players[id].y = field.b - 40;
                break;
            case 'getPlayers':
                ws.send(JSON.stringify({
                    'type': 'players',
                    'data': {'players': players, 'bullets': bullets},
                    'my_id': id
                }));
                // console.log(clients.length);
                break;
            case 'fire':
                addBullet(id, msg['data'].dx, msg['data'].dy);

        }

    });

    ws.on('close', function () {
        delete players[id];
        delete clients[id];
        console.log("disconnected");
    });


});



function update() {

    for (var bullet in bullets) {
        var b=bullets[bullet];
        for (var i = 0; i < b.length; i++) {

            bullets[bullet][i].x += bullets[bullet][i].dx;
            bullets[bullet][i].y += bullets[bullet][i].dy;

            if(bullets[bullet][i].x<0 || bullets[bullet][i].x>field.r||
                bullets[bullet][i].y<0 || bullets[bullet][i].y>field.b){
                removeBullet(i,bullet);
                --i;
                break;

            }
            //console.log("KEY: "+bullet);
        }
    }

    //intersect
    for (var bullet in bullets) {
        var a={};
        var b={};
        var b=bullets[bullet];
        for (var i = b.length-1; i >=0; --i) {
            for(var p in players){
                //console.log("intersetc "+bullet+" "+p);
                if(bullet!=p){

                    a.left=players[p].x;
                    a.right=players[p].x+40;
                    a.top=players[p].y;
                    a.bottom=players[p].y+40;

                    b.left=bullets[bullet][i].x;
                    b.right=bullets[bullet][i].x+5;
                    b.top=bullets[bullet][i].y;
                    b.bottom=bullets[bullet][i].y+5;
                    if(intersectRect(a,b)){
                     //removeBullet(i,bullet);
                     bullets[bullet].splice(i,1);
                     players[p].hp-=rand(3,8);
                     break;
                     }
                }
            }
            //console.log("KEY: "+bullet);
        }
    }
    //update players
    for(var p in players){
        console.log("player "+players[p].hp);
        if(players[p].hp<=0){
            console.log("DEAD!");
            players[p].x=rand(field.l, field.r);
            players[p].y=rand(field.t, field.b);
            players[p].hp=100;
        }
    }

}

setInterval(update, 1000 / 60);

app.listen('9090','192.168.1.3');
