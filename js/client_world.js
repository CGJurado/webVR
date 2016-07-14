var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};
var sphere;

var player, playerId, moveSpeed, turnSpeed;

var playerData;

var otherPlayers = [], otherPlayersId = [];

var controls;
var playerChangeCount;

var skybox, sky, sun;
var floor, boxWidth;
var distance = 400000;

var cube1, cube2, cube3, cube4, cube5, cube6;
var reticle;

var CubeMaterials = [];
var CubeMaterialsList = [];

var floorTextures = [];

var effectController;
var uniforms;
var effect;

var vrDisplay;
var actualSunPos;

var textMesh1;
var centerOffsetText;
var centerOffsetTime;

var timeText = "";
var timeMesh1;

var lastSecond;
var lastHour;

var currentCity = 1;

var time = new Date();

var clock = new THREE.Clock();
var particles;
var particleRotationSpeed = 0.05;
var maxParticleSize = 100;
var particlesHeight = 40;
var particleScale = 10;

var cubeRotation = 0.025;

var cityID;

var loadWorld = function(){

    init();
    animate();

    function init(){

        THREE.Cache.enabled = true;
        //Setup------------------------------------------
        container = document.getElementById('container');

        scene = new THREE.Scene();

        // camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000000);
        camera.position.z = 5;
        //camera.lookAt( new THREE.Vector3(0,0,0));

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        // renderer = new THREE.WebGLRenderer( { alpha: true} );
        renderer.setSize( window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------

        // Apply VR headset positional data to camera.
        controls = new THREE.VRControls(camera);

        // Apply VR stereo rendering to renderer.
        effect = new THREE.VREffect(renderer);
        effect.setSize(window.innerWidth, window.innerHeight);

        //create gaze interaction manager
        reticle = vreticle.Reticle(camera);

        scene.add(camera);
        
        cityID = {
            santodomingo : 1687725,
            londres : 2643741,
            tokyo : 1850147,
            turquia : 480267,
            paris : 4125402,
            nyc : 5128581
        };

        // Add a floor texture.
		boxWidth = 1000;
        createFloor();

        //Events------------------------------------------
        // document.addEventListener('click', onMouseClick, false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut, false);
        document.addEventListener('keydown', onKeyDown, false );
        document.addEventListener('keyup', onKeyUp, false );
        window.addEventListener( 'resize', onResize, false );
		window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

        //Final touches-----------------------------------
        container.appendChild( renderer.domElement );
        document.body.appendChild( container );

        initSky();
        addCubes();
        GazeAtCubes();

        // Get the VRDisplay and save it for later.
		vrDisplay = null;
		navigator.getVRDisplays().then(function(displays) {
		  if (displays.length > 0) {
		    vrDisplay = displays[0];
		  }
		});
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

				effectController  = {
					turbidity: 10,
					reileigh: 2,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.8,
					luminance: 1,
					inclination: 1, // elevation / inclination
					azimuth: 0.25, // Facing front,
					sun: ! true
				};

				guiChanged();
		}

	    function animate(){
	        if (cube1) {cube1.rotation.y += cubeRotation;}
			if (cube2) {cube2.rotation.y += cubeRotation;}
			if (cube3) {cube3.rotation.y += cubeRotation;}
			if (cube4) {cube4.rotation.y += cubeRotation;}
			if (cube5) {cube5.rotation.y += cubeRotation;}
			if (cube6) {cube6.rotation.y += cubeRotation;}

            if (cube1 && cube2 && cube3 && cube4 && cube5 && cube6 && player) {
                loadCubePositions();
                cube6.rotation.y = cube5.rotation.y = cube4.rotation.y = cube3.rotation.y = cube2.rotation.y = cube1.rotation.y;
            }
        	controls.update();
            
            if ( player ){
                updateCameraPosition();
                checkKeyStates();
            }

            if (textMesh1) {updateTextPosition();}
            updateTime();
            if (particles) {
                animateParticles();
            }
            
            // Render the scene.
            effect.render(scene, camera);

        //reticle_loop
        reticle.reticle_loop();

        requestAnimationFrame( animate );
        render();
    }
    function render(){
        
        //Render Scene---------------------------------------
//        renderer.clear();
        renderer.render( scene , camera );
    }

    // function onMouseClick(){
    //     intersects = calculateIntersects( event );

    //     if ( intersects.length > 0 ){
    //         //If object is intersected by mouse pointer, do something
    //         if (intersects[0].object == cube1){
    //             alert("This is Cube #1!");
    //         }
    //         if (intersects[0].object == cube2){
    //             alert("This is Cube #2!");
    //         }
    //         if (intersects[0].object == cube3){
    //             alert("This is Cube #3!");
    //         }
    //         if (intersects[0].object == cube4){
    //             alert("This is Cube #4!");
    //         }
    //         if (intersects[0].object == cube5){
    //             alert("This is Cube #5!");
    //         }
    //         if (intersects[0].object == cube6){
    //             alert("This is Cube #6!");
    //         }
    //     }
    // }
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

    function onResize() {
	  console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
	  effect.setSize(window.innerWidth, window.innerHeight);
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.lookAt(player.position);
	  camera.updateProjectionMatrix();
	}

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
        render();

    }

    function onVRDisplayPresentChange() {
	  console.log('onVRDisplayPresentChange');
	  onResize();
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

    checkOverlapPosition(0);

    objects.push( player );
    scene.add( player );

    camera.lookAt( player.position );
    loadTextGeometry("Londres");
    loadTime();
    loadTimeGeometry(timeText);

    getCurrentWeather(cityID.londres);
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

    camera.lookAt(player.position);
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
    	// '0'
        camera.lookAt(player.position);
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

function addCubes(){

	var cubeSize = 2;

	var geometry = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize,cubeSize,cubeSize,cubeSize);
	// var material = new THREE.MeshNormalMaterial();

    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london1.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london2.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london3.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london4.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london5.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/london6.jpg' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris4.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/paris6.png' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo4.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/tokyo6.png' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey4.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/turkey6.png' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC4.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/NYC6.png' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_4.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/STO_DGO_6.png' ) }));
    CubeMaterialsList.push(new THREE.MeshFaceMaterial(materialArray));

    CubeMaterialsList[0].anisotropy = 16;
    CubeMaterialsList[1].anisotropy = 16;
    CubeMaterialsList[2].anisotropy = 16;
    CubeMaterialsList[3].anisotropy = 16;
    CubeMaterialsList[4].anisotropy = 16;
    CubeMaterialsList[5].anisotropy = 16;

	cube1 = new THREE.Mesh(geometry, CubeMaterialsList[0]);
	cube2 = new THREE.Mesh(geometry, CubeMaterialsList[1]);
	cube3 = new THREE.Mesh(geometry, CubeMaterialsList[2]);
	cube4 = new THREE.Mesh(geometry, CubeMaterialsList[3]);
	cube5 = new THREE.Mesh(geometry, CubeMaterialsList[4]);
	cube6 = new THREE.Mesh(geometry, CubeMaterialsList[5]);

	loadCubePositions();

	objects.push( cube1 );
	objects.push( cube2 );
	objects.push( cube3 );
	objects.push( cube4 );
	objects.push( cube5 );
	objects.push( cube6 );

    reticle.add_collider(cube1);
    reticle.add_collider(cube2);
    reticle.add_collider(cube3);
    reticle.add_collider(cube4);
    reticle.add_collider(cube5);
    reticle.add_collider(cube6);

	scene.add(cube1);
	scene.add(cube2);
	scene.add(cube3);
	scene.add(cube4);
	scene.add(cube5);
	scene.add(cube6);
}

function GazeAtCubes(){
    cube1.ongazelong = function(){
    	if (currentCity != 1) {
	        this.material = reticle.get_random_hex_material();
	        actualSunPos = SunCalc.getPosition(new Date(), 51.5074, -0.1278);
	        updateSunPosition();
	        checkOverlapPosition(0);
	        loadTextGeometry("Londres");
	        currentCity = 1;
	        if (timeMesh1) {
	            if (timeMesh1) {scene.remove(timeMesh1)};
	            loadTime();
	            loadTimeGeometry(timeText);
	        }
	        getCurrentWeather(cityID.londres);
	        changeFloorTexture();
	    }
    }
    cube1.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube1.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[0]) this.material = CubeMaterialsList[0];
    }

    cube2.ongazelong = function(){
    	if (currentCity != 2) {
    	    this.material = reticle.get_random_hex_material();
    	    actualSunPos = SunCalc.getPosition(new Date(), 48.8566, 2.3522);
    	    updateSunPosition();
    	    checkOverlapPosition(-20);
    	    loadTextGeometry("Paris");
    	    currentCity = 2;
    	    if (timeMesh1) {
    	      if (timeMesh1) {scene.remove(timeMesh1)};
    	      loadTime();
    	      loadTimeGeometry(timeText);
    	    }
    	    getCurrentWeather(cityID.paris);
    	    changeFloorTexture(currentCity);
    	}
    }
    cube2.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube2.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[1]) this.material = CubeMaterialsList[1];
    }

    cube3.ongazelong = function(){
    	if (currentCity != 3) {
    	    this.material = reticle.get_random_hex_material();
    	    actualSunPos = SunCalc.getPosition(new Date(), 35.6895, 139.6917);
    	    updateSunPosition();
    	    checkOverlapPosition(-40);
    	    loadTextGeometry("Tokyo");
    	    currentCity = 3;
    	    if (timeMesh1) {
    	      if (timeMesh1) {scene.remove(timeMesh1)};
    	      loadTime();
    	      loadTimeGeometry(timeText);
    	    }
    	    getCurrentWeather(cityID.tokyo);
    	    changeFloorTexture(currentCity);
    	}
    }
    cube3.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube3.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[2]) this.material = CubeMaterialsList[2];
    }

    cube4.ongazelong = function(){
    	if (currentCity != 4) {
    	    this.material = reticle.get_random_hex_material();
    	    actualSunPos = SunCalc.getPosition(new Date(), 38.9637, 35.2433);
    	    updateSunPosition();
    	    checkOverlapPosition(-60);
    	    loadTextGeometry("Turquia");
    	    currentCity = 4;
    	    if (timeMesh1) {
    	      if (timeMesh1) {scene.remove(timeMesh1)};
    	      loadTime();
    	      loadTimeGeometry(timeText);
    	    }
    	    getCurrentWeather(cityID.turquia);
    	    changeFloorTexture(currentCity);
    	}
    }
    cube4.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube4.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[3]) this.material = CubeMaterialsList[3];
    }

    cube5.ongazelong = function(){
    	if (currentCity != 5) {
    	    this.material = reticle.get_random_hex_material();
    	    actualSunPos = SunCalc.getPosition(new Date(), 40.7128, -74.0059);
    	    updateSunPosition();
    	    checkOverlapPosition(-80);
    	    loadTextGeometry("NYC");
    	    currentCity = 5;
    	    if (timeMesh1) {
    	      if (timeMesh1) {scene.remove(timeMesh1)};
    	      loadTime();
    	      loadTimeGeometry(timeText);
    	    }
    	    getCurrentWeather(cityID.nyc);
    	    changeFloorTexture(currentCity);
    	}
    }
    cube5.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube5.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[4]) this.material = CubeMaterialsList[4];
    }

    cube6.ongazelong = function(){
    	if (currentCity != 6) {
    	    this.material = reticle.get_random_hex_material();
    	    actualSunPos = SunCalc.getPosition(new Date(), 18.4861, -69.9312);
    	    updateSunPosition();
    	    checkOverlapPosition(-100);
    	    loadTextGeometry("Santo Domingo");
    	    currentCity = 6;
    	    if (timeMesh1) {
    	      if (timeMesh1) {scene.remove(timeMesh1)};
    	      loadTime();
    	      loadTimeGeometry(timeText);
    	    }
    	    getCurrentWeather(cityID.santodomingo);
    	    changeFloorTexture(currentCity);
    	}
    }
    cube6.ongazeover = function(){
      this.material = reticle.get_random_hex_material();
    }
    cube6.ongazeout = function(){
      this.material = reticle.default_material();
      if(CubeMaterialsList[5]) this.material = CubeMaterialsList[5];
    }
}

function createFloor(texture) {

  var geometry = new THREE.PlaneGeometry(boxWidth, boxWidth, boxWidth);
  var material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
  });

  floor = new THREE.Mesh(geometry, material);
    floor.position.x = 0;
    floor.position.y = -0.5;
    floor.position.z = -10;

    floor.rotation.x = Math.PI / 2;
  scene.add(floor);
  loadFloorTextures();
  changeFloorTexture();
}

var controlsResetPose = function(){

    controls.resetPose();
};

var toggleFullscreen = function(){

    enterFullscreen(renderer.domElement);
    effectController.inclination = 0;
    guiChanged();
};

var toggleVR = function(){
	vrDisplay.requestPresent([{source: renderer.domElement}]);
};

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

function guiChanged() {

  uniforms = sky.uniforms;
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

//################################################ new update sun position Function ##############
var loadSunPosition = function(data){

    actualSunPos = data;

    effectController.inclination = data.altitude;
    effectController.azimuth = data.azimuth;
    
    console.log(data);
    
    guiChanged();
};

var updateSunPosition = function(){

    effectController.inclination = actualSunPos.altitude;
    effectController.azimuth = actualSunPos.azimuth;
    
    console.log(actualSunPos);
    
    guiChanged();
};

var loadCubePositions = function(){

    var cubeSeparation = 5;
    var cubeDistance = -6;

    cube1.position.x = -12.5;
    cube2.position.x = cube1.position.x + cubeSeparation;
    cube3.position.x = cube2.position.x + cubeSeparation;
    cube4.position.x = cube3.position.x + cubeSeparation;
    cube5.position.x = cube4.position.x + cubeSeparation;
    cube6.position.x = cube5.position.x + cubeSeparation;

    cube1.position.x = cube2.position.x;
    cube6.position.x = cube5.position.x;

    cube2.position.x += 1.5;
    cube5.position.x -= 1.5;

    cube1.position.y = cubeSeparation/2;
    cube2.position.y = cubeSeparation/2;
    cube3.position.y = cubeSeparation/2;
    cube4.position.y = cubeSeparation/2;
    cube5.position.y = cubeSeparation/2;
    cube6.position.y = cubeSeparation/2;

    cube1.position.z = cubeDistance + 8;
    cube2.position.z = cubeDistance + 4;
    cube3.position.z = cubeDistance + 2;
    cube4.position.z = cubeDistance + 2;
    cube5.position.z = cubeDistance + 4;
    cube6.position.z = cubeDistance + 8;

    if (cube1 && cube2 && cube3 && cube4 && cube5 && cube6 && player) {
        cube1.position.x = player.position.x + cube1.position.x;
        cube2.position.x = player.position.x + cube2.position.x;
        cube3.position.x = player.position.x + cube3.position.x;
        cube4.position.x = player.position.x + cube4.position.x;
        cube5.position.x = player.position.x + cube5.position.x;
        cube6.position.x = player.position.x + cube6.position.x;

        cube1.position.z = player.position.z + cube1.position.z;
        cube2.position.z = player.position.z + cube2.position.z;
        cube3.position.z = player.position.z + cube3.position.z;
        cube4.position.z = player.position.z + cube4.position.z;
        cube5.position.z = player.position.z + cube5.position.z;
        cube6.position.z = player.position.z + cube6.position.z;
    }
};

var checkOverlapPosition = function(xz){
    socket.emit('checkOverlapPosition', xz);
};

var teleportPlayer = function(xz){
    player.position.x = xz;
    player.position.z = xz;
    updatePlayerData();
    socket.emit('updatePosition', playerData);
};

var loadTextGeometry = function(text){

    if (textMesh1) {scene.remove(textMesh1)};

    var textLoader = new THREE.FontLoader();
    textLoader.load('/fonts/helvetiker_regular.typeface.js', function (font){
        var cityText = new THREE.TextGeometry(text, {
            size: 4,
            height: 1,
            font: font
        });

        cityText.computeBoundingBox();
        cityText.computeVertexNormals();

        // material = new THREE.MultiMaterial( [
        //     new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
        //     new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
        // ] );

        var material = new THREE.MeshBasicMaterial({
          color: 0xE50000,
          side: THREE.DoubleSide,
          shading: THREE.FlatShading
        });

        centerOffsetText = -0.5 * ( cityText.boundingBox.max.x - cityText.boundingBox.min.x );

        textMesh1 = new THREE.Mesh( cityText, material );

        // textMesh1.position.x = player.position.x + centerOffsetText;
        // textMesh1.position.y = 16;
        // textMesh1.position.z = player.position.z - 24;

        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;

        scene.add( textMesh1 );
    });
};

var loadTimeGeometry = function(text){

    if (timeMesh1) {scene.remove(timeMesh1)};

    var textLoader = new THREE.FontLoader();
    textLoader.load('/fonts/helvetiker_regular.typeface.js', function (font){
        var cityText = new THREE.TextGeometry(text, {
            size: 2.5,
            height: 1,
            font: font
        });

        cityText.computeBoundingBox();
        cityText.computeVertexNormals();

        var material = new THREE.MeshBasicMaterial({
          color: 0xE50000,
          side: THREE.DoubleSide,
          shading: THREE.FlatShading
        });

        centerOffsetTime = -0.5 * ( cityText.boundingBox.max.x - cityText.boundingBox.min.x );

        timeMesh1 = new THREE.Mesh( cityText, material );

        // textMesh1.position.x = player.position.x + centerOffsetTime;
        // textMesh1.position.y = 16;
        // textMesh1.position.z = player.position.z - 24;

        timeMesh1.rotation.x = 0;
        timeMesh1.rotation.y = Math.PI * 2;

        scene.add( timeMesh1 );
    });
};

var updateTextPosition = function(){

    textMesh1.position.x = player.position.x + centerOffsetText;
    textMesh1.position.y = 14.5;
    textMesh1.position.z = player.position.z - 24;
};

var updateTimePosition = function(){

    timeMesh1.position.x = player.position.x + centerOffsetTime;
    timeMesh1.position.y = 10.5;
    timeMesh1.position.z = player.position.z - 24;
};

var loadTime = function(){
	if (timeMesh1) {scene.remove(timeMesh1)};
    time = new Date();
    lastHour = parseInt(time.getHours());
    setcurrentCityHour();
    timeText = lastHour + ":" + time.getMinutes() + ":" + time.getSeconds();
    lastSecond = time.getSeconds();
};

var updateTime = function(){
    if (timeMesh1) {
        updateTimePosition();
        time = new Date();
        if (lastSecond != time.getSeconds()) {
            if (timeMesh1) {scene.remove(timeMesh1)};
            loadTime();
            loadTimeGeometry(timeText);
        }
    }
};

var setcurrentCityHour = function(){
    if (currentCity == 1) { lastHour += 5; }
    if (currentCity == 2) { lastHour += 6; }
    if (currentCity == 3) { lastHour += 13; }
    if (currentCity == 4) { lastHour += 7; }
    if (currentCity == 5) { lastHour; }
    if (currentCity == 6) { lastHour; }

    if (lastHour >= 24) {lastHour -= 24;}
};

var createParticles = function(pColor){

    if (particles) {scene.remove(particles)};

    // Particles
    particles = new THREE.Object3D(),
      totalParticles = totalParticles,
      maxParticleSize = maxParticleSize,
      particleRotationSpeed = particleRotationSpeed,
      particleRotationDeg = 0,
      lastColorRange = [0, 0.3],
      currentColorRange = [0, 0.3],

    clock = new THREE.Clock();

    var particleTexture = THREE.ImageUtils.loadTexture('/img/particle.png'),
    spriteMaterial = new THREE.SpriteMaterial({
        map: particleTexture,
        color: pColor
    });

    for (var i = 0; i < totalParticles; i++) {
      var sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(particleScale, particleScale, 1.0);
      sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
      sprite.position.setLength(maxParticleSize * Math.random());
      sprite.material.blending = THREE.AdditiveBlending;
              
      particles.add(sprite);
    }
    // particles.position.x = player.position.x;
    // particles.position.y = player.position.y + 40;
    // particles.position.z = player.position.z;
    scene.add(particles);
};

var animateParticles = function(){
    particles.position.x = player.position.x;
    particles.position.y = player.position.y + particlesHeight;
    particles.position.z = player.position.z + 8;
    var elapsedSeconds = clock.getElapsedTime(),
      particleRotationDirection = particleRotationDeg <= 180 ? -1 : 1;
      particles.rotation.x = elapsedSeconds * particleRotationSpeed * particleRotationDirection;
};

var changeWeather = function(weather){
    console.log(weather);
    if (weather == 'Rain') {
        particleRotationSpeed = 2;
        maxParticleSize = 200;
        particlesHeight = 3;
        particleScale = 1;
        totalParticles = 500;
        createParticles(0x0089ff);
    }
    if (weather == 'Snow') {
        particleRotationSpeed = 0.5;
        maxParticleSize = 30;
        particlesHeight = 3;
        particleScale = 1;
        totalParticles = 80;
        createParticles(0xFFFFFF);
    }
    if (weather == 'Wind') {
        particleRotationSpeed = 2.5;
        maxParticleSize = 100;
        particlesHeight = 30;
        particleScale = 10;
        totalParticles = 50;
        createParticles(0x80B352);
    }
    if (weather == 'Thunderstorm') {
        particleRotationSpeed = 1;
        maxParticleSize = 50;
        particlesHeight = 2;
        particleScale = 100;
        totalParticles = 2;
        createParticles(0xcbcb37);
    }
    if (weather == 'Mist') {
        particleRotationSpeed = 0.02;
        maxParticleSize = 100;
        particlesHeight = 70;
        particleScale = 200;
        totalParticles = 20;
        createParticles(0x535a60);
    }
    if (weather == 'Clouds') {
        particleRotationSpeed = 0;
        maxParticleSize = 500;
        particlesHeight = 200;
        particleScale = 350;
        totalParticles = 30;
        createParticles(0x59616d);
    }
    if (weather == 'Clear') {
        particleRotationSpeed = 0.02;
        maxParticleSize = 200;
        particlesHeight = -40;
        particleScale = 100;
        totalParticles = 10;
        createParticles(0xFF8000);
    }
    if (weather == 'Clear sky') {
        particleRotationSpeed = 0.01;
        maxParticleSize = 100;
        particlesHeight = 60;
        particleScale = 100;
        totalParticles = 10;
        createParticles(0xFF8000);
    }
    if (weather == 'Few clouds') {
        particleRotationSpeed = 0.01;
        maxParticleSize = 100;
        particlesHeight = 60;
        particleScale = 100;
        totalParticles = 10;
        createParticles(0xFF8000);
    }
    if (weather == 'Scattered clouds') {
        particleRotationSpeed = 0.01;
        maxParticleSize = 100;
        particlesHeight = 60;
        particleScale = 100;
        totalParticles = 40;
        createParticles(0xFF8000);
    }
    if (weather == 'Broken clouds') {
        particleRotationSpeed = 0.01;
        maxParticleSize = 100;
        particlesHeight = 60;
        particleScale = 100;
        totalParticles = 40;
        createParticles(0xFF8000);
    }
    if (weather == 'Shower rain') {
        particleRotationSpeed = 0.01;
        maxParticleSize = 100;
        particlesHeight = 60;
        particleScale = 100;
        totalParticles = 200;
        createParticles(0xFF8000);
    }
    
};

var getCurrentWeather = function(data){
    
    var xmlhttp = new XMLHttpRequest();
    var url = 'http://api.openweathermap.org/data/2.5/weather?id=' + data + '&APPID=ef8b7eb31d34ca064d91c2efb54496ba';

    xmlhttp.onreadystatechange = function(){
        
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var currentWeather = JSON.parse(xmlhttp.responseText);
            changeWeather(currentWeather.weather[0].main);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    console.log(data);
};

var loadFloorTextures = function(){
    floorTextures = [];
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor1.png'));
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor2.png'));
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor3.png'));
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor4.png'));
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor5.png'));
    floorTextures.push(THREE.ImageUtils.loadTexture('/img/floor6.png'));
}

var changeFloorTexture = function(num = 1){
    num -= 1;
    if (num < 0) {num = 0};
    if (floor) {
        floor.color = 0x000000;
        floorTextures[num].wrapS = THREE.RepeatWrapping;
        floorTextures[num].wrapT = THREE.RepeatWrapping;
        floorTextures[num].repeat.set(300, 300);
        floorTextures[num].anisotropy = 16;
        floor.material.map = floorTextures[num];
        floor.color = 0xFFFFFF;
    }
}