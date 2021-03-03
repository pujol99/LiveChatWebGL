function loadAnimation(name, url){
	var anim = new RD.SkeletalAnimation();
	anim.load(url);
	animations[name] = anim;
}

function cameraFollow(element) {
    var m = element._global_matrix;
    var eye = [0,0,0];
    mat4.multiplyVec3( eye, m, [0,4,8] );
    var center = [0,0,0];
    mat4.multiplyVec3( center, m, [0,4,0] );
    var up = [0,0,0];
    mat4.rotateVec3( up, m, [0,1,0] );

    camera.lookAt(eye, center, up);
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

function personMovementUpdate(elapsed_time, person){
    var hasMoved = false;

    var delta = [0,0,0];
    if( gl.keys['W'] ) {
        delta[2] = -1;
        hasMoved = true;
    } else if( gl.keys['S'] ) {
        delta[2] = 1;
        hasMoved = true;
    }

    //person.move( elapsed_time, delta );
    vec3.scale( delta, delta, elapsed_time * person.speed );
    delta = person.object.getLocalVector( delta );
    person.object.translate( delta );
    
    if( gl.keys['A'] ) {
        person.object.rotate( elapsed_time * person.speed * 0.2, [0, 1, 0] );
        //person.rotate( elapsed_time, true );
        hasMoved = true;
    } else if( gl.keys['D'] ) {
        person.object.rotate( -elapsed_time * person.speed * 0.2, [0, 1, 0] );
        //person.rotate( elapsed_time, false );
        hasMoved = true;
    }

    person.object.position = walk_area.adjustPosition( person.object.position );
    if ( hasMoved ){
        person.sendtoServer();
        cameraFollow(person.object);
    }
}

function personAnimationUpdate(person, animation){
    var anim = animations[ animation ];
    if(anim && anim.duration)
    {
        anim.assignTime( getTime() * 0.001, true );
        person.object.assignSkeleton( anim.skeleton );
        person.object.shader = "texture_skinning";
    }
}

function onMouse(e){

    if ( !free_cam ) {
        /*
        if ( e.type == "mousedown" ) {
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var collision = ray.testPlane( [0,0,0], [0, 1, 0] );
            if ( collision ) {
                me.object.position = ray.collision_point;
                camera.lookAt( camera.position, me.object.position, [0, 1, 0] );
            }
        }*/
    }
    else {
        //orbit to change from where is looking
        //rotate to change what is looking
        if( e.dragging ) {
            if( e.buttons & 4 ) // middle mouse
            {
                camera.moveLocal( [-e.deltax, e.deltay, 0], 0.1 );
            } else if ( e.buttons & 2 ) {   //right mouse
                camera.rotate( e.deltax * -0.005, [0, 1, 0] );
                var right = camera.getLocalVector([1, 0, 0]);
                camera.rotate( e.deltay * -0.005, right );
            } else {    //left mouse
                //Als extrems fa coses rares --> shauria de limitar
                camera.orbit( e.deltax * -0.005, [0,1,0] );
                camera.orbit( e.deltay * -0.005, [1,0,0], null, true );
            }
        }
    }
}

function onKey(e){
    switch( e.key ) {
        case "Tab":
            free_cam = !free_cam;
            e.preventDefault();
		    e.stopPropagation();
            break;
        default:
            break;
    }
}

function onMouseWheel( e ) {
	camera.orbitDistanceFactor( 1 + (e.wheel / 100) * -0.1 );
}

function addFloor(texture, scale){
    //Floor
    var floor_node = new RD.SceneNode( {
        mesh: "planeXZ",
        color: [1, 1, 1, 1],
        texture: texture
    });
    floor_node.scale(scale);
    scene.root.addChild(floor_node);
}