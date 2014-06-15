(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var List = require("../texo.js");
var range = List.range;

// HELPERS

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
		console.log("test", num, "failed");
		console.log("expected:", expected);
		console.log("found:", res);
	}
}

function same(list, arr) {
	return list.length === arr.length &&
		arr.every(function (item, i) { return item === list.at(i) });
}

// TESTS

var a = Point(3, 4), b = Point(2, 6), c = Point(9, 1);

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

// List.eq
test(new List(), List());
test(List(1, 2, 3), List(1, 2, 3));

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

// insert
test(List().insertAt(1, "foo"), [undefined, "foo"]);
test(range(4).insertAt(2, 99), [0, 1, 99, 2, 3]);
test(List().insertAt(0, a).insertAt(0, b).insertAt(0, c), [c, b, a]);
test(range(2, 6).insertAt(-2, 888), [2, 3, 888, 4, 5]);

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

//List.variadic
var vsum = List.variadic(sum);
test(vsum(3, 6, 8, 4), sum(List(3, 6, 8, 4)));

var dropFirst = List.variadic(function (head, tail) {
	return tail;
});
test(dropFirst(1, 2, 3, 4), List(2, 3, 4));


if (allPassed) console.log("All tests passed");

function backwards(a, b) {
	return a > b ? -1 : (a == b ? 0 : 1);
}

function Point(x, y) {
	return {x: x, y: y};
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
},{"../texo.js":2}],2:[function(require,module,exports){
/* Texo: Immutable functional lists
 * Copyright (c) 2014 David Timms
 * github.com/DavidTimms/texo
 */

 // Universal Module Definition for AMD, Node and browser globals
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);
	} 
	else if (typeof exports === 'object') {
		// Node
		module.exports = factory();
	}
	else {
		// Browser global
		this.texo = factory();
	}
}(function () {
	"use strict";

	// List constructor (does not require "new")
	function List(args /* ... */) {
		if (args !== undefined) {
			var length = arguments.length;
			var items = new Array(length);
			for (var i = 0; i < length; i++) {
				items[i] = arguments[i];
			}
			return fromArray(items);
		}
		if (this instanceof List) return this;
		else return emptyList;
	}

	List.prototype = {
		constructor: List,
		length: 0,
		_depth: 0,
		// default accessor
		at: function () {},
		toString: listToString,
		inspect: listToString,

		join: function (separator) {
			separator = separator === undefined ? 
				"," : 
				"" + separator;
			var s = "";
			var lastIndex = this.length - 1;
			for (var i = 0; i < lastIndex; i++) {
				s += this.at(i) + separator;
			}
			return lastIndex >= 0 ?
				s + this.at(lastIndex) :
				s;
		},

		toArray: function () {
			var arr = [];
			var length = this.length;
			for (var i = 0; i < length; i++) {
				arr[i] = this.at(i);
			}
			return arr;
		},

		// Create a version of the list with fast access times
		flattenTree: function () {
			return fromArray(this.toArray());
		},

		// Produce a new list which is the concatenation of the list and right
		concat: function (other) {
			if (other instanceof List) {
				var left = this.at;
				var right = other.at;
				var split = this.length;
				var length = split + other.length;

				var accessor = function (i) {
					if (i < 0) i += length;
					return (i < split) ? left(i) : right(i - split);
				};

				return createList(accessor, length, 
					Math.max(this._depth, other._depth) + 1);
			}
			else return this.append(other);
		},
		// Produce a new list with the item added to the end
		append: variadic(function (items) {
			return this.concat(items);
		}),
		// Produce a new list with the item added to the end
		prepend: variadic(function (items) {
			return items.concat(this);
		}),

		// Produce a list with the specified index replaced with the new value
		replace: function (index, newValue) {
			if (index < 0) index += this.length;
			var parent = this.at;
			var length = Math.max(this.length, index + 1);

			function accessor(i) {
				if (i < 0) i += length;
				return i === index ?
					newValue :
					parent(i);
			}

			return createList(accessor, length, this._depth + 1);
		},

		// Produce a list with the new value inserted at the specified index
		insertAt: function (index, newValue) {
			if (index < 0) index += this.length;
			var parent = this.at;
			var length = Math.max(this.length, index) + 1;

			function accessor(i) {
				if (i < 0) i += length;
				if (i === index) {
					return newValue;
				}
				return i > index ?
					parent(i - 1) :
					parent(i);
			}

			return createList(accessor, length, this._depth + 1);
		},

		// Produce a new list from a subsection of the list
		slice: function (start, end) {
			var parent = this.at;
			var parentLength = this.length;

			// nothing needs to be done if no values are given
			// so return the same list
			if (start === undefined) return this;

			// default value for end
			if (end === undefined) {
				end = parentLength;
			}
			// count from end of the list for negative indexes
			else if (end < 0) {
				end += parentLength;
			}
			if (start < 0) start += parentLength;

			// switch arguments if they are the wrong way round
			if (end < start) {
				var temp = end;
				end = start;
				start = temp;
			}

			// ensure indexes are within range
			start = inRange(0, parentLength, start);
			end = inRange(0, parentLength, end);
			var length = end - start;

			function accessor(i) {
				if (i < 0) i += length;
				var index = i + start;
				if (index >= end) {
					return undefined;
				}
				return parent(index);
			}

			var depth = this._depth + 1;
			
			// when reslicing, the parent function can be eliminated
			if (parent._parent) {
				depth -= 1;
				start += parent._start;
				end += parent._start;
				parent = parent._parent;
			}
			
			// store slice details for reslicing 
			accessor._parent = parent;
			accessor._start = start;

			return createList(accessor, length, depth);
		},

		// Produce a new list which is the reverse of the list
		reverse: function () {
			var parent = this.at;
			var length = this.length;

			function accessor(i) {
				if (i < 0) i += length;
				return parent(length - i - 1);
			}

			return createList(accessor, length, this._depth + 1);
		},

		// Produce a new list with the items from the list sorted 
		// based on the sort function
		sort: function (sortFunction) {
			sortFunction = sortFunction || defaultSort;
			if (typeof(sortFunction) === "string") {
				var key = sortFunction;
				sortFunction = function (a, b) {
					return defaultSort(a[key], b[key]);
				};
			}
			return fromArray(this.toArray().sort(sortFunction));
		},

		// Produce a new list by calling the callback on each item in the list
		forEach: function (callback) {
			callback = createMapping(callback);

			var length = this.length;
			var accessor = this.at;
			for (var i = 0; i < length; i++) {
				callback(accessor(i), i, this);
			}
			return this;
		},

		// Produce a new list by calling the callback on each item in the list
		map: function (callback) {
			callback = createMapping(callback);

			var length = this.length;
			var parent = this.at;
			var resultArray = Array(length);
			for (var i = 0; i < length; i++) {
				resultArray[i] = callback(parent(i), i, this);
			}
			return fromArray(resultArray);
		},
		// Produce a new list which will call the 
		// callback on the item when it is accessed
		lazyMap: function (callback) {
			callback = createMapping(callback);

			var length = this.length;
			var parent = this.at;
			var parentObject = this;

			function accessor(i) {
				if (i < 0) i += length;
				return i >= length || i < 0 ?
					undefined :
					callback(parent(i), i, parentObject);
			}

			return createList(accessor, length, this._depth + 1);
		},

		// fold the items in the list from left to right with an optional initial value
		reduce: function (initial, reducer) {
			var result, 
				length = this.length, 
				i, 
				parent = this.at;

			// initial value provided
			if (reducer) {
				result = initial;
				i = 0;
			}
			// no initial value provided
			else {
				reducer = initial;
				result = parent(0);
				i = 1;
			}
			for (; i < length; i++) {
				result = reducer(result, parent(i), i, this);
			}
			return result;
		},

		// fold the items in the list from right to left with an optional initial value
		reduceRight: function (initial, reducer) {
			var result, 
				length = this.length, 
				i = length - 1, 
				parent = this.at;

			// initial value provided
			if (reducer) {
				result = initial;
			}
			// no initial value provided
			else {
				reducer = initial;
				result = parent(i);
				i -= 1;
			}
			for (; i >= 0; i--) {
				result = reducer(result, parent(i), i, this);
			}
			return result;
		},

		// Produce a new list with the items that satisfy the predicate function
		filter: function (predicate) {
			predicate = predicate || defaultFilter;
			var parent = this.at;
			var length = this.length;
			var filtered = [];
			var item;
			for (var i = 0; i < length; i++) {
				item = parent(i);
				if (predicate(item, i, this)) {
					filtered.push(item);
				}
			}
			return fromArray(filtered);
		}
	};

	function listToString() {
		return "[" + this.join() + "]";
	}

	// test whether two lists are equal
	function eq(a, b) {
		if (a instanceof List && b instanceof List) {
			var length = a.length;
			if (b.length !== length) return false;

			for (var i = 0; i < length; i++) {
				if (!eq(a.at(i), b.at(i))) {
					return false;
				}
			}
			return true;
		}
		return a === b;
	}
	List.eq = eq;

	// Convert an array to a list
	function fromArray(items) {
		function accessor(i) {
			if (i < 0) i += items.length;
			return items[i];
		}
		return createList(accessor, items.length, 1);
	}
	List.fromArrayUnsafe = fromArray;
	List.fromArray = function(items) {
		// defensively clone the array in case of mutation
		return fromArray(items.slice(0));
	};

	List.range = function (from, to) {
		// handle missing arguments
		if (to === undefined) {
			if (from === undefined) {
				to = Infinity;
			}
			else {
				to = from;
			}
			from = 0;
		}

		var length = from < to ? to - from : from - to; 

		function accessor(i) {
			var num;
			if (i < 0) i += length;

			// ascending range
			if (from < to) {
				num = i + from;
				return (num < to ? num : undefined);
			}
			// descending range
			else {
				num = from - i;
				return (num > to ? num : undefined);
			}
		}

		return createList(accessor, length, 1);
	}

	function createList(accessor, length, depth) {
		if (length > 1 && depth > Math.log(length) * 1.5) {
			return flattenAccessor(accessor, length);
		}
		var list = new List();
		list.at = accessor;
		list.length = length;
		list._depth = depth;
		return list;
	}

	function flattenAccessor(accessor, length) {
		var items = new Array(length);
		for (var i = 0; i < length; i++) {
			items[i] = accessor(i);
		}
		return fromArray(items);
	}

	// The comparator to use if none is provided to sort()
	function defaultSort (a, b) {
		return a < b ? -1 : (a == b ? 0 : 1);
	}

	// The default filter predicate keeps truthy values and zeros
	function defaultFilter(value) {
		return value || value === 0;
	}

	function createMapping(mapping) {
		// treat string/number arguments as pluck operations 
		return typeof(mapping) === "function" ?
			mapping :
			function (obj) {
				var prop = obj[mapping];
				return typeof(prop) === "function" ? prop() : prop;
			};
	}

	function variadic(func) {
		var normalParams = func.length - 1;
		return function () {
			var args = [];
			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			var variadicArgs = args.slice(0, normalParams);
			variadicArgs.push(fromArray(args.slice(normalParams)));
			return func.apply(this, variadicArgs);
		}
	}
	List.variadic = variadic;

	function inRange(min, max, value) {
		if (value < min) return min;
		if (value > max) return max;
		return value;
	}

	var emptyList = new List();

	return List;
}));
},{}]},{},[1])