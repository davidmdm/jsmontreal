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
      return new Blackbird(resolve => resolve(cb(this.value)));
    }

    return new Blackbird(resolve => this.callbacks.push(x => resolve(cb(x))));
  }
}

const asyncReturn = (val, ms) => new Blackbird(resolve => setTimeout(resolve, ms, val));

new Blackbird(resolve => setTimeout(resolve, 1000, asyncReturn('hello jsmontreal', 2000))).then(console.log);
