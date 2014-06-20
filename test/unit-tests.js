var List = require("../texo.js");
var range = List.range;

// HELPERS

// print to the page if running in a browser
var log = typeof(window) === "undefined" ?
	console.log.bind(console) :
	function printToPage() {
		var s = Array.prototype.join.call(arguments, " ");
		document.body.innerHTML += s + "<br>";
	};

var allPassed = true;
var testNumber = 0;
function test(res, expected) {
	expected = arguments.length < 2 ? true : expected;
	var num = testNumber++;
	if ((	res instanceof List && 
			expected instanceof Array && 
			same(res, expected)
		) || 
		List.eq(res, expected) || 
		objDeepEqual(res, expected))
		return true;
	else {
		allPassed = false;
		log("test", num, "failed");
		log("expected:", expected);
		log("found:", res);
	}
}

function objDeepEqual(a, b) {
	if (a === b) return true;
	if (typeof(a) === "object" && typeof(b) === "object") {
		for (var key in b) {
			if (!objDeepEqual(a[key], b[key])) {
				return false;
			}
		}
		return true;
	}
	return false;
}

function same(list, arr) {
	return list.length === arr.length &&
		list.every(function (item, i) {
			return List.eq(item, arr[i]);
		});
}

// TESTS

// an example data type
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.toString = function () {
	return "(" + this.x + "," + this.y + ")";
};
Point.prototype.distanceTo = function (p2) {
	return Math.sqrt(Math.pow(this.x - p2.x, 2) + Math.pow(this.y - p2.y, 2));
};
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

// forEach and forEachRight
var total = 0;
function sideEffectSum(value, i) {
	total += value + i;
}
test((range(10).forEach(sideEffectSum), total), (1+2+3+4+5+6+7+8+9)*2);
total = 0;
test((range(6).forEachRight(sideEffectSum), total), (1+2+3+4+5)*2);

// map
test(List().map(square), []);
test(range(4).map(square), [0, 1, 4, 9]);
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
	map([c, b, a], function (p) {
		return p.distanceTo(new Point(0, 0));
	}));

// flatMap
test(List().flatMap(square), []);
test(range(5).flatMap(toRange), [0, 0, 1, 0, 1, 2, 0, 1, 2, 3]);
test(range(6).flatMap(square), [0, 1, 4, 9, 16, 25]);
test(List(4, 6, null, 88, false).flatMap(flatMapFilter), [4, 6, 88]);

// reduce and reduceRight
test(List().reduce(55, product), 55);
test(range(1, 10).reduce(product), range(1, 10).reduceRight(product));
test(List(a, b, c).reduce(0, sumXs), 14);
test(range(50).reduce(foldMap(square)), range(50).map(square));
test(range(15).reduceRight(0, inc), 15);

// filter
test(List().filter(), []);
test(List(1, 0, null, 4, false, true, undefined).filter(), [1, 0, 4, true]);
test(List(34, 23, 0, null, 9, undefined).filter(Boolean), [34, 23, 9]);
test(List(false, "3", "0").filter(Number), ["3"]);
test(range(40).filter(lessThan(20)), range(20));
test(List().filter({a: "foo", b: "bar"}), []);
test(List(a, b, c).filter({x: 2}), [b]);
test(List(a, b, c).filter({y: lessThan(5)}), [a, c]);
test(List({items: List(0, 1, 2)}).filter({items: range(3)}).length, 1);

// reject
test(List().reject(), []);
test(List(true, false, 0, null, undefined).reject(), [false, null, undefined]);
test(List(a, b, c).reject({x: 9}), [a, b]);
test(range(10).reject(lessThan(7)), [7, 8, 9]);

// countBy
test(List().countBy(), {});
test(range(4).repeat(2).countBy(), {0: 2, 1: 2, 2: 2, 3: 2});
test(range(20).countBy(lessThan(13)), {"true": 13, "false": 7});
test(List(a, b, c).countBy("x"), {3: 1, 2: 1, 9: 1});

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
test(range(4).map(function (i) {
	return range(i);
}).indexOf(range(2)), 2);


// lastIndexOf
test(List().lastIndexOf(a), List.notFound);
test(range(10).lastIndexOf(6), 6);
test(range(5).concat(range(5)).lastIndexOf(0, 4), 0);
test(List(a, b, c, a, c, b).lastIndexOf(c), 4);
test(List(a, b, c).lastIndexOf(33), -1);
test(range(4).map(function (i) {
	return range(i);
}).lastIndexOf(range(3)), 3);

// contains
test(List().contains(undefined), false);
test(List(a, b, c).contains(a), true);
test(List(range(7), range(9)).contains(range(9)), true);
test(List(range(7), range(9)).contains(range(8)), false);

// repeat
test(List().repeat(10), []);
test(range(3).repeat(2), [0, 1, 2, 0, 1, 2]);
test(List(a, b, c).repeat(1), [a, b, c]);
test(range(5).repeat().length, Infinity);
test(range(13).repeat().at(999), 999 % 13);

// min and max
test(List().min(), Infinity);
test(range(44, 99).min(), 44);
test(List(a, b, c).min("y"), 1);
test(List().max(), -Infinity);
test(range(23, 87).max(), 86);
test(List(c, b, a).max("x"), 9);

// sum and product
test(List().sum(), 0);
test(range(6).sum(), 15);
test(List(a, b, c).sum("x"), 14);
test(List().product(), 1);
test(range(6).product(), 0);
test(range(1, 6).product(), 120);
test(List(b, c, a).product("y"), 24);

// sample
test(List().sample(), undefined);
test(range(10).contains(range(10).sample()));
test(range(5).sample(5).sort(), [0, 1, 2, 3, 4]);

// shuffle
test(List().shuffle(), []);
test(range(99).shuffle().sort(), range(99));
test(List(a, b, c).contains(List(a, b, c).shuffle().at(0)))
test(List.eq(range(200).shuffle(), range(200)), false);
test(range(50).shuffle().length, 50);

// flatten
test(List().flatten(), []);
test(List(a, List(b, c), List(1, 2, range(3))).flatten(), 
	[a, b, c, 1, 2, 0, 1, 2]);
test(List(List(List(1, 2, 3), 4), 5).flatten(1), [List(1, 2, 3), 4, 5]);


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

// List.apply
test(List.apply(List.variadic(identity), range(5)), range(5));
test(List.apply(List.variadic(identity), null, range(66)), range(66));
test(List.apply(getThis, a, List()), a);
test(List.apply(Math.max, null, [9, 2, 6, 0]), 9);
test(List.apply(Math.min, null, [9, 2, 6, 0]), 0);

// List.zipObject
test(List.zipObject(List(), List()), {});
test(List.zipObject(List("a", "b", "c"), range(3)), {a: 0, b: 1, c: 2});
test(List.zipObject(range(2), List(a)), {0: a, 1: undefined});
test(List.zipObject(List("foo", "bar", "ding"), 0), {foo: 0, bar: 0, ding: 0});
test(List.zipObject(range(10)), range(10).zipObject());
test(List(a, b, c).zipObject(List(a, b, c)), 
	{"(3,4)": a, "(2,6)": b, "(9,1)": c});

// List.keys and List.values
test(List.keys(new Point(4, 3)), ["x", "y"]);
test(List.keys({a: 1, b: 2, "foo bar": 3}), ["a", "b", "foo bar"]);
test(List.values({}), []);
test(List.values(a), [3, 4]);

// List.combine
test(List.combine(List(a, b, c), range(2, 5), "foo", function (p, val, foo) {
	return foo + val + ": " + (p.x + p.y);
}), ["foo2: 7", "foo3: 8", "foo4: 10"]);
test(List.combine(range(4), [8, 0, 2, 1], Math.max), [8, 1, 2, 3]);

// List.split
test(List.split(""), []);
test(List.split("abc"), ["a", "b", "c"]);
test(List.split("foo,bar,ding", ","), ["foo", "bar", "ding"]);
test(List.split("a (5) b (6) c", /\([0-9]*\)/), ["a ", " b ", " c"]);

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

function identity(a) {
	return a;
}

function sumXs(total, b) {
	return total + b.x;
}

function foldMap(mapping) {
	return function (mapped, item, i) {
		return i === 1 ?
			List(mapping(mapped), mapping(item)) :
			mapped.append(mapping(item));
	};
}

function map(arr, func) {
	var mapped = [];
	for (var i = 0; i < arr.length; i++) {
		mapped.push(func(arr[i], i, arr));
	}
	return mapped;
}

function inc(value) {
	return value + 1;
}

function lessThan(max) {
	return function (value) {
		return value < max;
	};
}

function isAscending(value, i, list) {
	return i < 1 || value >= list.at(i - 1);
}

function getThis() {
	return this;
}

function toRange(n) {
	return range(n);
}

function flatMapFilter(value) {
	return value ? List(value) : List();
}