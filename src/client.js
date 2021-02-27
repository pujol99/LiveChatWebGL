/****VARIABLES****/
var users_connected = [];   // {id, username, sprite, pos} 

var server_room = "BURGERCHAT";
var port = "9017";
var url = "ecv-etic.upf.edu/node/" + port + "/ws/" + server_room;

var myusername = "Anonymous";
var myid = 0;
var mypos = [100, 500];
var mysprite = "man1";
var neardistance = 100;
var room_id = 0;

var socket = new WebSocket( "wss://" + url );


/*****EVENTS*****/
//Capture the keyboard
window.addEventListener( "keydown", onKeyDown );

//Send button
var send = document.querySelector( "#btn-send" );
send.addEventListener( "click", function(){sendMessage(
    document.getElementById( "input-text" ).value
)} );

//Change Screen to login or sign in
/* //SE HACE EN EL HTML SINO DA PROBLEMAS
var changeSignin = document.getElementById( "btn-change-signin" );
changeSignin.addEventListener( "click", changePopUp( true ) );

var changeLogin = document.getElementById( "btn-change-login" );
changeLogin.addEventListener( "click", changePopUp( false ) );

//Close pop up button
var closeSignin = document.querySelector( "#btn-close-signin" );
closeSignin.addEventListener( "click", closePopUp( true ) );

var closeLogin = document.querySelector( "#btn-close-login" );
closelogin.addEventListener( "click", closePopUp( false ) );
*/


/*****SOCKET FUNCTIONS*****/
socket.onopen = function(){  
	console.log("Hello, Socket has been opened :)" );
}

socket.addEventListener("close", function(e) {
	console.log("Socket has been closed: ", e); 
});

socket.onmessage = function(msg){
    try {
        var data = JSON.parse( msg.data );
        if( 'type' in data) {
            if ( data.type == "text" || data.type == "near" ) {
                displayMessage(true, 'username' in data ? data.username : '', data.content, 'time' in data ? data.time : '');
                var _user = getUserById(data.id);
                //console.log( _user );
                floatingMessages.push( 
                    new floatingMessage( _user.pos.x, _user.pos.y - 80, data.content, 25, 15, 0.2 )
                );
            } else if ( data.type == "welcome" ) {
                myid = data.content.id;
                mypos = data.content.pos;
            } else if ( data.type == "roominfo" ) {
                isLightOn = data.content.room.light;
                neardistance = data.content.room.distance;
                room_id = data.content.room.id;
                if ( user != undefined ) { user.updateNearDistance( neardistance ); }
            } else if ( data.type == "newuser") {
                //console.log( "User " + data.content.id + " has joined the chat" );
                addToUsers( data.content.id, data.content.username, data.content.sprite, data.content.pos );
            } else if ( data.type == "existentuser") {
                //console.log( "User " + data.content.id + " was here before you arrived" );
                addToUsers( data.content.id, data.content.username, data.content.sprite, data.content.pos );
            } else if ( data.type == "removeuser") {
                //console.log( "User " + data.content + " has left the chat" );
                removeFromUsers( data.content );
            } else if ( data.type == "updateinfo") {
                //console.log( "User " + data.content.username + " has updated his info" + data.content.username );
                updateUser(data.content.id, data.content.username, data.content.sprite);
            } else if ( data.type == "updatepos") {
                //console.log( "User " + data.id + " has updated his pos" + data.content.pos );
                updateUserPos(data.id, data.content.pos);
            } else if ( data.type == "updatelight" ) {
                isLightOn = data.content.room.light;
                var light_msg = isLightOn ? "ON" : "OFF";
                var screen_msg = data.content.author_name + " has turned " + light_msg + " the light";
                floatingMessages.push( 
                    new floatingMessage( 450, 150, screen_msg, 25, 15, 0.2 )
                );
            }
        }
    } catch ( e ) {
        console.error("ERROR: " + e);
        console.error("MSG: " + msg.data);
    }
}

socket.onerror = function(err){  
	console.log("Error: ", err );
}


/*****FUNCTIONS*****/
//Send what the user has typed
function sendMessage( message ) {
    var type = user.near ? "near" : "text";
    //If nothing was written do not do anything
    if ( !message )
        return;
    
    //Get actual time
    var date = new Date();
    var mytime = date.getHours().toString() + ':' + date.getMinutes().toString();

    //Process the message
    var myjson = { type: type, id: myid, username: myusername, content: message, time: mytime };
    //Send it to the server
    socket.send( JSON.stringify(myjson) );

    if( type == "text" || type == "near" ){
        displayMessage( false, "Me", message, mytime);

        //Show message on screen
        floatingMessages.push( 
            new floatingMessage( user.pos.x, user.pos.y - 80, message, 25, 15, 0.2 )
        );
        document.getElementById( "input-text" ).value = "";
    }
}

function onKeyDown(e) {
    //Get the key
    let key = e.key;

    //If the pressed key was Enter, send the message
    if ( key == "Enter" ) {
        sendMessage( document.getElementById( "input-text" ).value );
    }
}

function displayMessage(isReceived, from, message, time){
    var chat = document.getElementById("chat");
    
    var div = document.createElement("div");
    div.className = "message";

    if ( isReceived ) {
        div.className = "message received-message";
    }
    
    //User name
    var span_from = document.createElement("span");
    span_from.className = "user";
    var usr;
    if ( from == '' ) { //Prevent empty usernames
        from = "Anonymous";
    }
    usr = document.createTextNode( from );
    
    //Time
    var span_time = document.createElement("span");
    span_time.className = "time";
    var msg_time = '';
    try {
        msg_time = document.createTextNode( time );
    } catch(e) {
        var date = new Date();
        msg_time = document.createTextNode( date.getHours() + ':' + date.getMinutes() );
    }

    //Message
    var pmessage = document.createElement("p");
    var text = document.createTextNode( message );
    
    //Appends
    span_from.appendChild( usr );
    span_time.appendChild( msg_time );
    pmessage.appendChild( text );
    
    div.appendChild(span_from);
    div.appendChild(span_time);
    div.appendChild(pmessage);
    
    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
}

//Add a new user to user_connected array
function addToUsers( author_id, _username, _sprite, position ) {
    for ( var i = 0; i < users_connected.length; i++ ) {
        if ( users_connected[i].id == author_id ) {
            return;
        }
    }
    users_connected.push( { id: author_id, username: _username, sprite: _sprite, pos: { x: position[0] , y: position[1] } } );
    others.push(new User("assets/" + _sprite + "-spritesheet.png", author_id, _username, position ));
}

function getUserById( id ){
    for( let i = 0; i < users_connected.length; i++ ){
        if ( users_connected[i].id == id )
            return users_connected[i];
    }
}

function updateUser( id, _username, _sprite ){
    for( let i = 0; i < users_connected.length; i++ ){
        if (users_connected[i].id == id) {
            users_connected[i].username = _username;
            users_connected[i].sprite = _sprite;
            break;
        }
    }

    for( let i = 0; i < others.length; i++ ){
        if ( others[i].id == id ) {
            others[i].username = _username;
            others[i].sprite_path = "assets/" + _sprite + "-spritesheet.png";
            break;
        }
    }
}

function updateUserPos(id, _pos){
    for( let i = 0; i < users_connected.length; i++ ){
        if (users_connected[i].id == id) {
            users_connected[i].pos = _pos;
            break;
        }
    }

    for( let i = 0; i < others.length; i++ ){
        if ( others[i].id == id ) {
            others[i].mousedown(_pos.x, _pos.y);
            break;
        }
    }
}

function changeRoom(roomId){
    //Send updated info to server
    others = [];
    users_connected = [];
    socket.send( JSON.stringify({ 
        type: "changeroom", id: myid, username: myusername, content: {
            roomId: roomId  
        }}
    ));
}

function removeFromUsers( author_id ) {
    for ( var i = 0; i < users_connected.length; i++ ) {
        if ( users_connected[i].id == author_id ) {
            //Remove user at position i
            users_connected.splice( i, 1 );
            //o if we keep track if it is online
            //users_connected[i].online = false
            break;
        }
    }
    for( let i = 0; i < others.length; i++ ){
        if ( others[i].id == author_id ) {
            others.splice( i, 1 );
            return;
        }
    }
}

function changePopUp( isSignIn ) {
    if ( isSignIn ) {
        document.getElementById("signin").style.display = "none";
        document.getElementById("login").style.display = "";
    } else {
        document.getElementById("signin").style.display = "";
        document.getElementById("login").style.display = "none";
    }
}

//Close PopUp and obtain the username + room
function closePopUp( isSignIn ) {
    var validCredentials = true;

    if ( isSignIn ) {
        //SIGN IN
        
        //get character selected
        mysprite = document.getElementById("Mycharacters").value;

        //get room name
        room_id = 0; //parseInt(document.getElementById("Myrooms").value);

        //get user name
        var input_user = document.getElementById( "input-user-name-signin" ).value;
        if ( input_user ) {
            myusername = input_user;
            //Reset the value of the input form
            document.getElementById( "input-user-name-signin" ).value = "";
        }

        //Send updated info to server
        socket.send( JSON.stringify({ 
            type: "ready", id: myid, username: myusername, content: {
                id: myid, username: myusername, sprite: mysprite, roomID: room_id  
            }}
        ));
    } else {
        //LOGIN
        //get user name
        var name = document.getElementById( "input-user-name-login" ).value;
        //Reset the value of the input form
        document.getElementById( "input-user-name-login" ).value = "";

        //get password
        var password = document.getElementById( "input-password-login" ).value;
        document.getElementById( "input-password-login" ).value = "";
        
        //send to the server to check if they are correct

        //if not
        validCredentials = false;
        alert("Invalid credentials");
    }

    //init main virtual chat
    if( validCredentials ) {
        //Close pop Up
        let popup = document.getElementById( "pop-up" );
        popup.style.display = "none";
        document.getElementById("body").style.display = "flex";
    }
    
}