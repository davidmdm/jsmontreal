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

// therefore we should be able to write a function "Async"

const Async = function(generator) {
  return function() {
    return; // promise
  };
};

// such that this function is analagous to async/await

const add = Async(function*(a, b) {
  const x = yield a;
  const y = yield b;
  return x + y;
});
