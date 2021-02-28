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
        /*socket.send( JSON.stringify({ 
            type: "ready", id: myid, username: myusername, content: {
                id: myid, username: myusername, sprite: mysprite, roomID: room_id  
            }}
        ));*/
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