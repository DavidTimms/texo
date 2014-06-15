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
				var depth = Math.max(this._depth, other._depth) + 1;

				var accessor = function (i) {
					if (i < 0) i += length;
					return (i < split) ? left(i) : right(i - split);
				};

				return createList(accessor, length, depth);
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
		if (length > 1 && depth > Math.log(length) * 10) {
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

	var emptyList = new List();

	return List;

	/*
	// Produce a new list by calling func on each item in the list
	function map (func) {
		var cache = [];
		// treat string/number arguments as pluck operations 
		if (typeof(func) !== "function") {
			var key = func;
			func = function (obj) {
				return obj[key];
			};
		}

		var count = this.count;
		var resultArray = Array(count);
		for (var i = 0; i < count; i++) {
			resultArray[i] = func(this(i), i, this);
		}
		return fromArray(resultArray);
	}

	// Produce a new list which will call func on the item when it is accessed
	function lazyMap (func) {
		var parent = this;
		// treat string/number arguments as pluck operations 
		if (typeof(func) !== "function") {
			var key = func;
			func = function (obj) {
				return obj[key];
			};
		}
		function listFunc (i) {
			if (i < 0) i += parent.count;
			if (i >= parent.count || i < 0) {
				return undefined;
			}
			return func(parent(i), i, parent);
		}
		listFunc._depth = parent._depth + 1;
		listFunc.count = parent.count;
		return addMethods(listFunc);
	}

	// fold the items in the list from left to right with an optional initial value
	function reduce (initial, func) {
		var result, i;
		// initial value provided
		if (func) {
			result = initial;
			i = 0;
		}
		// no initial value provided
		else {
			func = initial;
			result = this(0);
			i = 1;
		}
		for (; i < this.count; i++) {
			result = func(result, this(i), i, this);
		}
		return result;
	}

	// fold the items in the list from right to left with an optional initial value
	function reduceRight (initial, func) {
		var result, i = this.count - 1;
		// initial value provided
		if (func) {
			result = initial;
		}
		// no initial value provided
		else {
			func = initial;
			result = this(i);
			i -= 1;
		}
		for (; i >= 0; i--) {
			result = func(result, this(i), i, this);
		}
		return result;
	}

	// Produce a new list with the items that satisfy the predicate function
	function filter (predicate) {
		var items = [];
		var item;
		for (var i = 0; i < this.count; i++) {
			item = this(i);
			if (predicate(item, i, this)) {
				items.push(item);
			}
		}
		return fromArray(items);
	}

	// Produce a list with the specified positions replaced with the new values
	function replace () {
		var parent = this;
		var replacements = [];
		for (var j = 0; j < arguments.length; j += 2) {
			var index = arguments[j];
			if (index < 0) index += parent.count;
			if (index < this.count) {
				replacements[index] = arguments[j + 1];
			}
		}
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			if (i in replacements) {
				return replacements[i];
			}
			return parent(i);
		}
		listFunc._depth = parent._depth + 1;
		listFunc.count = parent.count;
		return addMethods(listFunc);
	}


	// Produce a new list from a subsection of the list
	function slice (start, end) {
		var temp, parent = this, parentCount = this.count;
		// default value for end
		if (end === undefined) {
			end = parentCount;
		}
		// count from end of the list for negative indexes
		else if (end < 0) {
			end += parentCount;
		}
		if (start < 0) start += parentCount;

		// switch arguments if they are the wrong way round
		if (end < start) {
			temp = end;
			end = start;
			start = temp;
		}

		// ensure indexes are within range
		start = Math.max(start, 0);
		end = Math.min(end, parentCount);

		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			var index = i + start;
			if (index >= end) {
				return undefined;
			}
			return parent(index);
		}
		listFunc._depth = parent._depth + 1;

		// when reslicing, the parent function can be eliminated
		if (this._parent) {
			listFunc._depth -= 1;
			parent = this._parent;
			start += this._start;
			end = this._start + end;
		}

		// store slice details for reslicing 
		listFunc._parent = parent;
		listFunc._start = start;

		listFunc.count = end - start;
		return addMethods(listFunc);
	}

	// Produce a new list which is the reverse of the list
	function reverse () {
		var parent = this;
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			return parent(listFunc.count - i - 1);
		}
		listFunc._depth = parent._depth + 1;
		listFunc.count = parent.count;
		return addMethods(listFunc);
	}

	// The comparator to use if none is provided to sort()
	function defaultSort (a, b) {
		return a < b ? -1 : (a == b ? 0 : 1);
	}

	// Produce a new list with the items from the list sorted 
	// based on the sort function
	function sort (sortFunction) {
		sortFunction = sortFunction || defaultSort;
		if (typeof(sortFunction) === "string") {
			var key = sortFunction;
			sortFunction = function (a, b) {
				return defaultSort(a[key], b[key]);
			};
		}
		return fromArray(this.toArray().sort(sortFunction));
	}
	*/
}));