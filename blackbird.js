'use strict';

class Blackbird {
  constructor(fn) {
    this.state = 'pending';
    this.callbacks = [];

    const resolve = value =>
      process.nextTick(() => {
        if (value instanceof Blackbird) {
          return value.then(resolve);
        }
        this.value = value;
        this.state = 'resolved';
        this.callbacks.forEach(cb => cb(this.value));
      });

    fn(resolve);
  }

  then(cb) {
    if (this.state === 'resolved') {
      return Blackbird.resolve(cb(this.value));
    }

    return new Blackbird(resolve => this.callbacks.push(x => resolve(cb(x))));
  }

  static resolve(value) {
    return new Blackbird(resolve => resolve(value));
  }

  static all(birds) {
    const result = [];
    let count = 0;
    return new Blackbird(resolve => {
      birds.forEach((bird, i) => {
        Blackbird.resolve(bird).then(val => {
          result[i] = val;
          count++;
          if (count === birds.length) {
            resolve(result);
          }
        });
      });
    });
  }
}

const asyncReturn = (val, ms) => new Blackbird(resolve => setTimeout(resolve, ms, val));

Blackbird.all([asyncReturn('hello', 1000), asyncReturn('jsmontreal', 2000)]).then(results => console.log(...results));
