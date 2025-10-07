const makePoint = () => ({
  x: 0,
  y: 0,
  set(x, y) {
    this.x = x;
    this.y = y;
  },
});

class BaseTexture {
  constructor() {
    this.width = 100;
    this.height = 100;
  }
}
class Sprite {
  constructor(texture) {
    this.texture = texture;
    this.anchor = makePoint();
    this.pivot = makePoint();
    this.scale = { x: 1, y: 1, set: (s) => { this.scale.x = this.scale.y = s; } };
    this.x = 0;
    this.y = 0;
  }
}

class Texture {
  static EMPTY = new Texture();
  constructor() {
    this.width = 100;
    this.height = 100;
  }
}

class Container {
  constructor() {
    this.addChild = jest.fn();
    this.removeChildren = jest.fn();
    this.pivot = makePoint();

    this._events = {};
  }

  on(event, cb) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(cb);
  }

  once(event, cb) {
    const wrapper = (...args) => {
      cb(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event, cb) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(fn => fn !== cb);
  }

  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(fn => fn(...args));
    }
  }
}

module.exports = {BaseTexture, Sprite, Texture, Container };
