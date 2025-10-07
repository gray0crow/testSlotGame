import { Texture } from "pixi.js";
import { Symbol } from "../slots/Symbol";

describe("Symbol", () => {
  it("should scale proportionally and apply offset", () => {
    const texture = { width: 100, height: 50 } as unknown as Texture;
    const symbol = new Symbol(1, texture, 10);
    symbol.fitToSize(150);

    expect(symbol.sprite.scale.x).toBeGreaterThan(0);
    expect(symbol.sprite.scale.x).toBe(symbol.sprite.scale.y);
    expect(symbol.sprite.y).toBe(10);
  });
});
