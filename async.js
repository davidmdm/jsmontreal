'use strict';

const Blackbird = require('./blackbird');

const _runner = (it, val, cb) => {
  const { value, done } = it.next(val);

  if (done) {
    return cb(null, value);
  }

  Blackbird.resolve(value)
    .then(res => _runner(it, res, cb))
    .catch(cb);
};

const Async = function(generator) {
  return function(...args) {
    const it = generator(...args);

    return new Blackbird((resolve, reject) => {
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

module.exports = Async;
