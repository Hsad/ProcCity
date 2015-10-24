function LSystem(){
	this.stack = [];
	this.cityCenter = new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5);
	this.roadDistance = 0.05;
	this.origin = new RoadNode(0,0);
}

LSystem.prototype.Seed = function(){
	var uhh = {
		name: "Forward",
		angle:0,
		angleVec: new THREE.Vector2(1,0),
		oldNode: this.origin,
		decay: 30
	};
	this.stack.push(uhh);
	var uh = {
		name: "Forward",
		angle:2,
		angleVec: new THREE.Vector2(1,0),
		oldNode: this.origin,
		decay: 30
	};
	this.stack.push(uh);
	var hh = {
		name: "Forward",
		angle:-2,
		angleVec: new THREE.Vector2(1,0),
		oldNode: this.origin,
		decay: 30
	};
	this.stack.push(hh);
}

LSystem.prototype.Expand = function(steps){
	steps = steps || 1;
	while (steps > 0){
		steps--;
		if (this.stack.length > 0){
			var rule = this.stack.shift();
			this.UseRule(rule);
		}
	}
}

LSystem.prototype.UseRule = function(rule){
	//rule();  //If that is doable that would be swell
	if (rule.name == "Forward"){
		//look at current node, look at someother peice of data, add another segment of road
		this.Forward(rule);
	} else if (rule.name == "Concentric"){
		this.Concentric(rule);
	}
}

LSystem.prototype.Concentric = function(rule){
	if (rule.decay <= 0){ //Doesn't seem to mind if rule.decay doesn't exist
		return null;
	} else{
		rule.decay--;
	}
	var oldNodeLoc = rule.oldNode.PosVec;

	var centToOldNode = new THREE.Vector2(
			oldNodeLoc.x - this.origin.PosVec.x, 
			oldNodeLoc.y - this.origin.PosVec.y);

	var ab = centToOldNode.lengthSq(); //counts as a*a or b*b

	var c = this.roadDistance;

	var ang = Math.acos((ab + ab - c*c) / (2*ab));
	//based on the given angle of the last road, if the angle of it
	//Minus?? the sign of the offset angle, then if the angle is neg, left, 
	//otherwise right
	var centToAngle = Math.atan2(centToOldNode.y, centToOldNode.x);
	//console.log(ang);
	//console.log(centToAngle);
	var leftOrRight = rule.angle - centToAngle;//ang+Math.PI - centToAngle+Math.PI;
	//console.log(leftOrRight);

	if (leftOrRight > 0){
		//console.log("GREATER THAN");
		var newNodeVec = centToOldNode.rotateAround( this.origin.PosVec, ang);
		var newRoad = new RoadNode(newNodeVec);
		this.drawRoadFromNodes(rule.oldNode, newRoad);
	}
	else if (leftOrRight < 0){
		//console.log("LESS THAN");
		var newNodeVec = centToOldNode.rotateAround( this.origin.PosVec, -ang);
		var newRoad = new RoadNode(newNodeVec);
		this.drawRoadFromNodes(rule.oldNode, newRoad);
	}
	else{
		console.log("WEIRDLY STRAIGHT LINE AROUND THE CENTER");
		return null;
	}
	var newAng = Math.atan2(centToOldNode.y - oldNodeLoc.y, centToOldNode.x - oldNodeLoc.x);
	var newRule = { name:"Concentric", angle:newAng, angleVec:rule.angleVec,
		oldNode:newRoad, decay:rule.decay	};
	this.stack.push(newRule);	
	
	if (Math.random() > 0.7){
		var newRule2 = {name:"Forward", 
			angle:newAng + Math.PI/2 * randPlusMin(), angleVec:rule.angleVec,
			oldNode:newRoad, decay:rule.decay/2};
		this.stack.push(newRule2);	
	}
}

LSystem.prototype.Forward = function(rule){
	if (rule.decay <= 0){ //Doesn't seem to mind if rule.decay doesn't exist
		return null;
	} else{
		rule.decay--;
	}
	//console.log(rule.angle);
	//do the forward road builfing stuff
	//create node, that is at oldnode+distance in angle direction
	//start with a standard distance
	var x = Math.cos(rule.angle);
	var y = Math.sin(rule.angle);
	var vec = new THREE.Vector2(x, y);
	//var vec = new THREE.Vector2().copy(rule.angleVec);
	vec.multiplyScalar(this.roadDistance);
	vec.add(rule.oldNode.PosVec);
	var newNode = new RoadNode(vec); 
	//need to connect nodes
	//test node for intersection
	//might even want to hand off to another level of abstraction
	//would I want it to return here or go off elsewhere and finish?
	newNode.GiveParent(rule.oldNode);
	//call road drawing, probably?
	this.drawRoadFromNodes(rule.oldNode, newNode);
	//add another rule to the stack for more road
	var newRule = {name:"Forward", angle:rule.angle, 
		angleVec:rule.angleVec, oldNode:newNode, decay:rule.decay};
	this.stack.push(newRule);	
	if (Math.random() > 0.7){
		var newRule2 = {name:"Concentric", 
			angle:rule.angle + Math.PI/2 * randPlusMin(), angleVec:rule.angleVec,
			oldNode:newNode, decay:rule.decay/2};
		this.stack.push(newRule2);	
	}
}

LSystem.prototype.drawRoadFromNodes = function(node1, node2){
	drawLine(node1.PosVec.x, node1.PosVec.y, node2.PosVec.x, node2.PosVec.y);
}

function randPlusMin(){
	if (Math.random() > 0.5){
		return 1;
	}
	else{
		return -1;
	}
}
