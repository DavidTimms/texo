
The Basics
---
### Getting Started
Install using [NPM](http://npmjs.org/) or by downloading the source [here](https://raw.githubusercontent.com/DavidTimms/texo/master/texo.js):

    npm install texo

Setup using [Node.js](http://nodejs.org) or [browserify](http://browserify.org):

    var List = require("texo");

Texo can also be used with [AMD](http://requirejs.org/docs/whyamd.html#amd), or a simple script tag, in which case, it creates a global variable `Texo` which is the main list constructor function.

### Creating a List
The List constructor function takes any number of arguments and returns a list instance containing the arguments. The `new` keyword is optional.

	var nums = List(1, 2, 3, 4, 5, 6);
	// -> [1, 2, 3, 4, 5, 6]

	var names = new List("John", "Lucy", "Jane");
	// -> ["John", "Lucy", "Jane"]

Every list instance has a `length` property, representing  the number of elements in the list. In some situations, it is possible to create infinite lists, which have length `Infinity`.

	List("John", "Lucy", "Jane").length;
	// -> 3

Instance Methods
---
Every Texo list has these methods available.

### at 

#### `list.at(index:Number) -> Any`

Get the element of the list at the index. A negative index will count from the end of the list. If the index is beyond the bounds of the list, it returns undefined.

	List("John", "Lucy", "Jane").at(1);
	// -> "Lucy"

### toArray

#### `list.toArray() -> Array`

Convert the list to a native JavaScript array.

	List(1, 2, 3, 4, 5, 6).toArray();
	// -> Array(1, 2, 3, 4, 5, 6)

### toString

#### `list.toString() -> String`

Create a string representation of the elements of the list, wrapped in square brackets.

	List(1, 2, 3, 4, 5, 6).toString();
	// -> "[1,2,3,4,5,6]"

### join

#### `list.join(separator:String) -> String`

Concatenate the elements of the list as a string, separated by the `separator` string. The default separator is `","`.

	List("John", "Lucy", "Jane").join(" < ");
	// -> "John < Lucy < Jane"

### concat

#### `list.concat(other:List) -> List`

Concatenate the list with another list to produce a new list. If `other` is not a list, it will be appended to end of the new list as the last element.

	List(1, 2, 3).concat(List(4, 5, 6));
	// -> [1, 2, 3, 4, 5, 6]

	List().concat(45);
	// -> [45]

### append

#### `list.append(...items:Any) -> List`

Returns a new list with the method's arguments added to the end of the old list.

	List("a", "b", "c").append("d");
	// -> ["a", "b", "c", "d"]

	List(1, 2, 3, 4).append(5, 6, 7);
	// -> [1, 2, 3, 4, 5, 6, 7]

### prepend

#### `list.prepend(...items:Any) -> List`

Returns a new list with the method's arguments added to the beginning of the old list.

	List("a", "b", "c").prepend("d");
	// -> ["d", "a", "b", "c"]

	List(1, 2, 3, 4).prepend(5, 6, 7);
	// -> [5, 6, 7, 1, 2, 3, 4]

### replace

#### `list.replace(index:Number, newValue:Any) -> List`

Returns a new list which is identical to the old list, except the value at `index` has been replaced with `newValue`.

	List(1, 2, 3).replace(1, "foo");
	// -> [1, "foo", 3]

### insertAt

#### `list.insertAt(index:Number, newValue:Any) -> List`

Returns a new list which is identical to the old list, except `newValue` has been inserted at `index` and all subsequent elements are 1 place higher.

	List("John", "Lucy", "Jane").insertAt(2, "Roger");
	// -> ["John", "Lucy", "Roger", "Jane"]

### removeAt

#### `list.removeAt(index:Number) -> List`

Returns a new list which is identical to the old list, except the element at `index` has been removed and all subsequent elements are 1 place lower.

	List("John", "Lucy", "Jane").removeAt(1);
	// -> ["John", "Jane"]

### slice

#### `list.slice(start:Number) -> List`
#### `list.slice(start:Number, end:Number) -> List`

Returns a new list containing all the elements in the old list, starting at index `start` (inclusive) and ending at index `end` (exclusive). If `end` is omitted, it defaults the length of the list, so all elements after `start` will be included.

	List(1, 2, 3, 4, 5).slice(1, 4);
	// -> [2, 3, 4]

	List("foo", "bar", "baz", "qux").slice(2);
	// -> ["baz", "qux"]

### first

#### `list.first() -> Any`

Returns the element at index 0.

	List(67, 34, 56).first();
	// -> 67

### last

#### `list.last() -> Any`

Returns the element at the highest index in the list.

	List(67, 34, 56).last();
	// -> 56

### rest

#### `list.rest() -> List`

Returns a copy of the old list with the first element removed.

	List(67, 34, 56).rest();
	// -> [34, 56]

### take

#### `list.take(n:Number) -> List`

Returns a new list containing the first `n` elements in the old list.

	List("B", "r", "u", "b", "e", "c", "k").take(5);
	// -> ["B", "r", "u", "b", "e"]

### drop

#### `list.drop(n:Number) -> List`

Returns a new list identical to the old list, except with the first `n` elements removed.

	List(8, 7, 6, 5, 4).drop(2);
	// -> [6, 5, 4]

### reverse

#### `list.reverse() -> List`

Return a new list with the same elements as the old list, but in the opposite ordering.

	List(1, 2, 3, 4, 5).reverse()
	// -> [5, 4, 3, 2, 1]

### sort

#### `list.sort(comparator:Function) -> List`
#### `list.sort(comparator:String) -> List`
#### `list.sort() -> List`

Returns a new list with the same elements as the old list, but sorted based on the ordering given by the `comparator` function. The `comparator` follows the same format as those used with the [native array sort method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). If `comparator` is omitted, the elements are sorted using the `<` operator. If `comparator` is a string, the element are sorted by the values of that property using the default comparator function.

	List(4, 6, 1, 8, 10).sort()
	// -> [1, 4, 6, 8, 10]

	List({x: 5}, {x: 3}, {x: 4}).sort("x")
	// -> [{x: 3}, {x: 4}, {x: 5}]

	List({foo: 2, bar: 9}, {foo: 5, bar: 3})
		.sort(function (a, b) {
			return (a.foo + a.bar) - (b.foo + b.bar);
		});
	// -> [{foo: 5, bar: 3}, {foo: 2, bar: 9}]

### forEach

#### `list.forEach(callback:Function) -> list`

Calls the callback function on each element in the list, from first to last. The function is passed 3 arguments: the actual element, the index of the element, and the list which `forEach` was called on. This original list is returned unchanged and the return values of the callback function are ignored, so this method is for side-effects only.

This method performs in the same way as the `forEach` method on native JS Arrays.

	var xs = [];
	List("a", "b", "c").forEach(function (item, index) {
		xs.push(item, index);
	});
	// xs -> ["a", 0, "b", 1, "c", 2]

### forEachRight

#### `list.forEachRight(callback:Function) -> list`

Exactly the same as forEach, except the function is called on the elements in reverse order, from right to left.

	var xs = [];
	List("a", "b", "c").forEachRight(function (item, index) {
		xs.push(item, index);
	});
	// xs -> ["c", 2, "b", 1, "a", 0]

### map

#### `list.map(callback:Function) -> List`

Returns a new list containing the results of calling the callback function with each element of the list. The function is passed 3 arguments: the actual element, the index of the element, and the list which `map` was called on. 

	List(1, 2, 3, 4).map(function (item, index) {
		return item + index;
	});
	// -> [1, 3, 5, 7]

	List("a", "b", "c").map(function (item, index, source) {
		return source.join("") + item;
	});
	// -> ["abca", "abcb", "abcc"];

### lazyMap

#### `list.lazyMap(callback:Function) -> List`

Acts in the same way as map, but the callback function is applied when an element of the new list is accessed, rather than when the list is created. This reduces memory consumption by avoiding the creation of an intermediate list. `lazyMap` should only ever be used with pure functions, as the function may be called multiple times and the results are not cached. 

	List("foo", "bar", "baz").lazyMap(function (item) {
		return item.charAt(0);
	});
	// -> ["f", "b", "b"]
	