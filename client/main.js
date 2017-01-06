/**
 * Created by chester on 04.01.17.
 */
$(document).ready(function () {
    console.log("ggrg");
    var ws;
    var players = {};
    var myplayer={};
    var map={};
    var keys=[];
    keys.fill(0,0,this.length);
    var ctx;
    var dx=0;dy=0;

    function connect () {
        ws=new WebSocket("ws://127.0.0.1:9595");
        ws.onopen=onopen;
        ws.onmessage=onmessage;
        ws.error=null;
        ws.onclose=onclose;
    }

    function onmessage(evt) {
        try{
            var message=JSON.parse(evt.data);
        }catch(error) {
            console.log("error");
            return;
        }
        switch(message['type']){
            case 'field':
                map=message['data']
                console.log(map.l);
                console.log(map.r);
                console.log(map.t);
                console.log(map.b);
                break;
            case 'players':
                players
                players=message['data'];
                myplayer=players[message['my_id']];
                break;

        }
        console.log(message);
    }
    
    function onopen() {

    }
    
    function onclose() {
        connect();
    }



    $("body").on("keydown",function (event) {
       console.log("KEY!"+" "+event.which);
       var key=event.which;
       keys[key]=1;
      /* var dx=0;dy=0;
       switch(key){
           case 87:
               dy=-2;
               ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy}}));
               break;
           case 68:
               dx=2;
               ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy}}));
               break;
           case 83:
               dy=2;
               ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy}}));
               break;
           case 65:
               dx=-2;
               ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy}}));
               break;


       }*/
    });
    
    $("body").on("keyup",function (event) {
        console.log("UP "+event.which);
        var key=event.which;
        keys[key]=0;
    });


    var ctx=document.getElementById("canvas").getContext("2d");
    function draw() {
        if(myplayer!=null){
            var width=$("#canvas").width();
            var height=$("#canvas").height();
            var mypos={
              x:width/2-20,
              y:height/2-20
            };
            ctx.clearRect(0,0,width,height);

            ctx.beginPath();
            ctx.lineWidth=3;
            ctx.rect(0,0,width,height);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=3;
            ctx.rect(mypos.x-myplayer.x,mypos.y-myplayer.y,map.r,map.b);
            ctx.stroke();


            ctx.beginPath();
            ctx.lineWidth=1;
            ctx.rect(mypos.x,mypos.y,40,40);
            ctx.stroke();

            for(var k in players){
                var p =players[k];
                ctx.beginPath();
                ctx.lineWidth=1;
                ctx.rect(mypos.x+(p.x-myplayer.x),mypos.y+(p.y-myplayer.y),40,40);
                ctx.stroke();
            }

            console.log("player "+myplayer.x+" "+myplayer.y);
        }

    }

    function update(){
        dx=0;dy=0;
        if(keys[87]==1) dy=-2;
        if(keys[68]==1) dx=2;
        if(keys[83]==1) dy=2;
        if(keys[65]==1) dx=-2;
        console.log('DXDY '+dx+' '+dy);
        ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy}}));
        console.log(JSON.stringify(players))
        getPlayers();
    };

    connect();


    function getPlayers() {
        ws.send(JSON.stringify({'type':'getPlayers'}));
    }

    setInterval(function () {

        update();
        draw();
    },1000/60);
});