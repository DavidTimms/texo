var list = require("./texo.js");
var assert = require("assert");

function square (x) {
	return x * x;
}

var xs = list(1,2,3,4,5,6);
var ys = list.fromArray([7,8,9]);
var zs = xs.concat(ys);
var squared = zs.map(square);

assert(zs.count === xs.count + ys.count);
for (var i = 0; i < zs.count; i++) {
	assert(zs(i) === i + 1);
	assert(squared(i) === (i + 1) * (i + 1));
}
assert(xs(-2) === 5);
assert(zs(-3) === 7);
assert(squared(-4) === 36);
assert(squared(999) === undefined);
assert(squared(-999) === undefined);

assert(xs.toString() === "(1,2,3,4,5,6)");
assert(ys.toString() === "(7,8,9)");
assert(squared.inspect() === "(1,4,9,16,25,36,49,64,81)");

var appended = squared.append("foo", "bar");
assert(appended(5) === 36);
assert(appended(-2) === "foo");
assert(appended(10) === "bar");


var prepended = xs.prepend("foo", "bar");
assert(prepended(0) === "foo");
assert(prepended(1) === "bar");
assert(prepended(-3) === 4);

var plucked = list({name: "Dave"}, {name: "Mary"}, {name: "Alex"}).map("name");
assert(plucked.toString() === "(Dave,Mary,Alex)");

var summed = xs.reduce(function (a, b) { return a + b });
var stringified = ys.reduce("", function (a, b) { return a + b });
assert(summed === 21);
assert(stringified === "789");

assert(xs.toArray().toString() === ([1,2,3,4,5,6]).toString());

assert(list.eq(zs, list(1,2,3,4,5,6,7,8,9)));
assert(list.eq(appended.flatten(), appended));

var sliced = squared.slice(2, 6);
assert(list.eq(sliced, list(9,16,25,36)));
assert(sliced(4) === undefined);
assert(sliced(-1) === 36);

var resliced = sliced.slice(1);
assert(list.eq(resliced, list(16,25,36)));
assert(resliced._depth === sliced._depth);

var taken = xs.slice(2);
assert(list.eq(taken, list(3,4,5,6)));

var filtered = zs.filter(function (x) { return x > 4 });
assert(list.eq(filtered, list(5,6,7,8,9)));

var reversed = squared.reverse();
assert(list.eq(reversed, list(81,64,49,36,25,16,9,4,1)));

var sorted = list(2,45,1,10,6).sort();
assert(list.eq(sorted, list(1,2,6,10,45)));

var keySorted = list({name: "Dave"}, {name: "Mary"}, {name: "Alex"}).sort("name");
assert(keySorted(0).name === "Alex");
assert(keySorted(1).name === "Dave");
assert(keySorted(2).name === "Mary");

var evaluated = false;
var lazy = list(true).map(function (x) {evaluated = x});
assert(evaluated === false);
// force evaluation of element
lazy(0);
assert(evaluated === true);

var replaced = xs.replace(0, "first", 3, "middle");
assert(list.eq(replaced, list("first",2,3,"middle",5,6)));

var construction = list();
for (var i = 0; i < 200; i++) {
	construction = construction.append(i);
	assert(construction._depth < 26);
}

console.log("All tests passed");