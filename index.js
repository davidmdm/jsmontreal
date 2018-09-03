'use strict';

const fs = require('fs');

const Async = require('./async');
const Blackbird = require('./blackbird');

const write = (file, txt) =>
  new Blackbird((resolve, reject) =>
    fs.writeFile(file, txt, 'utf8', err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  );

const read = file =>
  new Blackbird((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );

const sleep = ms => new Blackbird(resolve => setTimeout(resolve, ms));

const run = Async(function*() {
  yield write('./jsmontreal.txt', 'Putting it all together now!');

  yield sleep(2000);

  const data = read('./jsmontreal.txt');

  return data;
});

run().then(console.log);
