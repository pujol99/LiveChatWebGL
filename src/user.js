class User {
    constructor( mesh_path, texture_path, _pos, scale ) {
        this.pos = _pos;
        this.speed = 20;

        this.id = 0;
        this.username = "Anonymous";
        this.email = "me@gmail.com";
        this.password = "1234";
        this.room_id = 0;

        this.object = new RD.SceneNode({
            mesh: mesh_path,
            color: [1, 1, 1, 1],
            position: _pos,
            texture: texture_path
        });
        //this.object.scale(scale)
        scene.root.addChild( this.object );
    }

    update( elapsed_time ) {
        personMovementUpdate(elapsed_time, this);
        //personAnimationUpdate(this, "idle");
    }

    updatepos(pos){
        this.pos = pos;
        this.object.position = pos;
    }
    
    sendtoServer() {
        /*socket.send( JSON.stringify({ type: "updatepos",  id: this.id, username: this.username, content: {
                pos: this.target_pos
            }}
        ));*/
    }
}