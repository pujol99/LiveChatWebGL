var fs = require( 'fs' );
var redis = require( "redis" );
var md5 = require( 'md5' );
var ROOM = require("./room.js");

var redis_namespace = "angelalex:";


var DB = {
    redis: null,
    users: [], // {id, texture, position, roomid, online}
    rooms: [], // {id}

    init: function() {
        var that = this;
        //get all rooms and update it locally
        this.getAllRoomsData( function( room ) {
            that.rooms.push( new ROOM( room.id, room.lightOn, room.distance_near ));
        });

        //get all users
        this.updateUsersLocal();
    },

    getUserById: function( id, callback )
    {
        //LRANGE namespace:list 0 -1 (-1 is to get all the elements)
        this.redis.lrange( redis_namespace + 'users_list', 0, -1, function( err, v ){

            if ( err ) { return console.log(err); }

            var len = v.length;
            for ( var i = 0; i < len; i++ ) {
                var data = JSON.parse( v[i] );
                if ( data.id == id ) {
                    if ( callback ) {
                        callback( data );
                        return;
                    }
                }
            }

            callback( false );
            return;
        });
    },

    login: function( username, password, callback ) {
        var that = this;

        this.getUserData( username, function( user_info ) {
            
            if( !user_info ) {
                callback( false );
                return;
            }
            var isValid = ( md5( user_info.salt + password ) == user_info.password );

            var token = null;
            
            if( isValid ) {
                //Session token
                token = md5( String( Date.now() ) + username );
                that.redis.set( redis_namespace + 'session:' + token, username );
            }
            
            callback( token, user_info.id );
        });
    },

    //restart the data base
    restart: function( ) {
        var that = this;
        this.redis.del( redis_namespace + 'users_list' );
        
        //Remove all session tokens
        this.getElementsInKey( 'session:', function( key ) { that.redis.del( key ); } );
        
        //Remove all users --> will happen some time later so probably it will remove all users
        //this.getElementsInKey( 'users:', function( key ) { that.redis.del( key ); } );

        /*
            NO ME'LS BORRIS !!
        */
        this.createUser( 
            "center",  
            {id: 0 , email: "center@yahoo.es" , password: "center" } ,  
            {id: 0, texture: "man1" , pos: [0,0,0] , room_id: 0 , online: true }
        );

        this.createUser( 
            "bottomleft",  
            {id: 1 , email: "bottomleft@yahoo.es" , password: "bottomleft" } ,  
            {id: 1, texture: "man2" , pos: [-20,0,20] , room_id: 0 , online: true }
        );

        this.createUser( 
            "bottomright",  
            {id: 2 , email: "bottomright@yahoo.es" , password: "bottomright" } ,  
            {id: 2, texture: "man3" , pos: [20,0,20] , room_id: 0 , online: true }
        );

        this.createUser( 
            "topleft",  
            {id: 3 , email: "topleft@yahoo.es" , password: "topleft" } ,  
            {id: 3, texture: "man4" , pos: [-20,0,-20] , room_id: 0 , online: true }
        );

        this.createUser( 
            "topright",  
            {id: 4 , email: "topright@yahoo.es" , password: "topright" } ,  
            {id: 4, texture: "woman1" , pos: [20,0,-20]  , room_id: 0 , online: true }
        );

        //Create some rooms
        this.createRoom( "Park" , { id: 0} );
        this.createRoom( "City" , { id: 1} );

        return true;
    },

    removeAll: function() {
        this.users = [];
        var that = this;
        this.getElementsInKey( 'users:', function( key ) { that.redis.del( key ); } );
        this.getElementsInKey( 'rooms:', function( key ) { that.redis.del( key ); } );
        this.getElementsInKey( 'game_data:', function( key ) { that.redis.del( key ); } );
        this.getElementsInKey( 'emails:', function( key ) { that.redis.del( key ); } );
    },

    //obtain all elements of a specific key
    getElementsInKey: function( key, callback ) {
        this.redis.keys( redis_namespace + key + '*', function( err, keys ) {
            
            if ( err ) { return console.log(err); }
        
            for( var i = 0, len = keys.length; i < len; i++ ) {
                callback( keys[i] );
            }
            
        });
    },

    createRoom: function( room_name, data ) {

        if ( data.constructor !== String ) {
            data = JSON.stringify( data );
        }

        this.redis.set( redis_namespace + 'rooms:' + room_name, data );

    },

    createUser: function( username, data, game_data ) {
        if ( data.email ) {
            this.redis.set( redis_namespace + 'emails:' + data.email, username );
        }

        if( data.password ) {
            //create a random salt
            var salt = String( Math.random() ) + String( Date.now() );
            data.salt = salt;
            //encrypt the password
            data.password = md5( salt + data.password );
        }

        if ( game_data ) {
            //console.log(game_data);
            this.redis.set( redis_namespace + 'game_data:' + username, JSON.stringify( game_data ) );
        }

        this.redis.rpush( redis_namespace + 'users_list', JSON.stringify( { id: data.id , username: username} ) );

        //Add to array of users
        this.users[data.id] = {
            id: data.id,
            texture: game_data.texture, 
            pos: game_data.pos, 
            room_id: game_data.room_id, 
            online: true
        };

        //Add to redis
        if ( data.constructor !== String ) {
            data = JSON.stringify( data );
        }

        this.redis.set( redis_namespace + 'users:' + username, data );
    },

    userExists: function( username, callback ) {

        this.redis.exists( redis_namespace + 'users:' + username, function(err, ok){
            if ( err ) { return console.log(err); }

            callback( ok );
        });
    },

    //get data of a given username
    getUserData: function( username, callback ) {

        this.redis.get( redis_namespace + 'users:' + username, function( err, v ){
            callback( JSON.parse( v ));
        });
    },

    //get game data of a given username
    getUserGameData: function( username, callback ) {

        this.redis.get( redis_namespace + 'game_data:' + username, function( err, v ){
            callback( JSON.parse( v ));
        });
    },

    //get all users that appear on the users list
    getUsersList: function( callback ) {
        //LRANGE namespace:list 0 -1 (-1 is to get all the elements)
        this.redis.lrange( redis_namespace + 'users_list', 0, -1, function( err, v ){
            callback( v );
        });
    },

    //get data of a room
    getRoomData: function( room_name, callback ) {
        this.redis.get( redis_namespace + 'rooms:' + room_name, function( err, v ){
            callback( JSON.parse( v ) );
        });
    },

    //get data of all rooms
    getAllRoomsData: function( callback ) {
        var that = this;
        this.redis.keys( redis_namespace + 'rooms:*', function( err, keys ) {
            
            if ( err ) { return console.log(err); }
        
            for( var i = 0, len = keys.length; i < len; i++ ) {
                that.redis.get( keys[i], function( err, v ){
                    callback( JSON.parse( v ));
                });
            }
            
        });
    },

    updateUsersDataLocal: function( userslist ) {
        var that = this;
        for ( var i = 0; i < userslist.length; i++ ) {
            var user = JSON.parse( userslist[i] );
            this.getUserGameData(user.username, function(info){
                that.users[info.id] = info;
            })
        }
    },

    updateUsersLocal: function() {
        var that = this;
        this.getUsersList( function(v) {
            that.updateUsersDataLocal( v );
        });
    }
}

var client = DB.redis = redis.createClient(); //new client
client.on( 'connect', function() {
    console.log( 'Connected to Redis' );
});

//Store data
function updateUserData( user ) {
	var filename = "users/user_" + user.id + ".json";
	fs.writeFileSync(filename, JSON.serialize(user) );
}

//Load data
function getUserData( id ) {
	var filename = "users/user_" + id + ".json";
	var str = fs.readFileSync(filename).toString();
	return JSON.parse( str );
}


module.exports = DB;
