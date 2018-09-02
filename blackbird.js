'use strict';

class Blackbird {
  constructor(fn) {
    this.state = 'pending';
    this.callbacks = [];

    const resolve = value => {
      this.value = value;
      this.state = 'resolved';
      this.callbacks.forEach(cb => cb(this.value));
    };

    fn(resolve);
  }

  then(cb) {
    if (this.state === 'resolved') {
      return new Blackbird(resolve => resolve(cb(this.value)));
    }

    return new Blackbird(resolve => this.callbacks.push(x => resolve(cb(x))));
  }
}

new Blackbird(resolve => setTimeout(resolve, 1000, 'hello Jsmontreal')).then(console.log);
