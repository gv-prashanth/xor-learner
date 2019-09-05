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
	
	const m = new Map();
	for (var j = 0; j < jsonResponse['sortedGenomes'].length; j++) {
		if(m.has(jsonResponse['sortedGenomes'][j]['referenceSpeciesNumber'])){
			m.set(jsonResponse['sortedGenomes'][j]['referenceSpeciesNumber'],m.get(jsonResponse['sortedGenomes'][j]['referenceSpeciesNumber'])+1);
		}else{
			m.set(jsonResponse['sortedGenomes'][j]['referenceSpeciesNumber'], 1);
		}
	}
	
	document.getElementById("notification3").innerHTML = "Generation finished: " + jsonResponse['referenceGenerationCounter'] + "<br>Best fitness in pool: "+ jsonResponse['sortedGenomes'][0]['fitnessScore']+"<br>Species population: "+[...m.values()]+"<br>Nodes Map is: "+jsonResponse['nodesMap'];

	
	for (var j = 0; j < 2; j++) {
		printSingleGenome(jsonResponse['sortedGenomes'][j]);
	}
}

function printSingleGenome(jsonResponseSingle) {
	var mynetwork = document.createElement("div");
	mynetwork.className = "mynetwork";
	var result = document.getElementById("result");
	result.appendChild(mynetwork);
	// create an array with nodes
	var xnodes = [];
	var level = 0;
	for ( var i in jsonResponseSingle['nodeGenesSorted']) {
		var item = jsonResponseSingle['nodeGenesSorted'][i];
		if (item.type == "INPUT") {
			color = "LightGreen";
			xnodes.push({
				"id" : item.id,
				"label" : item.referenceNodeNumber.toString(),
				"color" : color,
				"level" : level
			});
		}
	}
	for ( var i in jsonResponseSingle['nodeGenesSorted']) {
		var item = jsonResponseSingle['nodeGenesSorted'][i];
		if (item.type == "HIDDEN") {
			level++;
			color = "LightBlue";
			xnodes.push({
				"id" : item.id,
				"label" : item.referenceNodeNumber.toString(),
				"color" : color,
				"level" : level
			});
		}
	}
	level++;
	for ( var i in jsonResponseSingle['nodeGenesSorted']) {
		var item = jsonResponseSingle['nodeGenesSorted'][i];
		if (item.type == "OUTPUT") {
			color = "lightsalmon";
			xnodes.push({
				"id" : item.id,
				"label" : item.referenceNodeNumber.toString(),
				"color" : color,
				"level" : level
			});
		}
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
	// var options = {layout:{randomSeed:2}};
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
                    direction: "LR",
                    levelSeparation: 75
                }
            },
            physics:false
        };
	var network = new vis.Network(container, data, options);
}