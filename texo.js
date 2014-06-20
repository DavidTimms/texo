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
		this.Texo = factory();
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

		// Produce a list with the new value inserted at the specified index
		removeAt: function (index) {
			if (index < 0) index += this.length;
			var parent = this.at;
			var length = this.length - 1;

			if (length < 1) return emptyList;

			function accessor(i) {
				if (i < 0) i += length;
				return i >= index ?
					parent(i + 1) :
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

		rest: function () {
			return this.slice(1);
		},

		first: function () {
			return this.at(0);
		},

		last: function () {
			return this.at(-1);
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
			if (typeof(sortFunction) !== "function") {
				var key = sortFunction;
				sortFunction = function (a, b) {
					return defaultSort(a[key], b[key]);
				};
			}
			return fromArray(this.toArray().sort(sortFunction));
		},

		forEach: function (callback) {
			callback = createMapping(callback);

			var length = this.length;
			var accessor = this.at;
			for (var i = 0; i < length; i++) {
				callback(accessor(i), i, this);
			}
			return this;
		},

		forEachRight: function (callback) {
			callback = createMapping(callback);

			var accessor = this.at;
			for (var i = this.length - 1; i >= 0; i--) {
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

		pluck: function (key) {
			return this.map(function (obj) {
				return obj[key];
			});
		},

		invoke: function (method) {
			var otherArgs = [];
			for (var i = 1; i < arguments.length; i++) {
				otherArgs.push(arguments[i]);
			}
			return this.map(function (obj) {
				return apply(obj[method], obj, otherArgs);
			});
		},

		// like map, concatenates the results of calling the
		// function on each item in the list
		flatMap: function (callback) {
			callback = createMapping(callback);

			var parentLength = this.length;
			var parent = this.at;
			var results = emptyList;
			for (var i = 0; i < parentLength; i++) {
				results = results.concat(callback(parent(i), i, this));
			}
			return results;
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
			predicate = predicate === undefined ?
				defaultFilter :
				createPredicate(predicate);

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
		},

		// opposite of filter
		reject: function (predicate) {
			predicate = predicate === undefined ?
				defaultFilter :
				createPredicate(predicate);

			return this.filter(negate(predicate));
		},

		// test whether every element passes the predicate function
		every: function (predicate) {
			predicate = predicate || defaultFilter;
			var parent = this.at;
			var length = this.length;
			for (var i = 0; i < length; i++) {
				if (!predicate(parent(i), i, this)) {
					return false;
				}
			}
			return true;
		},

		// test whether any element passes the predicate function
		some: function (predicate) {
			predicate = predicate || defaultFilter;
			var parent = this.at;
			var length = this.length;
			for (var i = 0; i < length; i++) {
				if (predicate(parent(i), i, this)) {
					return true;
				}
			}
			return false;
		},

		// return the index of the first element equal to the value
		indexOf: function (needle, start) {
			var length = this.length;
			var parent = this.at;
			if (start !== undefined) {
				while (start < 0) {
					start += length;
				}
			}
			else start = 0;

			for (var i = start; i < length; i++) {
				if (eq(parent(i), needle)) {
					return i;
				}
			}

			return -1;
		},

		// return the index of the last element equal to the value
		lastIndexOf: function (needle, start) {
			var length = this.length;
			var parent = this.at;
			if (start !== undefined) {
				while (start < 0) {
					start += length;
				}
				start = Math.min(start, length - 1);
			}
			else start = length - 1;

			for (var i = start; i >= 0; i--) {
				if (eq(parent(i), needle)) {
					return i;
				}
			}

			return -1;
		},

		contains: function (needle, start) {
			return this.indexOf(needle, start) > -1;
		},

		repeat: function (times) {
			var parent = this.at;
			var parentLength = this.length;
			var length = times === undefined ? 
				Infinity : 
				parentLength * times;

			function accessor(i) {
				if (i < 0) i += parentLength;
				return i >= length || i < 0 ?
					undefined :
					parent(i % parentLength);
			}

			return createList(accessor, length, this._depth + 1);
		},

		min: reduceMethod(Infinity, function (a, b) {
			return a < b ? a : b;
		}),

		max: reduceMethod(-Infinity, function (a, b) {
			return a > b ? a : b;
		}),

		sum: reduceMethod(0, function (a, b) {
			return +a + +b;
		}),

		product: reduceMethod(1, function (a, b) {
			return a * b;
		}),

		sample: function (n) {
			if (n === undefined) {
				return this.at(Math.floor(Math.random() * this.length));
			}
			var sampled = [];
			var remaining = this;
			var r;
			for (var i = 0; i < n; i++) {
				r = Math.floor(Math.random() * remaining.length);
				sampled.push(remaining.at(r));
				remaining = remaining.removeAt(r);
			}
			return fromArray(sampled);
		},

		flatten: function (levels) {
			levels = levels === undefined ?
				Infinity :
				levels;

			return flattenList(this, levels);
		},
		shuffle: notYetImplemented,
		countBy: notYetImplemented,
	};

	function listToString() {
		return "[" + this.join() + "]";
	}

	// test whether two lists are equal
	function eq(a, b) {
		if (a instanceof List && b instanceof List) {
			var length = a.length;
			if (b.length !== length) return false;

			if (a.at === b.at) return true;

			for (var i = 0; i < length; i++) {
				if (!eq(a.at(i), b.at(i))) {
					return false;
				}
			}
			// If they are equal, share a single 
			// accessor between both instances
			if (a._depth > b._depth) {
				a.at = b.at;
				a._depth = b._depth;
			}
			else {
				b.at = a.at;
				b._depth = a._depth;
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
	List.fromUnsafe = fromArray;
	List.from = function(items) {
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

	List.of = function (length, value) {
		function accessor(i) {
			return i < length && i > -length ?
				value :
				undefined;
		}
		return createList(accessor, length, 1);
	}

	List.keys = function (obj) {
		var keysArray = [];
		for (var key in obj) if (obj.hasOwnProperty(key)) {
			keysArray.push(key);
		}
		return fromArray(keysArray);
	}

	List.values = function (obj) {
		var valueArray = [];
		for (var key in obj) if (obj.hasOwnProperty(key)) {
			valueArray.push(obj[key]);
		}
		return fromArray(valueArray);
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
			return apply(func, this, variadicArgs);
		}
	}
	List.variadic = variadic;

	// map a function over the values of multiple lists
	List.combine = variadic(function (args) {
		var callback = args.last();

		// map arguments to lists
		var argLists = args.slice(0, -1).map(function (arg) {
			if (arg instanceof List) return arg;
			if (arg instanceof Array) return fromArray(arg);
			return List.of(Infinity, arg);
		});

		// find the length of the longest input list
		var length = argLists.reduce(0, function (largest, argList) {
			return argList.length < Infinity && argList.length > largest ?
				argList.length :
				largest;
		});

		var resultArray = Array(length);
		for (var i = 0; i < length; i++) {
			// call with the ith element from each argument list
			resultArray[i] = apply(callback, argLists.invoke("at", i));
		}
		return fromArray(resultArray);
	});

	// Apply a list of argument to a function
	// thisArg is optional
	List.apply = apply;
	function apply(func, thisArg, args) {
		// move arguments if thisArg was omitted
		if (args === undefined) {
			args = thisArg;
			thisArg = null;
		}
		// convert array to a list
		if (args instanceof Array) args = fromArray(args);

		switch (args.length) {
			case 0: return func.call(thisArg);
			case 1: return func.call(thisArg, args.at(0));
			case 2: return func.call(thisArg, args.at(0), args.at(1));
			case 3: return func.call(thisArg, args.at(0), args.at(1), args.at(2));
			case 4: return func.call(thisArg, args.at(0), args.at(1), args.at(2), 
				args.at(3));
			case 5: return func.call(thisArg, args.at(0), args.at(1), args.at(2), 
				args.at(3), args.at(4));
			case 6: return func.call(thisArg, args.at(0), args.at(1), args.at(2), 
				args.at(3), args.at(4), args.at(5));
			case 7: return func.call(thisArg, args.at(0), args.at(1), args.at(2), 
				args.at(3), args.at(4), args.at(5), args.at(6));
			case 8: return func.call(thisArg, args.at(0), args.at(1), args.at(2), 
				args.at(3), args.at(4), args.at(5), args.at(6), args.at(7));
			default: return applyLarge(func, thisArg, args);
		}
	}

	// a slow version of apply which works on lists of any length
	// by creating a function using code generation
	function applyLarge(func, thisArg, args) {
		var applier = new Function("func, thisArg, args", 
			"return func.call(thisArg, " + 
			args.map(function (_, i) { return "args.at(" + i + ")" }).join(", ") +
			"); ");
		return applier(func, thisArg, args);
	}

	// constant for more readable checking of the 
	// result of indexOf
	List.notFound = -1;

	function createList(accessor, length, depth) {
		if (length > 1 && depth > Math.log(length) * 2) {
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

	function inRange(min, max, value) {
		if (value < min) return min;
		if (value > max) return max;
		return value;
	}

	function reduceMethod(init, reducer) {
		return function (key) {
			var items = key ? this.lazyMap(key) : this;
			return items.reduce(init, reducer);
		}
	}

	// recursively create a function which tests whether a 
	// value matches another, including deep subset object equality
	function createPredicate(value) {
		switch (typeof(value)) {
			case "function": return value;
			case "object": 
				if (value instanceof List) return isValue(value);

				var keys = List.keys(value);
				var tests = List.values(value).map(createPredicate);
				return function (candidate) {
					return typeof(candidate) === "object" && 
						keys.every(function (key, i) {
							return tests.at(i)(candidate[key]);
						});
				};
			default: return isValue(value);
		}
	}

	function flattenList(list, levels) {
		if (levels < 1) return list;
		return list.flatMap(function (item) {
			return item instanceof List ? 
				flattenList(item, levels - 1) : 
				List(item);
		});
	}

	function isValue(value) {
		return function (candidate) {
			return eq(candidate, value);
		}
	}

	function negate(predicate) {
		return variadic(function (args) {
			return !apply(predicate, this, args);
		});
	}

	function notYetImplemented() {
		throw Error("This method has not yet been implemented.");
	}

	var emptyList = new List();

	return List;
}));