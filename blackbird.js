'use strict';

const _resolver = (resolve, reject, fn, val) => {
  try {
    resolve(fn(val));
  } catch (err) {
    reject(err);
  }
};

module.exports = class Blackbird {
  constructor(fn) {
    this.state = 'pending';
    this.callbacks = [];
    this.handlers = [];

    const reject = err =>
      process.nextTick(() => {
        if (err instanceof Blackbird) {
          return err.then(reject, reject);
        }
        this.error = err;
        this.state = 'rejected';
        if (this.handlers.length === 0) {
          console.error('unhandled promise rejection error %s: %s', err.message, err.stack);
        } else {
          this.handlers.forEach(handler => handler(this.error));
        }
      });

    const resolve = value =>
      process.nextTick(() => {
        if (value instanceof Blackbird) {
          return value.then(resolve, reject);
        }
        this.value = value;
        this.state = 'resolved';
        this.callbacks.forEach(cb => cb(this.value));
      });

    fn(resolve, reject);
  }

  then(cb, handler) {
    if (this.state === 'resolved') {
      return new Blackbird((resolve, reject) => _resolver(resolve, reject, cb, this.value));
    }

    if (this.state === 'rejected') {
      return new Blackbird((resolve, reject) => {
        if (!handler) {
          return reject(err);
        }
        _resolver(resolve, reject, handler, this.error);
      });
    }

    return new Blackbird((resolve, reject) => {
      this.callbacks.push(x => _resolver(resolve, reject, cb, x));

      if (handler) {
        this.handlers.push(x => _resolver(resolve, reject, handler, x));
      } else {
        this.handlers.push(x => reject(x));
      }
    });
  }

  catch(handler) {
    return this.then(x => x, handler);
  }

  static resolve(value) {
    return new Blackbird(resolve => resolve(value));
  }

  static reject(err) {
    return new Blackbird((_, reject) => reject(err));
  }

  static all(birds) {
    const result = [];
    let count = 0;
    return new Blackbird((resolve, reject) => {
      birds.forEach((bird, i) => {
        Blackbird.resolve(bird)
          .then(val => {
            result[i] = val;
            count++;
            if (count === birds.length) {
              resolve(result);
            }
          })
          .catch(reject);
      });
    });
  }
};
