$('#create').mousedown(function(e) {
	createRandomPool();
});

$('#train1').mousedown(function(e) {
	train("neat");
});

function createRandomPool() {
	document.getElementById("notification2").innerHTML = "Constructing a random pool. Please wait...";
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest
	// instance
	xmlhttp.open("POST", "/neat");
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("notification2").innerHTML ="Random Pool created. You can see the Pool to the right.";
			var jsonResponse = JSON.parse(this.responseText);
			printGenomes(jsonResponse);
		}
	};
	xmlhttp.send();
}

function train(type) {
	document.getElementById("notification2").innerHTML = "Stepping forward a generation. Please wait...";
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest
	// instance
	xmlhttp.open("PUT", "/" + type);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("notification2").innerHTML = "Generation progressed. You can see the Pool to the right.";
			var jsonResponse = JSON.parse(this.responseText);
			printGenomes(jsonResponse);
			if (document.getElementById("train4").checked) {
				train(type);
			}
		}
	};
	xmlhttp.send();
}

function printGenomes(jsonResponse) {
	document.getElementById("result").innerHTML = "";
	document.getElementById("notification3").innerHTML = "Best Fitness Score is: "
			+ jsonResponse[0]['fitnessScore'];
	for (var j = 0; j < 8; j++) {
		printSingleGenome(jsonResponse[j]);
	}
}

function printSingleGenome(jsonResponseSingle) {
	var mynetwork = document.createElement("div");
	mynetwork.className = "mynetwork";
	var result = document.getElementById("result");
	result.appendChild(mynetwork);
	// create an array with nodes
	var xnodes = [];
	for ( var i in jsonResponseSingle['nodeGenesSorted']) {
		var item = jsonResponseSingle['nodeGenesSorted'][i];
		var color = "LightBlue";
		var level = 1;
		if (item.type == "INPUT") {
			color = "LightGreen";
			level = 0;
		}
		if (item.type == "OUTPUT") {
			color = "lightsalmon";
			level = 2;
		}
		xnodes.push({
			"id" : item.id,
			"label" : item.referenceNodeNumber.toString(),
			"color" : color,
			"level" : level
		});
	}
	var nodes = new vis.DataSet(xnodes);

	// create an array with edges
	var xconnections = [];
	for ( var i in jsonResponseSingle['connectionGenesSorted']) {
		var item = jsonResponseSingle['connectionGenesSorted'][i];
		xconnections.push({
			"from" : item.fromNode.id,
			"to" : item.toNode.id,
			"label" : item.weight.toFixed(1).toString(),
			"width" : 3,
			"arrows":'to'
		});
	}
	var edges = new vis.DataSet(xconnections);

	// create a network
	var container = mynetwork;
	var data = {
		nodes : nodes,
		edges : edges
	};
	//var options = {layout:{randomSeed:2}};
    var options = {
            edges: {
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.4
                }
            },
            layout: {
                hierarchical: {
                    direction: "LR"
                }
            },
            physics:false
        };
	var network = new vis.Network(container, data, options);
}