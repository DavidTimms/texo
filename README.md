Texo
====

Texo provides efficient immutable lists, as an alternative to JavaScript's native mutable arrays. It makes writing functional JavaScript easier and faster, with a simple object-oriented API. Texo allows features like lazy mapping and efficient concatenation, and it's easy to convert to and from JavaScript Arrays. Every Texo list is a function, so instead of something like `xs[3]`, just write `xs(3)`.

Basic Usage
-----------

Setup:

    npm install texo

    var list = require("texo");

Construct a list:

    var xs = list(1, 2, 3, 4);

You can also create a list from a JS array or a range of integers:

    list.fromArray([1, 2, 3, 4]);
	list.range(4, 8);

Every Texo list is a function, so you can call it with an index to get an item, 
or a negative index to access from the end of the list.

    var x1 = xs(2);
    var y2 = xs(-1);

You can test whether two lists are equal using `eq`.

	list.eq(list(1,2,3), list.fromArray([1,2,3])); // -> true

List Methods
-----------

Texo lists are immutable, so they cannot be modified by assignment or methods like `.pop()` or `.push()`. Instead, methods return a new list which has had the operation performed on it. This can be done in a memory efficient way by sharing data with the parent list.

Every list has the following methods:

### .toArray()
Convert the list to a JS array.

    list("foo", "bar").toArray(); // -> ["foo", "bar"]

### .join(str)
Convert the items of the list to a string with the delimiter str.

    list("a", "b", "c").join(" => "); // -> "a => b => c"

### .map(func)
Produce a new list by calling func on each item in the list.

    list("23", "43", "x").map(Number); // -> (23, 43, NaN)

### .lazyMap(func)
Just like `.map()` but the function is only called when the list item is accessed. This is more efficient than `.map()` for pure functions without side effects.

### .reduce(initialValue, func)
Calls func with each item in the list and the previous return value. The initial value is optional.

    list(4, 34, 7, 6).reduce(Math.max); // -> 34
    list(1, 2, 3, 4, 5).reduce(10, function (a, b) { return a + b }); // -> 25

### .filter(predicate)
Calls the predicate function on each item in the list and returns a new list with all the items which returned a true value.

    list(5, -2, 31, 0).filter(function (x) { return x > 0 }); // -> (5, 31)

### .replace(index1, newVal1, index2, newVal2, ...)
Returns a new list where the item at each index in the arguments is replaced with the following value.

    list("foo", "bar", "yo").replace(1, "zap"); // -> ("foo", "zap", "yo")
    list(1, 2, 3, 4).replace(0, 40, 2, 50, 3, 60); // -> (40, 2, 50, 60)

### .concat(anotherList)
Returns a new list which is the concatenation of the list with anotherList.

    list("a", "b").concat(list("c", "d")); // -> ("a", "b", "c", "b")

### .append(...items)
Returns a new list with the arguments added to the end of the list.

    list(10, 20).append(30, 40); // -> (10, 20, 30, 40)

### .prepend(...items)
Returns a new list with the arguments added to the beginning of the list.

    list(10, 20).prepend(30, 40); // -> (30, 40, 10, 20)

### .slice(startPoint, endPoint)
Returns a new list which is a subsection of the list, starting at startPoint and ending at (but not including) endPoint. If only one argument is provided, that is presumed to be the end point and the start point is presumed to be 0.

    list(1, 2, 3, 4, 5).slice(2); // -> (3, 4, 5)
    list(1, 2, 3, 4, 5).slice(1, 3); // -> (2, 3)

### .reverse()
Returns a reversed version of the list.

    list("a", "b", "c", "d").reverse(); // -> ("d", "c", "b", "a")

### .sort(sortFunction)
Returns a version of the list sorted based on sortFunction. It behaves just like the native array method, except if no sort function is provided, the items are sorted based on numerical ordering. If a string is passed as the sort function, the items will be sorted based on the numerical ordering of that key.

    list(10, 2, 30, 1, 3).sort(); // -> (1, 2, 3, 10, 30)

    list({x: 10, y: 15}, {x: 8, y: 19}).sort(function (a, b) {
        return a.x < b.x ? -1 : 1;
    });
    // -> ({x: 8, y: 19}, {x: 10, y: 15})

    // shorter way:
    list({x: 10, y: 15}, {x: 8, y: 19}).sort("x"); // -> ({x: 8, y: 19}, {x: 10, y: 15})

