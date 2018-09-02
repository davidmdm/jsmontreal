'use strict';

/*

- async is operator

- async takes as an argument a function? a function like object... await is not supported in functions

- the return of async is a function, who's return value is always a promise

*/

const multiply = async function(a, b) {
  const x = await a;
  const y = await b;
  return x * y;
};

multiply(5, 6).then(console.log);
