'use strict';

class Blackbird {
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
      return new Blackbird((resolve, reject) => {
        try {
          resolve(cb(this.value));
        } catch (err) {
          reject(err);
        }
      });
    }

    if (this.state === 'rejected') {
      return new Blackbird((resolve, reject) => {
        if (!handler) {
          return reject(err);
        }
        try {
          resolve(handler(this.error));
        } catch (err) {
          reject(err);
        }
      });
    }

    return new Blackbird((resolve, reject) => {
      this.callbacks.push(x => {
        try {
          resolve(cb(x));
        } catch (err) {
          reject(err);
        }
      });

      if (handler) {
        this.handlers.push(x => {
          try {
            resolve(handler(x));
          } catch (err) {
            reject(err);
          }
        });
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

const fs = require('fs');

const readFile = file =>
  new Blackbird((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );

readFile('./.gitignore')
  .then(console.log)
  .then(() => readFile('./doesnotexist'))
  .then(() => console.log('weird there should be no file'))
  .catch(err => console.error('error:', err));
