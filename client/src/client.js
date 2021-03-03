/****VARIABLES****/
var users_connected = [];

var server_room = "BURGERCHAT";
var port = "9017";
var url = "ecv-etic.upf.edu/node/" + port + "/ws/" + server_room;

var socket = new WebSocket( "wss://" + url );
var mytexture ="man1";
var myid = -1;
var myusername = "Anonymous";

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
        console.log(data);
        if( 'type' in data) {
            if ( data.type == "text") {
                displayMessage(true, data.username, data.content, data.time);
            } else if ( data.type == "roominfo" ) {
                me.room_id = data.content.room.id;
            } else if ( data.type == "newuser" ||  data.type == "existentuser") {
                addToUsers(data.content.id, data.content.username, data.content.mesh, 
                    data.content.texture, data.content.pos );
            } else if ( data.type == "removeuser") {
                removeFromUsers( data.content );
            } else if ( data.type == "updatepos") {
                console.log(data.id.toString() + " has moved");
                //updateUserPos(data.id, data.content.pos);
            } else if ( data.type == "login_petition" ) {
                if ( data.content.success == true ) {
                    console.log("LOGIN SUCCESS, your id: " + data.content.id + " and username: " + data.content.username );
                    closePopUp( data );
                } else {
                    alert("Invalid credentials");
                }
            } else if ( data.type == "signin_petition" ) {
                if ( data.content.success == true ) {
                    console.log( "SIGN IN success, your id: " + data.content.id + " and username: " + data.content.username );
                    closePopUp( data );
                } else {
                    alert("This user already exists!");
                }
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
    //If nothing was written do not do anything
    if ( !message )
        return;
    
    //Get actual time
    var date = new Date();
    var mytime = date.getHours().toString() + ':' + date.getMinutes().toString();

    //Send it to the server
    socket.send( JSON.stringify(
        { type: "text", id: me.id, username: me.username, content: message, time: mytime }
    ) );

    displayMessage( false, "Me", message, mytime);
    document.getElementById( "input-text" ).value = "";
}

//Add a new user to user_connected array
function addToUsers( author_id, _username, _mesh, _texture, _position ) {
    for ( var i = 0; i < users_connected.length; i++ ) {
        if ( users_connected[i].id == author_id ) {
            console.log('user already exists');
            return;
        }
    }
    //TODO username id
    users_connected.push( new User(_mesh, _texture, _position ));
}

function getUserById( id ){
    for( let i = 0; i < users_connected.length; i++ ){
        if ( users_connected[i].id == id )
            return users_connected[i];
    }
}

function updateUserPos(id, _pos){
    for( let i = 0; i < users_connected.length; i++ ){
        if (users_connected[i].id == id) {
            users_connected[i].updatepos(_pos);
            break;
        }
    }
}

function changeRoom(){
    //Send updated info to server
    users_connected = [];
    socket.send( JSON.stringify({ 
        type: "changeroom", id: me.id, username: me.username, content: {
            roomId: me.room_id 
        }}
    ));
}

function removeFromUsers( author_id ) {
    for ( var i = 0; i < users_connected.length; i++ ) {
        if ( users_connected[i].id == author_id ) {
            //Remove user at position i
            users_connected.splice( i, 1 );
            break;
        }
    }
}
