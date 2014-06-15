var List = require("../texo.js");

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
test(List.range(4, 9), [4, 5, 6, 7, 8]);
test(List.range(2, -2), [2, 1, 0, -1]);
test(List.range(3), [0, 1, 2]);
test(List.range(0), []);
test(List.range(-1), [0]);
test(List.range().at(956), 956);
test(List.range().at(-2), undefined);

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

//prepend
test(List().prepend(List()), List(List()));
test(List(1, 2, 3).prepend(), [1, 2, 3]);
test(List("a", "b").prepend("c", "d"), ["c", "d", "a", "b"]);
test(List().prepend(2, 3, 4).prepend(5, 6, 7), [5, 6, 7, 2, 3, 4]);


//List.variadic
function sum(xs) {
	var total = 0;
	for (var i = 0; i < xs.length; i++) {
		total += xs.at(i);
	}
	return total;
}
var vsum = List.variadic(sum);
test(vsum(3, 6, 8, 4), sum(List(3, 6, 8, 4)));

var dropFirst = List.variadic(function (head, tail) {
	return tail;
});
test(dropFirst(1, 2, 3, 4), List(2, 3, 4));


if (allPassed) console.log("All tests passed");
