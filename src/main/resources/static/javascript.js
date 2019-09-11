$('#create').mousedown(function(e) {
	createRandomPool();
});

$('#train1').mousedown(function(e) {
	train("neat");
});

$('#identify').mousedown(function(e) {
	identify();
});

$('#train4').click(function(e) {
	if (!document.getElementById("train4").checked) {
		document.getElementById("train1").disabled = false;
	}
});

var jsonResponse;

function identify(){
	document.getElementById("notification4").innerHTML = "Running the input on the network. Please wait...";
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest
	// instance
	
	var e = document.getElementById("input1");
	var input1 = e.options[e.selectedIndex].value;
	var f = document.getElementById("input2");
	var input2 = f.options[f.selectedIndex].value;
	
	xmlhttp.open("GET", "/output?input1="+input1+"&input2="+input2);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var resp = JSON.parse(this.responseText);
			document.getElementById("result2").innerHTML = "";
			document.getElementById("notification4").innerHTML ="The resut on best Genome for given input is "+resp[0].toFixed(1);
			printSingleGenome(jsonResponse['genomes'][0], document.getElementById("result2"), "mynetwork2");
		}
	};
	xmlhttp.send();
}

function createRandomPool() {
	document.getElementById("notification2").innerHTML = "Constructing a random pool. Please wait...";
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest
	// instance
	xmlhttp.open("POST", "/neat");
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("notification2").innerHTML ="Random Pool created. You can see the Pool to the right.";
			jsonResponse = JSON.parse(this.responseText);
			printGenomes(jsonResponse);
		}
	};
	xmlhttp.send();
}

function train(type) {
	if (document.getElementById("train4").checked) {
		document.getElementById("train1").disabled = true;
	}
	
	document.getElementById("notification2").innerHTML = "Stepping forward a generation. Please wait...";
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest
	// instance
	xmlhttp.open("PUT", "/" + type);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("notification2").innerHTML = "Generation progressed. You can see the Pool to the right.";
			jsonResponse = JSON.parse(this.responseText);
			printGenomes(jsonResponse);
			if (document.getElementById("train4").checked) {
				var event = new Event('doAgain');
				document.getElementById("notification3").dispatchEvent(event);
				//train(type);
			}
		}
	};
	xmlhttp.send();
}

document.getElementById("notification3").addEventListener('doAgain', function(){ train("neat"); });

function printGenomes(jsonResponse) {
	document.getElementById("result").innerHTML = "";
	
	const m = new Map();
	const n = new Map();
	for (var j = 0; j < jsonResponse['genomes'].length; j++) {
		if(n.has(jsonResponse['genomes'][j]['nodeGenes'].length)){
			n.set(jsonResponse['genomes'][j]['nodeGenes'].length, n.get(jsonResponse['genomes'][j]['nodeGenes'].length)+1);
		}else{
			n.set(jsonResponse['genomes'][j]['nodeGenes'].length, 1);
		}
		if(m.has(jsonResponse['genomes'][j]['referenceSpeciesNumber'])){
			m.set(jsonResponse['genomes'][j]['referenceSpeciesNumber'], m.get(jsonResponse['genomes'][j]['referenceSpeciesNumber'])+1);
		}else{
			m.set(jsonResponse['genomes'][j]['referenceSpeciesNumber'], 1);
		}
	}
	
	document.getElementById("notification3").innerHTML = "Generation finished: " + jsonResponse['referenceGenerationCounter'] + "<br>Best fitness in pool: "+ jsonResponse['genomes'][0]['fitnessScore']+"<br>Species population: "+[...m.values()]+"<br>Nodes Map is: "+ JSON.stringify(Array.from( n.entries()));;

	
	for (var j = 0; j < jsonResponse['genomes'].length; j++) {
		printSingleGenome(jsonResponse['genomes'][j], document.getElementById("result"), "mynetwork");
	}
}

function printSingleGenome(jsonResponseSingle, result, className) {
	var mynetwork = document.createElement("div");
	mynetwork.className = className;
	result.appendChild(mynetwork);
	// create an array with nodes
	var xnodes = [];
	var level = 0;
	for ( var i in jsonResponseSingle['nodeGenes']) {
		var item = jsonResponseSingle['nodeGenes'][i];
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
	for ( var i in jsonResponseSingle['nodeGenes']) {
		var item = jsonResponseSingle['nodeGenes'][i];
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
	for ( var i in jsonResponseSingle['nodeGenes']) {
		var item = jsonResponseSingle['nodeGenes'][i];
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
	for ( var i in jsonResponseSingle['connectionGenes']) {
		var item = jsonResponseSingle['connectionGenes'][i];
		xconnections.push({
			"from" : item.fromNode.id,
			"to" : item.toNode.id,
			"label" : item.referenceInnovationNumber.toString(),
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
//                    levelSeparation: 75
                }
            },
            interaction: {dragNodes: false, dragView: false, hoverConnectedEdges: false, selectable :false, selectConnectedEdges: false, zoomView: false},
            physics: {
                enabled: false
            },
        };
	var network = new vis.Network(container, data, options);
}