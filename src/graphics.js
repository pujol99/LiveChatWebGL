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

//Player
var player = new User("assets/boy.wbin", "assets/boy_texture.png", [0, 10, 0]);

//Floor
var floor_node = new RD.SceneNode( {
    mesh: "planeXZ",
    color: [1, 1, 1, 1],
    texture: "assets/space.jpg"
});
floor_node.scale(100);
scene.root.addChild(floor_node);

//Camera
var camera = new RD.Camera();
camera.lookAt( [7, 7, 7], [0,0,0], [0,1,0] );
var free_cam = false;

//Time previous frame
var last = performance.now();


/**FUNCTIONS**/
function draw() {
    //var time = performance.now();

    //clear
    gl.viewport( 0, 0, canvas.width, canvas.height )
    gl.clearColor( 0.4, 0.4, 0.6, 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    //render the scene
    renderer.render( scene, camera );
}

function update(dt){
    player.update(dt);
}


function loop() {
    draw();

    var now = performance.now()
    var elapsed_time = ( now - last ) / 1000;
    last = now;

    update(elapsed_time);

    requestAnimationFrame(loop);
}

//Resize the size of the canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    camera.perspective(
        90,     //FOV
        canvas.width / canvas.height,   //aspect ratio
        0.1,    //near
        1000    //far
    );
}

function init(){
    /***EVENTS***/
    window.addEventListener("resize", resize);

    resize();

    /***MAIN LOOP***/
    loop();
}

init();