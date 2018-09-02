'use strict';

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

module.exports = Async;