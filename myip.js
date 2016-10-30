// ==UserScript==
// @name        Orad 
// @namespace    Orad
// @version      1.0
// @description  its da best
// @author       Orad
// @match        *://rsagartoolz.tk/mgar/*
// @match        *://74.208.147.137:8002/mgar/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

setTimeout(function() {
    var real_minx = -7071;
    var real_miny = -7071;
    var real_maxx = 7071;
    var real_maxy = 7071;
    var lastsent = {
        minx: 0,
        miny: 0,
        maxx: 0,
        maxy: 0
    };

    function valcompare(Y, Z) {
        return 0.01 > Y - Z && -0.01 < Y - Z
    }
    window.v72.hooks.dimensionsUpdated = function(server_minx, server_miny, server_maxx, server_maxy) {
        if (valcompare(server_maxx - server_minx, server_maxy - server_miny)) {
            real_minx = server_minx;
            real_miny = server_miny;
            real_maxx = server_maxx;
            real_maxy = server_maxy
        } else {
            if (valcompare(server_minx, lastsent.minx)) {
                if (0.01 < server_maxx - lastsent.maxx || -0.01 > server_maxx - lastsent.maxx) {
                    real_minx = server_minx;
                    real_maxx = server_minx + 14142.135623730952
                }
            }
            if (0.01 < server_minx - lastsent.minx || -0.01 > server_minx - lastsent.minx) {
                if (valcompare(server_maxx, lastsent.maxx)) {
                    real_maxx = server_maxx;
                    real_minx = server_maxx - 14142.135623730952
                }
            }
            if (0.01 < server_miny - lastsent.miny || -0.01 > server_miny - lastsent.miny) {
                if (valcompare(server_maxy, lastsent.maxy)) {
                    real_maxy = server_maxy;
                    real_miny = server_maxy - 14142.135623730952
                }
            }
            if (valcompare(server_miny, lastsent.miny)) {
                if (0.01 < server_maxy - lastsent.maxy || -0.01 > server_maxy - lastsent.maxy) {
                    real_miny = server_miny;
                    real_maxy = server_miny + 14142.135623730952
                }
            }
            if (server_minx < real_minx) {
                real_minx = server_minx;
                real_maxx = server_minx + 14142.135623730952
            }
            if (server_maxx > real_maxx) {
                real_maxx = server_maxx;
                real_minx = server_maxx - 14142.135623730952
            }
            if (server_miny < real_miny) {
                real_miny = server_miny;
                real_maxy = server_miny + 14142.135623730952
            }
            if (server_maxy > real_maxy) {
                real_maxy = server_maxy;
                real_miny = server_maxy - 14142.135623730952
            }
            lastsent.minx = server_minx;
            lastsent.miny = server_miny;
            lastsent.maxy = server_maxy;
            lastsent.maxx = server_maxx
        }
        offset_x = real_minx || -7071;
        offset_y = real_miny || -7071
    };
    var socket = io.connect('ws://127.0.0.1:8081');
    var canMove = true;
    var movetoMouse = true;
    var moveEvent = new Array(2);
    var canvas = document.getElementById("canvas");
    last_transmited_game_server = null;
    socket.on('force-login', function(data) {
        socket.emit("login", {
            "uuid": client_uuid,
            "type": "client"
        });
        transmit_game_server()
    });
   
    $( "#canvas" ).after( "<div style='background-color: #000000; -moz-opacity: 0.4; -khtml-opacity: 0.4; opacity: 0.4; filter: alpha(opacity=40); zoom: 1; width: 205px; top: 10px; left: 10px; display: block; position: absolute; text-align: center; font-size: 15px; color: #ffffff; padding: 5px; font-family: Ubuntu;'> <div style='color:#ffffff; display: inline; -moz-opacity:1; -khtml-opacity: 1; opacity:1; filter:alpha(opacity=100); padding: 10px;'><a>FreeAgarBots.tk</a></div> <div style='color:#ffffff; display: inline; -moz-opacity:1; -khtml-opacity: 1; opacity:1; filter:alpha(opacity=100); padding: 10px;'><br>Minions: <a id='minionCount' >Offline</a> </div> <div style='color:#ffffff; display: inline; -moz-opacity:1; -khtml-opacity: 1; opacity:1; filter:alpha(opacity=100); padding: 10px;'><br>Move To Mouse: <a id='ismoveToMouse' >On</a> </div> <div style='color:#ffffff; display: inline; -moz-opacity:1; -khtml-opacity: 1; opacity:1; filter:alpha(opacity=100); padding: 10px;'><br>Stop Movement: <a id='isStopMove' >Off</a> </div>" );
   socket.on('spawn-count', function(data) {
        document.getElementById('minionCount').innerHTML = data
    });
    var client_uuid = localStorage.getItem('client_uuid');
    if (client_uuid == null) {
        console.log("generating a uuid for this user");
        client_uuid = ""; var ranStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var ii = 0; ii < 15; ii++) client_uuid += ranStr.charAt(Math.floor(Math.random() * ranStr.length));
        localStorage.setItem('client_uuid', client_uuid)
    }
    socket.emit("login", client_uuid);
    $("#instructions").replaceWith('<br><div class="input-group"><span class="input-group-addon" id="basic-addon1">UUID</span><input type="text" value="' + client_uuid + '" readonly class="form-control"</div>');

    function isMe(cell) {
        for (var i = 0; i < window.v72.myCells.length; i++) {
            if (window.v72.myCells[i] == cell.id) {
                return true
            }
        }
        return false
    }

    function getCell() {
        var me = [];
        for (var key in window.v72.allCells) {
            var cell = window.v72.allCells[key];
            if (isMe(cell)) {
                me.push(cell)
            }
        }
        return me[0]
    }
    var skin_var = 0;

    function emitPosition() {
        for (i = 0; i < window.v72.myCells.length; i++) {}
        x = (mouseX - window.innerWidth / 2) / window.v72.drawScale + window.v72.rawViewport.x;
        y = (mouseY - window.innerHeight / 2) / window.v72.drawScale + window.v72.rawViewport.y;
        if (!movetoMouse) {
            x = getCell().x;
            y = getCell().y
        }
        socket.emit("pos", {
            "x": x - (real_minx + 7071),
            "y": y - (real_miny + 7071),
            "dimensions": [-7071, -7071, 7071, 7071]
        })
    }
    

    function emitSplit() {
        socket.emit("cmd", {
            "name": "split"
        })
    }

    function emitMassEject() {
        socket.emit("cmd", {
            "name": "eject"
        })
    }

    function toggleMovement() {
        canMove = !canMove;
        switch (canMove) {
            case true:
                canvas.onmousemove = moveEvent[0];
                moveEvent[0] = null;
                canvas.onmousedown = moveEvent[1];
                moveEvent[1] = null;
                break;
            case false:
                canvas.onmousemove({
                    clientX: innerWidth / 2,
                    clientY: innerHeight / 2
                });
                moveEvent[0] = canvas.onmousemove;
                canvas.onmousemove = null;
                moveEvent[1] = canvas.onmousedown;
                canvas.onmousedown = null;
                break
        }
    }
    interval_id = setInterval(function() {
        emitPosition()
    }, 100);
    interval_id2 = setInterval(function() {
        transmit_game_server_if_changed()
    }, 5000);
    document.addEventListener('keydown', function(e) {
        var key = e.keyCode || e.which;
        switch (key) {
            case 65:
                movetoMouse = !movetoMouse;
                if(movetoMouse) { document.getElementById('ismoveToMouse').innerHTML = "On"; } else { document.getElementById('ismoveToMouse').innerHTML = "Off"; }
                break;
            case 68:
                toggleMovement();
                if(!canMove) { document.getElementById('isStopMove').innerHTML = "On"; } else { document.getElementById('isStopMove').innerHTML = "Off"; }
                break;
            case 69:
                emitSplit();
                break;
            case 82:
                emitMassEject();
                break
        }
    });

    function transmit_game_server_if_changed() {
        if (last_transmited_game_server != window.v72.ws) {
            transmit_game_server()
        }
    }

    function transmit_game_server() {
        last_transmited_game_server = window.v72.ws;
        socket.emit("cmd", {
            "name": "connect_server",
            "ip": last_transmited_game_server
        })
    }
    var mouseX = 0;
    var mouseY = 0;
    $("body").mousemove(function(event) {
        mouseX = event.clientX;
        mouseY = event.clientY
    });
}, 5000);