/**
 * Created by chester on 04.01.17.
 */
$(document).ready(function () {
    var name=prompt("Введите имя ");
    var ws;
    var players = {};
    var myplayer={};
    var bullets={};
    var map={};
    var keys=[];
    keys.fill(0,0,this.length);
    var ctx;
    var dx=0;dy=0;

    function connect () {
        ws=new WebSocket("ws://192.168.1.3:9595");
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
                players=message['data'].players;
                myplayer=players[message['my_id']];
                bullets=message['data'].bullets;
                //console.log("BULLETS: "+JSON.stringify(bullets));
                break;

        }
        //console.log(message);
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

    $("#canvas").on("click",function (e) {
        var width=$("#canvas").width();
        var height=$("#canvas").height();
        var mypos={
            x:width/2-20,
            y:height/2-20
        };
        //alert("МЫШ!!!! " +e.pageX+" "+$("#canvas").position().left+" "+$("#canvas").position().top);
        var mouseX=e.pageX-$("#canvas").position().left;
        var mouseY=e.pageY-$("#canvas").position().top;

        var dx=mouseX-mypos.x;
        var dy=mouseY-mypos.y;
        console.log("DX DY "+mouseX+" "+mouseY);
        ws.send(JSON.stringify({'type':'fire','data':{'dx':dx,'dy':dy}}));
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
                ctx.lineWidth=2;
                ctx.rect(mypos.x+(p.x-myplayer.x),mypos.y+(p.y-myplayer.y),40,40);
                ctx.stroke();

                if(p.hp<101)ctx.fillStyle="green";
                if(p.hp<75)ctx.fillStyle="#DEEB4C";
                if(p.hp<50)ctx.fillStyle="#EB8C4C";
                if(p.hp<25)ctx.fillStyle="#C50D0D";

                ctx.fillRect(mypos.x+(p.x-myplayer.x),mypos.y+(p.y-myplayer.y)+45,p.hp*40/100,5);

                ctx.beginPath();
                ctx.lineWidth=1;
                ctx.strokeStyle="#000000";
                ctx.rect(mypos.x+(p.x-myplayer.x),mypos.y+(p.y-myplayer.y)+45,40,5);
                ctx.stroke()

                ctx.fillStyle="#323F49";
                ctx.font="20px Georgia";
                ctx.fillText(p.name,mypos.x+(p.x-myplayer.x)-10,mypos.y+(p.y-myplayer.y)-10);
            }
            //console.log("BULLETS "+ JSON.stringify(bullets));

            for(var k in bullets){
                //console.log(bullets[k]);
                var b=bullets[k];

                for(var i=0;i<b.length;i++){
                    ctx.beginPath();
                    ctx.lineWidth=2;
                    ctx.rect(mypos.x+(b[i].x-myplayer.x),mypos.y+(b[i].y-myplayer.y),5,5);
                    ctx.stroke();
                }




                /*for(var i in k){
                    console.log("BULS "+bullets[i][0].x);
                    ctx.beginPath();
                    ctx.lineWidth=2;
                    ctx.rect(mypos.x+(i.x-myplayer.x),mypos.y+(i.y-myplayer.y),5,5);
                    ctx.stroke();
                }*/
            }
            //console.log("player "+myplayer.x+" "+myplayer.y);

        }

    }

    function update(){
        dx=0;dy=0;
        if(keys[87]==1) dy=-2;
        if(keys[68]==1) dx=2;
        if(keys[83]==1) dy=2;
        if(keys[65]==1) dx=-2;
        //console.log('DXDY '+dx+' '+dy);
        ws.send(JSON.stringify({'type':'move','data':{'dx':dx,'dy':dy,'name':name}}));
        //console.log(JSON.stringify(players))
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