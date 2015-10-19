function LSystem(){
	this.stack = [];
	this.cityCenter = new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5);

}

LSystem.prototype.Expand = function(steps = 1){
	while (steps > 0){
		if (this.stack.length > 0){
			var rule = this.stack.shift();
			LSystem.useRule(rule);
		}
	}
}

LSystem.prototype.UseRule = function(rule){
	//rule();  //If that is doable that would be swell
	if (rule.name == "Forward"){
		//look at current node, look at someother peice of data, add another segment of road
		LSystem.Forward(rule);
	}
}

LSystem.prototype.Forward = function(rule){
	//do the forward road builfing stuff
}
