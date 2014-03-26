/* Immutable lazy lists with constant time concatenation
 * and a friendly interface - every list is just a function!
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
module.exports = (function () {
	function list () {
		var items = arguments;
		return fromArray(items);
	}

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

	function toArray () {
		var items = [];
		for (var i = 0; i < this.count; i++) {
			items.push(this(i));
		}
		return items;
	}

	function flatten () {
		return fromArray(this.toArray());
	}

	function eq (a, b) {
		if (typeof(a) !== "function" || 
			typeof(b) !== "function" || 
			a.count !== b.count) {
				return a === b;
		}
		for (var i = 0; i < a.count; i++) {
			if (a(i) !== b(i)) {
				return false;
			}
		}
		return true;
	}
	list.eq = eq;

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

	function map (func) {
		var parent = this;
		var cache = [];
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
			if (i in cache) {
				return cache[i];
			}
			return cache[i] = func(parent(i));
		}
		listFunc._depth = parent._depth + 1;
		listFunc.count = parent.count;
		return addMethods(listFunc);
	}

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

	function reduce (initial, func) {
		var result, i;
		// initial value provided
		if (func) {
			result = initial;
			for (i = 0; i < this.count; i++) {
				result = func(result, this(i));
			}
		}
		// no initial value provided
		else {
			func = initial;
			result = this(0);
			for (i = 1; i < this.count; i++) {
				result = func(result, this(i));
			}
		}
		return result;
	}

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

	function slice (start, end) {
		if (end === undefined) {
			end = this.count;
		}
		var parent = this;
		function listFunc (i) {
			if (i < 0) i += listFunc.count;
			var index = i + start;
			if (index >= end) {
				return undefined;
			}
			return parent(index);
		}
		listFunc._depth = parent._depth + 1;

		// reslicing
		if (this._parent) {
			listFunc._depth -= 1;
			parent = this._parent;
			start += this._start;
			end = this._start + Math.min(end, this.count);
		}

		// store slice details for reslicing 
		listFunc._parent = parent;
		listFunc._start = start;

		listFunc.count = end - start;
		return addMethods(listFunc);
	}

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

	function defaultSort (a, b) {
		return a < b ? -1 : (a == b ? 0 : 1);
	}

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



	function addMethods (listFunc) {
		listFunc.toArray = toArray;
		listFunc.flatten = flatten;

		// flatten the list once it becomes too deep
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
}());