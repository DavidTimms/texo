var List = require("../texo.js");
var range = List.range;

// HELPERS

// print to the page if running in a browser
var log = typeof(window) === "undefined" ?
	console.log.bind(console) :
	function printToPage() {
		var s = Array.prototype.join.call(arguments, " ");
		document.body.innerHTML += s;
	};

var allPassed = true;
var testNumber = 0;
function test(res, expected) {
	expected = arguments.length < 2 ? true : expected;
	var num = testNumber++;
	if (res === expected || 
		(	res instanceof List && 
			expected instanceof Array && 
			same(res, expected)
		) || (
			res instanceof List && 
			expected instanceof List &&
			List.eq(res, expected)
		)) 
		return true;
	else {
		allPassed = false;
		log("test", num, "failed");
		log("expected:", expected);
		log("found:", res);
	}
}

function same(list, arr) {
	return list.length === arr.length &&
		arr.every(function (item, i) { return item === list.at(i) });
}

// TESTS

// an example data type
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.toString = function () {
	return "(" + this.x + "," + this.y + ")";
}
Point.prototype.distanceTo = function (p2) {
	return Math.sqrt(Math.pow(this.x - p2.x, 2) + Math.pow(this.y - p2.y, 2));
}
var a = new Point(3, 4), b = new Point(2, 6), c = new Point(9, 1);

// basic operation
test(List().at(0), undefined);
test(List(1, 2, 3), [1, 2, 3]);
test(new List("a", "b"), ["a", "b"]);

// toString and join
test(List().toString(), "[]");
test(List("a", "b", "c").toString(), "[a,b,c]");

test(List().join(), "");
test(List("1", "2", "3").join(0), "10203");
test(List("here", "there").join(" -> "), "here -> there");

// toArray
test(List().toArray().concat(["a"]).toString(), ["a"].toString());
var arr = List("a", "b").toArray();
test(arr[0], "a");
test(arr[1], "b");
test(arr[2], undefined);

// flattenTree
var list = List("foo", "bar", "buzz");
test(list.flattenTree(), list);

// List.range
test(range(4, 9), [4, 5, 6, 7, 8]);
test(range(2, -2), [2, 1, 0, -1]);
test(range(3), [0, 1, 2]);
test(range(0), []);
test(range(-1), [0]);
test(range().at(956), 956);
test(range().at(-2), undefined);

// concat
test(List().concat(List()), List());
test(List(1, 2, 3).concat(List(4, 5)), [1, 2, 3].concat([4, 5]));
test(List("a").concat("b"), ["a"].concat("b"));
test(List(1).concat("bar").concat("foo"), [1].concat("bar").concat("foo"));

// append
test(List().append(List()), List(List()));
test(List(6, 7, 8).append(), [6, 7, 8]);
test(List("foo").append("bar", "buzz"), ["foo", "bar", "buzz"]);
test(List().append(2, 3, 4).append(5, 6, 7), [2, 3, 4, 5, 6, 7]);

// prepend
test(List().prepend(List()), List(List()));
test(List(1, 2, 3).prepend(), [1, 2, 3]);
test(List("a", "b").prepend("c", "d"), ["c", "d", "a", "b"]);
test(List().prepend(2, 3, 4).prepend(5, 6, 7), [5, 6, 7, 2, 3, 4]);

// replace
test(List().replace(2, "foo"), [undefined, undefined, "foo"]);
test(List(1, 2, 3, 4).replace(0, 5), [5, 2, 3, 4]);
test(List("a", "b", "c").replace(-1, "q"), ["a", "b", "q"]);
test(List("foo", "bar").replace(0, 1).replace(1, 2), [1, 2]);
test(range().replace(952).at(952), undefined);

// insertAt
test(List().insertAt(1, "foo"), [undefined, "foo"]);
test(range(4).insertAt(2, 99), [0, 1, 99, 2, 3]);
test(List().insertAt(0, a).insertAt(0, b).insertAt(0, c), [c, b, a]);
test(range(2, 6).insertAt(-2, 888), [2, 3, 888, 4, 5]);

// removeAt
test(List().removeAt(4), []);
test(range(5).removeAt(0), [1, 2, 3, 4]);
test(range(4, 8).removeAt(2).removeAt(2), [4, 5]);
test(range(20).insertAt(13, 66).removeAt(13), range(20));

// slice
test(range(5).slice(), range(5));
test(range(5).slice(2), [2, 3, 4]);
test(range(5).slice(1, -1), [1, 2, 3]);
test(range(5).slice(-2, -4), [1, 2]);
test(range(5).slice(-1), [4]);
test(range(5).slice(10, 0), [0, 1, 2, 3, 4]);
test(List().slice(20, 50), List());
test(range(8).slice(2).slice(0, -2).slice(1), [3, 4, 5]);
test(range(5).slice(0, 2).slice(0, 4), [0, 1]);

// first, rest and last
test(range(2, 10).first(), 2);
test(List(a, b, c).rest(), [b, c]);
test(range(3).rest().prepend(range(3).first()), range(3));
test(range(10).last(), range(10).at(-1));
test(range(10).append(3).last(), 3);

// reverse
test(range(4).reverse(), [3, 2, 1, 0]);
test(range(100).reverse().reverse(), range(100));
test(List("foo", "bar", "buzz").slice(1).reverse(), ["buzz", "bar"]);

// sort
test(range(10).sort(), range(10));
test(range(4).sort(backwards), range(4).reverse());
test(List(a, b, c).sort("x"), [b, a, c]);

// forEach
var total = 0;
function sideEffectSum(value, i) {
	total += value + i;
}
test((range(10).forEach(sideEffectSum), total), (1+2+3+4+5+6+7+8+9)*2);

// map
test(List().map(square), []);
test(range(4).map(square), [0, 1, 2, 3].map(square));
test(List("foo","bar","baz").map(exclaim), ["foo!","bar!","baz!"]);
test(List(a, b, c).map("y"), [4, 6, 1]);

// lazyMap
test(List().lazyMap(square), []);
test(range(5).lazyMap(square), range(5).map(square));
test(List("foo","bar","baz").lazyMap(exclaim), ["foo!","bar!","baz!"]);
test(List(a, b, c).lazyMap("y"), [4, 6, 1]);

// pluck
test(List().pluck("key"), []);
test(List(a, b, c).pluck("x"), [3, 2, 9]);
test(List(c, b, 6).pluck("y"), [1, 6, undefined]);

// invoke
test(List(a, b, c).invoke("toString"), ["(3,4)", "(2,6)", "(9,1)"]);
test(List(c, b, a).invoke("distanceTo", new Point(0, 0)), 
	[c, b, a].map(function (p) { return p.distanceTo(new Point(0, 0))}));

// reduce and reduceRight
test(List().reduce(55, product), 55);
test(range(1, 10).reduce(product), range(1, 10).reduceRight(product));
test(List(a, b, c).reduce(0, sumXs), [a, b, c].reduce(sumXs, 0));
test(range(50).reduce(foldMap(square)), range(50).map(square));
test(range(15).reduceRight(0, inc), 15);

// filter
test(List().filter(), []);
test(List(1, 0, null, 4, false, true, undefined).filter(), [1, 0, 4, true]);
test(List(34, 23, 0, null, 9, undefined).filter(Boolean), [34, 23, 9]);
test(List(false, "3", "0").filter(Number), ["3"]);
test(range(40).filter(lessThan(20)), range(20));

// every
test(List().every(), true);
test(List(1, 5, 3).every(lessThan(6)), true);
test(range(10).every(lessThan(3)), false);
test(range().every(lessThan(99)), false);
test(range(5).every(isAscending), true);
test(range(5).insertAt(2, 8).every(isAscending), false);
test(List(false).every(), false);
test(List(true, 34, 0).every(), true);

// some
test(List().some(), false);
test(List(3, 8, 9).some(lessThan(4)), true);
test(List(78, 45 ,99).some(lessThan(30)), false);
test(List(false, null, undefined).some(), false);
test(List(false, null, undefined, 1).some(), true);

// indexOf
test(List().indexOf(6), List.notFound);
test(range(10).indexOf(3), 3);
test(range(5).concat(range(5)).indexOf(2, 3), 7);
test(List(a, b, c).indexOf(a), 0);
test(List(a, b, c).indexOf(88), -1);
test(range(4).map(function (i) { return range(i) }).indexOf(range(2)), 2);


// lastIndexOf
test(List().lastIndexOf(a), List.notFound);
test(range(10).lastIndexOf(6), 6);
test(range(5).concat(range(5)).lastIndexOf(0, 4), 0);
test(List(a, b, c, a, c, b).lastIndexOf(c), 4);
test(List(a, b, c).lastIndexOf(33), -1);
test(range(4).map(function (i) { return range(i) }).lastIndexOf(range(3)), 3);



// List.eq
test(new List(), List());
test(List(1, 2, 3), List(1, 2, 3));
var xs = List(a, b, c), ys = List(a, b, c);
test(xs.at !== ys.at);
test(xs, ys);
test(xs.at === ys.at);

// List.of
test(List.of(5, "a"), ["a", "a", "a", "a", "a"]);
test(List.of(3, 55), [55, 55, 55]);
test(List.of(Infinity, "foo").slice(0, 3), ["foo", "foo", "foo"]);

//List.variadic
var vsum = List.variadic(sum);
test(vsum(3, 6, 8, 4), sum(List(3, 6, 8, 4)));

var dropFirst = List.variadic(function (head, tail) {
	return tail;
});
test(dropFirst(1, 2, 3, 4), List(2, 3, 4));

// List.keys
test(List.keys(new Point(4, 3)), ["x", "y"]);


if (allPassed) log("All", testNumber, "tests passed");

function backwards(a, b) {
	return a > b ? -1 : (a == b ? 0 : 1);
}

function square(x) {
	return x * x;
}

function exclaim(word) {
	return "" + word + "!";
}

function sum(xs) {
	var total = 0;
	for (var i = 0; i < xs.length; i++) {
		total += xs.at(i);
	}
	return total;
}

function product(a, b) {
	return a * b;
}

function sumXs(total, b) {
	return total + b.x;
}

function foldMap(mapping) {
	return function (mapped, item, i) {
		return i === 1 ?
			List(mapping(mapped), mapping(item)) :
			mapped.append(mapping(item));
	}
}

function inc(value) {
	return value + 1;
}

function lessThan(max) {
	return function (value) {
		return value < max;
	}
}

function isAscending(value, i, list) {
	return i < 1 || value >= list.at(i - 1);
}