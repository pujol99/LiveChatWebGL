
function onMouse(e){

    if ( !free_cam ) {
        if ( e.type == "mousedown" ) {
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var collision = ray.testPlane( [0,0,0], [0, 1, 0] );
            if ( collision ) {
                player.position = ray.collision_point;
                camera.lookAt( camera.position, player.position, [0, 1, 0] );
            }
        }
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
    switch( e.code ) {
        case "ShiftLeft":
            free_cam = !free_cam;
            break;
        default:
            //console.log(e.code);
            break;
    }
}

function onMouseWheel( e ) {
	camera.orbitDistanceFactor( 1 + (e.wheel / 100) * -0.1 );
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