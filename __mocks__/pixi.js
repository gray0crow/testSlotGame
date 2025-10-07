const makePoint = () => ({
  x: 0,
  y: 0,
  set(x, y) {
    this.x = x;
    this.y = y;
  },
});

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
  }
}

module.exports = { Sprite, Texture, Container };
