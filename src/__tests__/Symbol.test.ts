import { Texture } from "pixi.js";
import { Symbol } from "../slots/Symbol";

describe("Symbol", () => {
  it("should scale proportionally and apply offset", () => {
    const texture = { width: 100, height: 50 } as unknown as Texture;
    const symbol = new Symbol(1, texture, 10);
    symbol.fitToSize(150);

    expect(symbol.sprite.scale.x).toBeGreaterThan(0);
    expect(symbol.sprite.scale.x).toBe(symbol.sprite.scale.y);
  });

  const mockTexture = { width: 100, height: 50 } as unknown as Texture;
  it("should initialize with correct ID and offset", () => {
    const symbol = new Symbol(3, mockTexture, 15);
    expect(symbol).toBeInstanceOf(Symbol);
    expect((symbol as any)._symIdx).toBe(3);
    expect((symbol as any)._offset).toBe(15);
  });

  it("should scale proportionally and apply offset", () => {
    const symbol = new Symbol(1, mockTexture, 10);
    symbol.fitToSize(150);

    // proportions stay consistent
    expect(symbol.sprite.scale.x).toBeCloseTo(symbol.sprite.scale.y, 3);

    // y offset is correctly applied
    expect(symbol.sprite.y).toBeCloseTo(150 / 2 + 10, 1);
  });

  it("should correctly update position", () => {
    const symbol = new Symbol(2, mockTexture);
    symbol.setPosition(300, 400);

    expect(symbol.x).toBe(300);
    expect(symbol.y).toBe(400);
  });

  it("should keep pivot centered after fitting", () => {
    const symbol = new Symbol(5, mockTexture, 0);
    symbol.fitToSize(120);

    expect(symbol.pivot.x).toBeCloseTo(60);
    expect(symbol.pivot.y).toBeCloseTo(60);
  });

});


