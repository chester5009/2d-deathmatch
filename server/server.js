/**
 * Created by chester on 04.01.17.
 */

var express=require('express');
var app=express();
app.use(express.static("./client"));

var WebSocket = new require('ws');

var SocketServer=new WebSocket.Server({
    port:9595
});

var clients={};
var players={};
var bullets={};
var field={};
field.l=0;
field.r=1000;
field.t=0;
field.b=1000;

function rand(min, max){return Math.floor(Math.random() * (max - min + 1)) + min;}

function addBullet(id,dx,dy) {
    if(bullets[id]==null){
        bullets[id]=[];
    }
    var newBullet;
    newBullet={};
    newBullet.x=players[id].x;
    newBullet.y=players[id].y;
    newBullet.dx=dx;
    newBullet.dy=dy;
    bullets[id].push(newBullet);
    console.log("FIRE! "+bullets[id].length+" "+newBullet.x+" "+newBullet.y );
}


SocketServer.on('connection',function (ws) {

   var id=rand(0,999999);
   console.log("connected id "+id);


   clients[id]=ws;
   players[id]={};
   players[id].x=rand(field.l,field.r);
   players[id].y=rand(field.t,field.b);

   ws.send(JSON.stringify({'type':'field','data':field}));
   console.log(JSON.stringify({'type':'field','data':field}));
   ws.on('message',function (message) {
       var msg=JSON.parse(message);
       switch (msg['type']){
           case 'move':
              players[id].x+=msg['data'].dx;
              players[id].y+=msg['data'].dy;
              players[id].name=msg['data'].name;
              if(players[id].x<0)players[id].x=0;
              if(players[id].y<0)players[id].y=0;
              if(players[id].x+40>field.r)players[id].x=field.r-40;
              if(players[id].y+40>field.b)players[id].y=field.b-40;
              break;
           case 'getPlayers':
              ws.send(JSON.stringify({'type':'players','data':{'players':players,'bullets':bullets},'my_id':id}));
             // console.log(clients.length);
              break;
           case 'fire':
               addBullet(id,msg['data'].dx,msg['data'].dy);

       }

   });

   ws.on('close',function () {
      delete players[id];
      delete clients[id];
      console.log("disconnected");
   });


});



app.listen(9090);
