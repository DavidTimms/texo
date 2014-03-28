var list = require("../texo.js");

function range (n) {
	var numbers = [];
	for (var i = 0; i < n; i++) {
		numbers.push(i);
	}
	return numbers;
}

function consRange (n) {
	var numbers = list();
	for (var i = 0; i < n; i++) {
		numbers = numbers.append(i);
	}
	return numbers;
}

function sumArray (items) {
	var total = 0;
	while (items.length > 0) {
		total += items[0];
		items = items.slice(1);
	}
	return total;
}

function sumArrayRA (items) {
	var total = 0;
	for (var i = 0; i < items.length; i++) {
		total += items[i];
	}
	return total;
}

function sumReduce (items) {
	return items.reduce(function (a, b) {return a + b});
}

function sumList (items) {
	var total = 0;
	while (items.count > 0) {
		total += items(0);
		items = items.slice(1);
	}
	return total;
}

function sumListRA (items) {
	var total = 0;
	for (var i = 0; i < items.count; i++) {
		total += items(i);
	}
	return total;
}

function mapTest (items) {
	return items
		.map(function (x) {return x * 2})
		.map(function (x) {return x / 3})
		.map(function (x) {return x + 8})
		.map(function (x) {return x - 9})[0];
}

function LazyMapTest (items) {
	return items
		.lazyMap(function (x) {return x * 2})
		.lazyMap(function (x) {return x / 3})
		.lazyMap(function (x) {return x + 8})
		.lazyMap(function (x) {return x - 9})
		.flatten()(0);
}

function time (name, func) {
	var start = Date.now();
	var result = func.apply(null, Array.prototype.slice.call(arguments, 2));
	console.log(name + ": " + (Date.now() - start) + "ms", "result: " + result);
}

var testArray =    range(1000000);
var testList = list.fromArray(testArray).append(8);

//// run once for JIT warmup
sumArrayRA(testArray);
sumReduce(testArray);
sumListRA(testList);
sumReduce(testList);

//time("JS Array", sumArray, testArray);
time("JS Array Random Access", sumArrayRA, testArray);
time("JS Array Reduce", sumReduce, testArray);
//time("Immutable List", sumList, testList);
time("Immutable List Random Access", sumListRA, testList);
time("Immutable List Reduce", sumReduce, testList);


time("JS Array Map", mapTest, testArray);
time("Immutable List Lazy Map", LazyMapTest, testList);