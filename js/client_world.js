var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};
var sphere;

var player, playerId, moveSpeed, turnSpeed;

var playerData;

var otherPlayers = [], otherPlayersId = [];

var boxWidth;
var controls;

var playerChangeCount;

var skybox;
var sky;
var sun;

var loadWorld = function(){

    init();
    animate();

    function init(){
        //Setup------------------------------------------
        container = document.getElementById('container');

        scene = new THREE.Scene();

        // camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000000);
        camera.position.z = 5;
        //camera.lookAt( new THREE.Vector3(0,0,0));

        renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});
        // renderer = new THREE.WebGLRenderer( { alpha: true} );
        renderer.setSize( window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------

        //Sphere------------------
        // var sphere_geometry = new THREE.SphereGeometry(32,32,32);
        // // var sphere_material = new THREE.MeshNormalMaterial();
        // var sphere_material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        // sphere = new THREE.Mesh( sphere_geometry, sphere_material );

        // Apply VR headset positional data to camera.
        controls = new THREE.VRControls(camera);

        // Apply VR stereo rendering to renderer.
        var effect = new THREE.VREffect(renderer);
        effect.setSize(window.innerWidth, window.innerHeight);

        // Get the VRDisplay and save it for later.
        var vrDisplay = null;
        navigator.getVRDisplays().then(function(displays) {
          if (displays.length > 0) {
            vrDisplay = displays[0];
          }
        });

        // scene.add( sphere );
        // objects.push( sphere ); //if you are interested in detecting an intersection with this sphere
        // sphere.position.x += 1;
        // sphere.position.z -= 640;

        //Events------------------------------------------
        document.addEventListener('click', onMouseClick, false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut, false);
        document.addEventListener('keydown', onKeyDown, false );
        document.addEventListener('keyup', onKeyUp, false );
        window.addEventListener( 'resize', onWindowResize, false );

        //Final touches-----------------------------------
        container.appendChild( renderer.domElement );
        document.body.appendChild( container );

        initSky();
    }

    function initSky() {

				// Add Sky Mesh
				sky = new THREE.Sky();
				scene.add( sky.mesh );

				// Add Sun Helper
				sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				sunSphere.position.y = - 700000;
				sunSphere.visible = false;
				scene.add( sunSphere );

				/// GUI

				var effectController  = {
					turbidity: 10,
					reileigh: 2,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.8,
					luminance: 1,
					inclination: 0.49, // elevation / inclination
					azimuth: 0.25, // Facing front,
					sun: ! true
				};

				var distance = 400000;

				function guiChanged() {

					var uniforms = sky.uniforms;
					uniforms.turbidity.value = effectController.turbidity;
					uniforms.reileigh.value = effectController.reileigh;
					uniforms.luminance.value = effectController.luminance;
					uniforms.mieCoefficient.value = effectController.mieCoefficient;
					uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

					var theta = Math.PI * ( effectController.inclination - 0.5 );
					var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

					sunSphere.position.x = distance * Math.cos( phi );
					sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
					sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

					sunSphere.visible = effectController.sun;

					sky.uniforms.sunPosition.value.copy( sunSphere.position );

					renderer.render( scene, camera );

				}

				// var gui = new dat.GUI();

				// gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
				// gui.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
				// gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
				// gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
				// gui.add( effectController, "luminance", 0.0, 2 ).onChange( guiChanged );
				// gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
				// gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
				// gui.add( effectController, "sun" ).onChange( guiChanged );

				guiChanged();

			}

    function animate(){
        //if (skybox) {skybox.rotation.y += 0.001;}
        requestAnimationFrame( animate );
        render();
    }
    function render(){

        if ( player ){

            updateCameraPosition();

            camera.lookAt( player.position );

            checkKeyStates();
        }
        //Render Scene---------------------------------------
        renderer.clear();
        renderer.render( scene , camera );
    }

    function onMouseClick(){
        // intersects = calculateIntersects( event );

        // if ( intersects.length > 0 ){
        //     //If object is intersected by mouse pointer, do something
        //     if (intersects[0].object == sphere){
        //         alert("This is the sun!");
        //     }
        // }
    }
    function onMouseDown(){

    }
    function onMouseUp(){

    }
    function onMouseMove(){

    }
    function onMouseOut(){

    }
    function onKeyDown( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = true;

    }

    function onKeyUp( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = false;

    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
    function calculateIntersects( event ){

        //Determine objects intersected by raycaster
        event.preventDefault();

        var vector = new THREE.Vector3();
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        vector.unproject( camera );

        raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( objects );

        return intersects;
    }

};

var createPlayer = function(data){

    playerData = data;

    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: data.color, wireframe: false});
    player = new THREE.Mesh(cube_geometry, cube_material);

    player.rotation.set(0,0,0);

    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;

    playerId = data.playerId;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;

    updateCameraPosition();

    objects.push( player );
    scene.add( player );

    camera.lookAt( player.position );
};

var updateCameraPosition = function(){
    camera.position.y = player.position.y + 3;
    camera.position.x = player.position.x + 6 * Math.sin( player.rotation.y );
    camera.position.z = player.position.z + 6 * Math.cos( player.rotation.y );
};

var updatePlayerPosition = function(data){

    var somePlayer = playerForId(data.playerId);

    somePlayer.position.x = data.x;
    somePlayer.position.y = data.y;
    somePlayer.position.z = data.z;

    somePlayer.rotation.x = data.r_x;
    somePlayer.rotation.y = data.r_y;
    somePlayer.rotation.z = data.r_z;

};

var updatePlayerData = function(){
    playerData.x = player.position.x;
    playerData.y = player.position.y;
    playerData.z = player.position.z;

    playerData.r_x = player.rotation.x;
    playerData.r_y = player.rotation.y;
    playerData.r_z = player.rotation.z;

};
var checkKeyStates = function(){

    if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        player.position.x -= moveSpeed * Math.sin(player.rotation.y);
        player.position.z -= moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        player.position.x += moveSpeed * Math.sin(player.rotation.y);
        player.position.z += moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        player.rotation.y += turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        player.rotation.y -= turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[81]) {
        // 'q' - strafe left
        player.position.x -= moveSpeed * Math.cos(player.rotation.y);
        player.position.z += moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[69]) {
        // 'e' - strage right
        player.position.x += moveSpeed * Math.cos(player.rotation.y);
        player.position.z -= moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[32]) {
        // spacebar - Zoom
        //camera.position.y = player.position.y + 20;
        camera.position.y = player.position.y + 20;
        camera.position.x = player.position.x + Math.sin( player.rotation.y );
        camera.position.z = player.position.z + Math.cos( player.rotation.y );
        camera.lookAt(player.position);
    }

    if (keyState[48]) {
        // '0' - Noon
        camera.position.y = otherPlayers[0].position.y + 3;
        camera.position.x = otherPlayers[0].position.x + 6 * Math.sin( otherPlayers[0].rotation.y );
        camera.position.z = otherPlayers[0].position.z + 6 * Math.cos( otherPlayers[0].rotation.y );
        camera.lookAt(otherPlayers[0].position);
    }
    // if (keyState[49]) {
    //     // '1' - Morning
    //     skybox.material.color.setHex(0xE4E5F7);
    // }
    // if (keyState[50]) {
    //     // '2' - Evening
    //     skybox.material.color.setHex(0x9A9FF1);
};

var addOtherPlayer = function(data){
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: data.color, wireframe: false});
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;

    otherPlayersId.push( data.playerId );
    otherPlayers.push( otherPlayer );
    objects.push( otherPlayer );
    scene.add( otherPlayer );
};

var removeOtherPlayer = function(data){

    scene.remove( playerForId(data.playerId) );

};

var playerForId = function(id){
    var index;
    for (var i = 0; i < otherPlayersId.length; i++){
        if (otherPlayersId[i] == id){
            index = i;
            break;
        }
    }
    return otherPlayers[index];
};

function onVRDisplayPresentChange() {
  console.log('onVRDisplayPresentChange');
  onResize();  
}

function enterFullscreen (el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}