class User {
    constructor( mesh_path, texture_path, _pos ) {
        this.pos = { x: _pos[0], y: _pos[1]};
        this.speed = 10;

        this.object = new RD.SceneNode({
            mesh: mesh_path,
            color: [1, 1, 1, 1],
            position: _pos,
            texture: texture_path
        });
        scene.root.addChild( this.object );
    }

    update( elapsed_time ) {
        var hasMoved = false;

        var delta = [0,0,0];
        if( gl.keys['W'] ) {
            delta[2] = -1;
            hasMoved = true;
        } else if( gl.keys['S'] ) {
            delta[2] = 1;
            hasMoved = true;
        }

        vec3.scale( delta, delta, elapsed_time * 10 );
        delta = this.object.getLocalVector( delta );
        this.object.translate( delta );
        
        if( gl.keys['A'] ) {
            this.object.rotate( elapsed_time*1, [0, 1, 0] );
            hasMoved = true;
        } else if( gl.keys['D'] ) {
            this.object.rotate( elapsed_time*-1, [0, 1, 0] );
            hasMoved = true;
        }

        if ( hasMoved )
            cameraFollow(this.object);
    }
    
    move() {

    }
    
    sendtoServer() {
        /*socket.send( JSON.stringify({ type: "updatepos",  id: this.id, username: this.username, content: {
                pos: this.target_pos
            }}
        ));*/
    }
}