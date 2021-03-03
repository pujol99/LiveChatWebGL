/**VARIABLES**/
var canvas = document.querySelector("canvas");
var gl = GL.create({canvas:canvas});
gl.captureMouse( true );
gl.onmouse = onMouse;
gl.captureKeys( true );
gl.onkeydown = onKey;
gl.onmousewheel = onMouseWheel;

var renderer = new RD.Renderer(gl);
var scene = new RD.Scene();
var camera = new RD.Camera();
camera.lookAt( [7, 7, 7], [0,0,0], [0,1,0] );
var animations = {};
loadAnimation("idle", "assets/anims/girl_idle.skanim");
loadAnimation("dancing", "assets/anims/girl_dancing.skanim");

var free_cam = true;
var last = performance.now();

var me = null;
var walk_area = new WalkArea();
walk_area.addRect( [-20, 0.1, -20], 40, 40 ); //top left corner, width, height

//magicavoxel room exmaple
var voxelroom = null;

//blender room exmaple
var blenderroom = null;

/**FUNCTIONS**/
function draw() {
    gl.viewport( 0, 0, canvas.width, canvas.height )
    gl.clearColor( 0.4, 0.4, 0.6, 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    //areas
    var vertices = walk_area.getVertices();
	if(vertices)
		renderer.renderPoints(vertices,null,camera,null,null,0.1,gl.LINES);

    //render the scene
    renderer.render( scene, camera );
}

function update(dt){
    //update user
    me.update(dt);

    //update other users
}


function loop() {
    draw();

    var now = performance.now()
    var elapsed_time = ( now - last ) / 1000;
    last = now;

    update(elapsed_time);

    requestAnimationFrame(loop);
}



function init(data){
    /***EVENTS***/
    window.addEventListener("resize", resize);

    addFloor("assets/grid.png", 40);

    voxelroom = new RD.SceneNode( {
        mesh: "assets/roomexample.obj",
        color: [1, 1, 1, 1],
        position: [ -10, 0, -10],
        texture: "assets/roomexample.png"
    });
    voxelroom.rotate(180*DEG2RAD, [0,1,0]);
    
    scene.root.addChild(voxelroom);
    
    blenderroom = new RD.SceneNode( {
        mesh: "assets/room.obj",
        color: [1, 1, 1, 1],
        position: [ 10, 0.1, -10],
        texture: "assets/room.png"
    });
    blenderroom.scale(3);
    
    scene.root.addChild(blenderroom);
    
    me = new User("assets/character/boy.wbin", "assets/character/" + data.content.texture + ".png", data.content.pos, data.content.id, data.content.username, 0.05);
    cameraFollow( me.object );
    resize();

    /***MAIN LOOP***/
    loop();
}