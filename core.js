
//variables
	var scene; 
	var camera; 
	var camControls;
	var renderer;
	var geometry;
	var material;
	var plane;
	var planeWidth = 2;
	var planeHeight = 2;
	var planeSubDiv = 100;
	var lastTime = Date.now();
	var currentTime = 0;
	var deltaTime = 0;
	var PI = 3.14159;
	var mouseVec;
	//var projector;
	var raycaster; //?
	var directionalLight;
	var pointLight;
	
	var vertIndex = 0;
	var verts;
	var gui = new dat.GUI();
	var savedInt = 0;
	var GradientGrid;
	
	var LineMat;
	var lineMesh;
	var raycaster;

	var delay = 30;
	var LSys;

	//base stuff
	var basicMaterial;

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	camControls = new THREE.OrbitControls(camera);
	camControls.addEventListener( 'change', render);
	
	geometry = new THREE.PlaneGeometry(planeWidth,planeHeight,planeSubDiv,planeSubDiv);  //range is 0 to 10200 or x0-100 y0-100
	geometry.translate(0,0,-0.003)
	material = new THREE.MeshLambertMaterial( { color: 0x002200 } );
	plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	
	directionalLight = new THREE.DirectionalLight( 0x555555, 100 );
	directionalLight.position.set( 1, 10,1 );
	directionalLight.rotation.x = 0.8;
	scene.add( directionalLight );
	
	LineMat = new THREE.LineBasicMaterial( { color: 0x444444 } );
	//projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();
	raycaster.linePrecision = 0.001;

	basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff5555	});

	camera.position.z = 2;
	camera.position.y = -1; //lil hight boost, lil less
	camera.position.x = 0; 
	camera.rotation.x = 0.5;

	document.addEventListener("keydown",onDocumentKeyDown,false);
	//if (mode == 2){	document.addEventListener("mousedown",onDocumentMouseDown,false);}
	window.addEventListener("resize", onWindowResize, false);
	
	
	Math.seedrandom(0)
	console.log(Math.random());
	
	
	options = {
		randomSeed: 10
	};
	
	gui.add(options, "randomSeed", 0, 30);
	
	//drawLine(1,1,0,0);
	//recursiveLine([0,0], 0, 4);
	
	//debugFunc();

	var vec2 = new THREE.Vector2(1,0);
	console.log(vec2);
	var vec22 = vec2.rotateAround({x:0, y:0}, Math.PI/2);
	console.log(vec2);
	console.log(vec22);
	

	LSys = new LSystem(); 
	LSys.Seed();
	//what is this passed?  A city type?  a seed?  Do I create many
	//and those are placed out in the world and eventually connect to each other?
	//Do I need an infulence map?
	//can I create that in code and generate it procedurally?
	//do I even need to worry about that at the moment?
	//is there a good way to get the road system to build visably
	//probably by starting it here and having it update the stack once per update
	

}

function debugFunc(){
	var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.01,0.01,0.01), basicMaterial);
	scene.add(mesh);
	var mesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.01,0.01,0.01), basicMaterial);
	scene.add(mesh2);
	mesh.position.set(0,0,0);
	var x = 0.3;
	var y = 0.4;
	mesh2.position.set(x,y,0);
	var ang = Math.atan2(y, x);
	drawLine(0,0,Math.cos(ang), Math.sin(ang));

	var tes = { 
		name : "hello",
		angle: 16,
		list: [1,3,5,3]
	};
	console.log(tes.name);
	console.log(tes.angle);
	console.log(tes.list[2]);
}

function drawLine(point1x, point1y, point2x, point2y){
	var geo = new THREE.Geometry();
	geo.vertices.push(new THREE.Vector3(point1x, point1y, 0), new THREE.Vector3(point2x, point2y, 0));
	var mesh = new THREE.Line(geo, LineMat);
	scene.add(mesh);
}

function drawLineAngle(point1x, point1y, angle){
	var point2x = Math.cos(angle)*0.01 + point1x;
	var point2y = Math.sin(angle)*0.01 + point1y;
	if (checkOverlap([point1x, point1y,0], [point2x, point2y, 0]) == false){
		drawLine(point1x, point1y, point2x, point2y);
		return [point2x, point2y];
	} else {
		return false;
	}
}

function recursiveLine(last, angle, step){
	console.log(step);
	if (step == 0){	return 0;}	
	else{step = step - 1;}
	angle += (Math.random() - 0.5);
	//would change angle or branch here
	last = drawLineAngle(last[0], last[1], angle);
	if (last != false){	//check to see if the road section did not overlap
		recursiveLine(last, angle, step); 
		if (Math.random() > 0.9){
			//angle = angle+PI/2;
			recursiveLine(last, angle+PI/2, step);
		}
	return 0;
	}
}

function render() {
	if (delay == 30){
		delay = 0;
		LSys.Expand();
	}
	delay++;
	//cycleVerts();
	currentTime = Date.now();
	deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	//console.log(deltaTime);
	requestAnimationFrame(render);	
	renderer.render(scene, camera);
}

function onDocumentMouseDown(event){
	event.preventDefault();
	/* //the good one
	mouseVec = new THREE.Vector3(
			2* (event.clientX / window.innerWidth) - 1,
			1 - 2*(event.clientY / window.innerHeight),
			0 );
	*/
	mouseVec = new THREE.Vector3(
			2* (event.clientX / window.innerWidth) - 1,
			1 - 2*(event.clientY / window.innerHeight),
			0 );
/*
	raycaster = projector.pickingRay( mouseVec.clone(), camera);
	var intersects = raycaster.intersectObjects(arrayOfOnePlane);
	if (intersects.length > 0){
		//uhhhhhh
	}
	*/

	
}

function onWindowResize(){
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentKeyDown(event){
	//console.log("\n\n\nKEYY\n\n\n");
	var keyCode = event.which;
	//console.log(keyCode);
	var w=87;
	var s=83;
	var a=65;
	var d=68;
	var space=32;
	var q=81;
	var e=69;
	var z=90;
	var x=88;
	var c=67;
	var v=86;
	var f=70;
	var g=71;
	var comma=188;
	var period=190;
	/*
	if (cursorLead != undefined){
		if (keyCode == d){ 
			cursorLead.xLoc += 0.01;
		}
		else if (keyCode == a){
			cursorLead.xLoc -= 0.01;
		}
		else if (keyCode == w){
			cursorLead.yLoc += 0.01;
		}
		else if (keyCode == s){
			cursorLead.yLoc -= 0.01;
		}
		else if (keyCode == space){
			cubeAcc -= 0.5;
		}
		cursorLead.update();
	}
	else if(mode == 2 && (obstacles.length != 0 || keyCode == space)){
	//else if(obstacles.length != 0 || keyCode == space){
		if (keyCode == d){
			obstacles[obsIndex].move(0.01,0);
		}
		else if (keyCode == a){
			obstacles[obsIndex].move(-0.01,0);
		}
		else if (keyCode == w){
			obstacles[obsIndex].move(0,0.01);
		}
		else if (keyCode == s){
			obstacles[obsIndex].move(0,-0.01);
		}
		else if(keyCode == z){
			obstacles[obsIndex].expand(0.01,0);
		}
		else if(keyCode == x){
			obstacles[obsIndex].expand(-0.01,0);
		}
		else if(keyCode == c){
			obstacles[obsIndex].expand(0,0.01);
		}
		else if(keyCode == v){
			obstacles[obsIndex].expand(0,-0.01);
		}
		else if(keyCode == q){
			obstacles[obsIndex].rotate(0.01);
		}
		else if(keyCode == e){
			obstacles[obsIndex].rotate(-0.01);
		}
		else if(keyCode == f){ //<<<
			if (obsIndex == 0){	obsIndex = obstacles.length - 1;	}
			else{	obsIndex -= 1; }
		}
		else if(keyCode == g){ //>>>
			if (obsIndex == obstacles.length - 1){ obsIndex = 0; }
			else{	obsIndex += 1; }
		}
		else if (keyCode == space){
			obstacles[obstacles.length] = new Obstacle();
			obsIndex = obstacles.length - 1;
		}
	}
	if ( formation != 0 ){
		if (keyCode == comma){
			for (i=0; i<followers.length; i++){
				if (followers[i].inFormation == true){
					followers[i].leaveFormation();
					break;
				}
			}
		}
		else if (keyCode == period){
			formation.addSlot();
		}
	}
	*/
}

//this is an experiement
THREE.Vector2.prototype.rotateAround = function ( center, angle ) {

		var c = Math.cos( angle ), s = Math.sin( angle );

		var x = this.x - center.x;
		var y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;

}  




