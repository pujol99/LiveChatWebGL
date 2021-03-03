/*****EVENTS*****/
//Capture the keyboard
window.addEventListener( "keydown", onKeyDown );

//Send button
var send = document.querySelector( "#btn-send" );
send.addEventListener( "click", function(){sendMessage(
    document.getElementById( "input-text" ).value
)} );

function onKeyDown(e) {
    //If the pressed key was Enter, send the message
    if ( e.key == "Enter" )
        sendMessage( document.getElementById( "input-text" ).value );
}

function displayMessage(isReceived, from, message, time){
    var chat = document.getElementById("chat");
    
    var div = document.createElement("div");
    div.className = "message";

    if ( isReceived )
        div.className += " received-message";
    
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

function changePopUp( isSignIn ) {
    if ( isSignIn ) {
        document.getElementById("signin").style.display = "none";
        document.getElementById("login").style.display = "";
    } else {
        document.getElementById("signin").style.display = "";
        document.getElementById("login").style.display = "none";
    }
}


//manage PopUp and obtain the username + room
function managePopUp( isSignIn ) {
    var isAllFilled = true;

    if ( isSignIn ) {
        //SIGN IN
        
        //get character selected
        mytexture = document.getElementById("Mycharacters").value;

        //get room name
        room_id = 0; //parseInt(document.getElementById("Myrooms").value);

        //get user name
        var input_user = document.getElementById( "input-user-name-signin" ).value;
        if ( input_user ) {
            myusername = input_user;
            //Reset the value of the input form
            document.getElementById( "input-user-name-signin" ).value = "";
        }

        var usr_email = document.getElementById( "input-email-signin" ).value;
        if ( usr_email ) {
            document.getElementById( "input-email-signin" ).value = "";
        }

        var usr_password = document.getElementById( "input-password-signin" ).value;
        if ( usr_password ) {
            document.getElementById( "input-password-signin" ).value = "";
        }

        if ( input_user == "" || usr_email == "" || usr_password == "" ) {
            isAllFilled = false;
        }

        if ( isAllFilled ) {
            //Send updated info to server
            socket.send( JSON.stringify({ 
                type: "signin", id: 0, username: input_user, content: {
                    id: 0, username: input_user, texture: mytexture, roomID: room_id, password: usr_password, email: usr_email 
                }}
            ));
        } else {
            alert("Fill all the camps!");
        }
        
    } else {
        //LOGIN
        //get user name
        var input_user = document.getElementById( "input-user-name-login" ).value;
        //Reset the value of the input form
        document.getElementById( "input-user-name-login" ).value = "";

        //get password
        var usr_password = document.getElementById( "input-password-login" ).value;
        document.getElementById( "input-password-login" ).value = "";
        
        //send to the server to check if they are correct

        //if not
        if ( input_user == "" || usr_password == "" ) {
            isAllFilled = false;
        }

        if ( isAllFilled ) {
            //Send updated info to server
            socket.send( JSON.stringify({ 
                type: "login", id: 0, username: input_user, content: {
                    password: usr_password  
                }}
            ));
        } else {
            alert("Fill all the camps!");
        }
    }   
}

function closePopUp( data ) {
    var popup = document.getElementById( "pop-up" );
    popup.style.display = "none";

    var vc = document.getElementById( "virtual-chat" );
    vc.style.display = "";

    var div = document.createElement("div");
    div.className = "name";

    var p = document.createElement("p");
    var text = document.createTextNode( data.content.username );

    p.appendChild( text );
    div.appendChild( p );
    vc.appendChild( div );

    /**************/
    myid = data.content.id;
    myusername = data.content.username;

    //Init virtual chat
    init(data);
}
