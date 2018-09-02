'use strict';

class Blackbird {
  constructor(fn) {
    this.state = 'pending';

    const resolve = value => {
      this.value = value;
      this.state = 'resolved';
    };

    fn(resolve);
  }
}
