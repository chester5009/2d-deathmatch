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
var field={};
field.l=0;
field.r=1000;
field.t=0;
field.b=1000;

function rand(min, max){return Math.floor(Math.random() * (max - min + 1)) + min;}

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
              break;
           case 'getPlayers':
              ws.send(JSON.stringify({'type':'players','data':players,'my_id':id}));
             // console.log(clients.length);
              break;

       }

   });

   ws.on('close',function () {
      console.log("disconnected");
   });


});



app.listen(9090);
