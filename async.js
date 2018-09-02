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

const Async = function(generator) {
  const _runner = (it, val, cb) => {
    const { value, done } = it.next(val);

    if (done) {
      return cb(null, value);
    }

    Promise.resolve(value)
      .then(res => _runner(it, res, cb))
      .catch(cb);
  };

  return function(...args) {
    const it = generator(...args);

    return new Promise((resolve, reject) => {
      _runner(it, undefined, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
};

const add = Async(function*(a, b) {
  const x = yield a;
  const y = yield b;
  return x + y;
});

add(6, 5).then(console.log);
