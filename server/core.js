var DB = require( "./db.js" );

var CORE = {
    clients: [], //{connection}
    num_clients: 0,
    idCounter: 0,

    init: function() {
        console.log( "Launching CORE . . ." );
        DB.init();
    },

    onNewClient: function( connection ) {
        //this.clients.push(connection);
    },

    createClient: function ( connection, data ) {
        this.idCounter = DB.users.length;
        // TODO pq hi ha un id counter i num_clients
        // si son lo mateix
        this.clients[ this.idCounter ] = connection;
        //store the user id on the connection
        connection.user_id = this.idCounter;
        this.num_clients++;

        var position = [Math.floor( Math.random() * 20 ), 
                0, Math.floor( Math.random() * 20 )];

        return position;
    },

    onClientDisconnected: function( connection ) {
        delete this.clients[ connection.user_id ];
        this.num_clients--;
    },

    handleMessages: function( connection, message ) {
        try {
            var data = JSON.parse( message );
            if( 'type' in data) {
                if ( data.type == "signin" ) {
                    var that = this;
                    DB.userExists( data.username, function( exists ){
                        if ( !exists ) {
                            var position = that.createClient( connection, data );
                            var user_id = connection.user_id;
        
                            //store on redis data base
                            DB.createUser(
                                data.username,  
                                {id: user_id , email: data.content.email , password: data.content.password} ,  
                                {id: user_id, texture: data.content.texture , pos: position , 
                                    room_id: data.content.roomID , online: true }
                            );
                            connection.sendUTF( JSON.stringify({ 
                                type: "signin_petition", username: "server", content: { 
                                    success: true, id: user_id, username: data.username, pos: position, texture: data.content.texture
                                }, time: '' }
                            ) );
                        } else {
                            connection.sendUTF( JSON.stringify({ 
                                type: "signin_petition", username: "server", content: { 
                                    success: false
                                }, time: '' }
                            ) );
                        }
                    });

                } else if ( data.type == "login" ) {
                    var content = data.content;
                    var username = data.username;

                    DB.login( username, content.password, function( token, usr_id ) {
                        if( token ) {
                            console.log( "LOGIN petition: " + username + " RESULT: logged successfully" );
                            connection.user_id = usr_id;
                            DB.getUserGameData( username, function( user_data ) {
                                connection.sendUTF( JSON.stringify(
                                    { type: "login_petition", username: "server", content: { 
                                        success: true, token: token, id: usr_id, username: username, texture: user_data.texture, pos: user_data.pos
                                    }, time: '' }
                                ) );
                            })
                        } else {
                            console.log( "LOGIN petition: " + username + " RESULT: invalid credentials" );
                            connection.sendUTF( JSON.stringify(
                                { type: "login_petition", username: "server", content: { 
                                    success: false
                                }, time: '' }
                            ) );
                        }
                    });
                } else {
                    console.log(message)
                    this.broadcast( data.content.roomID, connection, message );
                }
            }
        } catch( e ) {
            console.log( "ERROR: " + e );
        }
    
    },
    broadcast: function(selected_room, connection, message ){
        var users = this.clients;
        for(var i = 0; i < users.length; i++) {
            //avoid feedback
            /*
                En connection es guarda el ID --> connection.user_id

                El if da error pq en this.clients no esta guardada lo conexio
            */
            if(users[i].connection && users[i].connection != connection) {
                console.log('Sending to someone')
                users[i].connection.sendUTF( message );
            }
        }
    },
    //use HTTP request as debug tools
    onHTTPRequest: function( request, response ) {
        //get number of clients
        if ( request.url == "/numClients" ) {
            return "Clients: " + this.num_clients;
        }

        //restart the data base
        else if ( request.url == "/restartDB" ) {
            DB.restart();
            return "Database restarted";
        } 

        //clear data base --> remove everything
        else if ( request.url == "/removeAll" ) {
            DB.removeAll();
            return "Database cleared";
        } 

        //copy user from databes to local
        else if ( request.url == "/updateUsersLocal" ) {
            DB.updateUsersLocal();
            return "Database restarted";
        } 

        //get users list
        else if ( request.url == "/usersList" ) {
            DB.getUsersList( function(v) {

                DB.updateUsersDataLocal( v );
                
                response.end( JSON.stringify( v ) );
            });
            return false;
        } 

        //check if login works correctly
        else if ( request.url.indexOf("/login") !== -1 ) {
            
            var usr_name = "Alpha"; 
            var usr_password = "1234";

            try {
                //login?username=usr_name&password=pswd
                var str = request.url.split('?');
                var start = str[0];     // /login
                var rest = str[1];      // username=usr_name&password=pswd
                rest = rest.split('&');
                usr_name = rest[0].split( '=' )[1];
                usr_password = rest[1].split( '=' )[1];
            } catch( e ) {
                console.log( e );
                usr_name = "Alpha"; 
                usr_password = "1234";
            }

            DB.login( usr_name, usr_password, function( token, id ) {
                if( token ) {
                    response.end( "Login successfull, your token: " + token + " your ID: " + id );
                } else {
                    response.end( "Wrong password" );
                }
            });
            return false;
        } 

        //get rooms data
        else if ( request.url == "/rooms" ) {
            DB.getAllRoomsData( function(v) {
                console.log( JSON.stringify( v ));
            });
            return false;
        } 

        //get data of a user by passing its id
        else if ( request.url.indexOf("/userById") !== -1 ) {
            var id = 0;

            try {
                //userById?id=id
                var str = request.url.split('?');
                var start = str[0];     // /userById
                var rest = str[1];      // id=id
                id = rest.split( '=' )[1];
            } catch( e ) {
                console.log( e );
                id = 0;
            }

            DB.getUserById( id, function(v) {
                response.end( JSON.stringify( v ));
            });

            return false;
        }

        //user exists ?
        else if ( request.url.indexOf("/userExists") !== -1 ) {
            var name = "center";

            try {
                //userExists?name=name
                var str = request.url.split('?');
                var start = str[0];     // /userExists
                var rest = str[1];      // name=name
                name = rest.split( '=' )[1];
            } catch ( e ) {
                console.log( e );
                name = "center";
            }

            DB.userExists( name, function(v) {
                console.log( v );
            });
        }
        
        //undefined
        else {
            return "Command undefined";
        }
    }
};

module.exports = CORE;