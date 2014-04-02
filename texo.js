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
	// List constructor (does not require "new")
	function list () {
		var items = arguments;
		return fromArray(items);
	}

	// test whether two list are equal (shallow equality)
	function eq (a, b) {
		if (typeof(a) !== "function" || 
			typeof(b) !== "function" || 
			(!a.count) ||
			a.count !== b.count) {
				return a === b;
		}
		for (var i = 0; i < a.count; i++) {
			if (!eq(a(i), b(i))) {
				return false;
			}
		}
		return true;
	}
	list.eq = eq;

	// Convert an array to a list
	function fromArray (items) {
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			return items[i];
		}
		listFunc._depth = 1;
		listFunc.count = items.length;
		return addMethods(listFunc);
	}
	list.fromArray = function (items) {
		return fromArray(items.slice(0));
	};

	// Convert a list to an array
	function toArray () {
		var items = [];
		for (var i = 0; i < this.count; i++) {
			items.push(this(i));
		}
		return items;
	}

	// Clone the list to produce an non-nested list
	function flatten () {
		return fromArray(this.toArray());
	}

	function listToString () {
		return "(" + this.join(",") + ")";
	}

	function join (delim) {
		if (this.count === 0) {
			return "";
		}
		var str = "";
		for (var i = 0; i < this.count - 1; i++) {
			str += this(i) + delim;
		}
		return str + this(i);
	}

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
			resultArray[i] = func(this(i));
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
			return func(parent(i));
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
			if (predicate(item)) {
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

	// Produce a new list which is the concatenation of the list and right
	function concat (right) {
		var left = this;
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			return (i < left.count) ? left(i) : right(i - left.count);
		}
		listFunc._depth = Math.max(left._depth, right._depth) + 1;
		listFunc.count = left.count + right.count;
		return addMethods(listFunc);
	}

	// Produce a new list with the arguments added to the end of the list
	function append () {
		var left = this;
		var right = arguments;
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			return (i < left.count) ? left(i) : right[i - left.count];
		}
		listFunc._depth = left._depth + 1;
		listFunc.count = left.count + right.length;
		return addMethods(listFunc);
	}

	// Produce a new list with the arguments added to the start of the list
	function prepend () {
		var left = arguments;
		var right = this;
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			return (i < left.length) ? left[i] : right(i - left.length);
		}
		listFunc._depth = right._depth + 1;
		listFunc.count = left.length + right.count;
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

	function range (from, to) {
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

		function listFunc (i) {
			var num;
			if (i < 0 && listFunc.count !== Infinity) i += listFunc.count;

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
		listFunc._depth = 1;
		listFunc.count = (from < to ? to - from : from - to); 
		return addMethods(listFunc);
	}
	list.range = range;

	// Add the methods to the function representing a new list.
	// As each list is a function object, prototypical inheritance
	// cannot be used to add the methods
	function addMethods (listFunc) {
		listFunc.toArray = toArray;
		listFunc.flatten = flatten;

		// flatten the list once it becomes too deep
		// To maintain constant time access
		if (listFunc._depth > 25) {
			listFunc = listFunc.flatten();
			listFunc.toArray = toArray;
			listFunc.flatten = flatten;
		}

		listFunc.join = join;
		listFunc.inspect = listFunc.toString = listToString;
		listFunc.map = map;
		listFunc.lazyMap = lazyMap;
		listFunc.reduce = reduce;
		listFunc.reduceRight = reduceRight;
		listFunc.filter = filter;
		listFunc.concat = concat;
		listFunc.append = append;
		listFunc.prepend = prepend;
		listFunc.slice = slice;
		listFunc.replace = replace;
		listFunc.reverse = reverse;
		listFunc.sort = sort;
		return listFunc;
	}
	
	return list;
}));