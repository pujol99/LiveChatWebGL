console.log( "PID: ", process.pid );

var CORE = require( "./core.js" );

/*****WEB SOCKET SERVER******/
var WebSocketServer = require( 'websocket' ).server;
var http = require( 'http' );

var server = http.createServer( function( request, response ) {
    console.log( request.url );
    var data = CORE.onHTTPRequest( request, response );

    //Do not return anything on the response, the CORE request will handle it
    if ( data === false)
        return;
    if ( data != null )
       response.end( data );
    else
        response.end( "" );

    if( request.url == "/exit" ) { //Kill the server
        process.exit(0);
    }
});

//Create the WebSocket Server
wsServer = new WebSocketServer({
    httpServer: server //If we already have our HTTPServer in server variable...
});

//Add event handler when one user connects
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    
    //A new user is connected to the server
    console.log( "NEW USER!!" );
    //pass the  information to the server ( CORE )
    CORE.onNewClient( connection );

    //Handle all messages from users here
    connection.on( 'message', function(message) {
        if ( message.type === 'utf8' ) {
            CORE.handleMessages( this, message.utf8Data );
        }
    });

    //var that = connection;
    connection.on('close', function() {
        //Close user connection
        console.log( "USER IS GONE" );
        CORE.onClientDisconnected( connection )
    });
});

/******************/

CORE.init();

//Server is listening on the port we specify
var port = 9017;
server.listen( port, function() { 
    console.log( "Server ready! Listening on port " + port ); 
});