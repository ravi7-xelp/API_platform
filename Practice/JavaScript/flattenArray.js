function flattenArray(arr) {
  let flattened = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flattened = flattened.concat(flattenArray(arr[i]));
    } else {
      flattened.push(arr[i]);
    }
  }
  return flattened;
}

let a = [1, 2, [4, 5], 6, 7, [8, 9, [10, 11], 12, 13], 14];
let flattenedArray = flattenArray(a);
console.log(flattenedArray); // Output: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

// let a = [1, 2, [4, 5], 6, 7, [8, 9, [10, 11], 12, 13], 14];
flattenedArray = a.flatMap(
  item =>
    Array.isArray(item)
      ? item.flatMap(x => (Array.isArray(x) ? x : [x]))
      : [item]
);
console.log(flattenedArray); // Output: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

// let a = [1, 2, [4, 5], 6, 7, [8, 9, [10, 11], 12, 13], 14];
a
  .flatMap(
    item =>
      Array.isArray(item)
        ? item.flatMap(x => (Array.isArray(x) ? x : [x]))
        : [item]
  )
  .forEach(item => console.log(item));

// let a = [1, 2, [4, 5], 6, 7, [8, 9, [10, 11], 12, 13], 14];
console.log([
  a
    .flatMap(
      item =>
        Array.isArray(item)
          ? item.flatMap(x => (Array.isArray(x) ? x : [x]))
          : [item]
    )
    .join(", ")
]);

// let a = [1, 2, [4, 5], 6, 7, [8, 9, [10, 11], 12, 13], 14];
flattenedArray = (function(arr) {
  return arr.reduce(
    (acc, curr) =>
      Array.isArray(curr)
        ? acc.concat(arguments.callee(curr))
        : acc.concat(curr),
    []
  );
})(a);
console.log(flattenedArray);
