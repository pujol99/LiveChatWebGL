class User {
    constructor( mesh_path, texture_path, _pos, _id, _username, scale ) {
        this.pos = _pos;
        this.speed = 20;
        this.angle = 0;

        this.id = _id;
        this.username = _username;
        this.room_id = 0;

        this.object = new RD.SceneNode({
            mesh: mesh_path,
            color: [1, 1, 1, 1],
            position: _pos,
            texture: texture_path
        });
        //this.object.scale(scale)
        scene.root.addChild( this.object );

        this.isMoving = false;
    }

    update( elapsed_time ) {
        personMovementUpdate(elapsed_time, this);
        //personAnimationUpdate(this, "dancing");
    }

    
    sendtoServer() {
        socket.send( JSON.stringify({
            type: "updatepos",  id: this.id, username: this.username, content: {
                pos: this.object.position
            }}
        ));
    }
    
    move( elapsed_time, isFront ){
        var delta = [0,0,0];

        if( isFront ) {
            delta[2] = -1;
        } else {
            delta[2] = 1;
        }

        vec3.scale( delta, delta, elapsed_time * this.speed );
        delta = this.object.getLocalVector( delta );
        this.object.translate( delta );
    }

    rotate( elapsed_time, isRight ) {
        if ( isRight ) {
            this.object.rotate( elapsed_time * this.speed * 0.2, [0, 1, 0] );
        } else {
            this.object.rotate( -elapsed_time * this.speed * 0.2, [0, 1, 0] );
        }
    }
}