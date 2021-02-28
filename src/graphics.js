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

addFloor("assets/space.jpg", 100);
var me = new User("assets/boy.wbin", "assets/boy.png", [0, 3, 0], 0.05);

/**FUNCTIONS**/
function draw() {
    gl.viewport( 0, 0, canvas.width, canvas.height )
    gl.clearColor( 0.4, 0.4, 0.6, 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    //render the scene
    renderer.render( scene, camera );
}

function update(dt){
    me.update(dt);
}


function loop() {
    draw();

    var now = performance.now()
    var elapsed_time = ( now - last ) / 1000;
    last = now;

    update(elapsed_time);

    requestAnimationFrame(loop);
}



function init(){
    /***EVENTS***/
    window.addEventListener("resize", resize);

    resize();

    /***MAIN LOOP***/
    loop();
}

init();