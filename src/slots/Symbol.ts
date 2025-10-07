import { Container, Sprite, Texture } from "pixi.js";
import { AssetLoader } from "../utils/AssetLoader";

/**
 * Represents a slot machine symbol.
 * 
 * This class is a PIXI.Container that holds:
 * - The main Sprite (the texture)
 * - Optional overlays, glow, or text layers in future
 */
export class Symbol extends Container {
    protected _symIdx: number;
    protected _offset: number;
    protected _sprite: Sprite;

    constructor(id: number, texture: Texture, offset: number = 0) {
        super();
        this._symIdx = id;
        this._offset = offset;

        // Create and configure the sprite
        this._sprite = new Sprite(texture);
        this._sprite.anchor.set(0.5);

        // Add the sprite to the container
        this.addChild(this._sprite);
    }

    /** Unique identifier for this symbol type */
    public get id(): number {
        return this._symIdx;
    }

    /**
     * Fits the symbol proportionally inside the given square size.
     * Keeps aspect ratio and applies vertical offset.
     */
    public fitToSize(symbolSize: number): void {
        if (!this._sprite.texture?.width || !this._sprite.texture?.height) return;

        const textureWidth = this._sprite.texture.width;
        const textureHeight = this._sprite.texture.height;

        // Proportional scaling
        const scale = Math.min(
            symbolSize / textureWidth,
            symbolSize / textureHeight
        );

        this._sprite.scale.set(scale);

        // Center the sprite vertically and apply offset
        this._sprite.y = symbolSize / 2 + this._offset;

        // Set container pivot so it aligns nicely when positioned
        this.pivot.set(symbolSize / 2, symbolSize / 2);
        this._sprite.x = 0;
    }

    /** Optional helper: center this symbol at a specific (x, y) coordinate */
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /** Access to inner sprite if needed (for effects or filters) */
    public get sprite(): Sprite {
        return this._sprite;
    }

    /**
   * Updates the symbol with a new texture and ID.
   * Optionally allows updating the vertical offset as well.
   */
    public update(newId: number): void {
        this._symIdx = newId;
        const list = Symbol.SYMBOL_TEXTURES;
        const { name, offset } = list[newId];
        let newTexture: Texture;
        try {
            newTexture = AssetLoader.getTexture(name);
        } catch {
            newTexture = Texture.EMPTY;
        }
        this._offset = offset;
        // Update sprite texture
        this._sprite.texture = newTexture;

        // If texture changed, it might have different dimensions — refit to size
        const parentSymbolSize = this.pivot.x * 2; // pivot.x = symbolSize/2 (set in fitToSize)
        if (parentSymbolSize > 0) {
            this.fitToSize(parentSymbolSize);
        } else {
            // fallback: reset position based on offset
            this._sprite.y = this._offset;
        }
    }

    /** Static config for all available symbols */
    public static readonly SYMBOL_TEXTURES: { name: string; offset: number }[] = [
        { name: "symbol1.png", offset: 0 },
        { name: "symbol2.png", offset: 0 },
        { name: "symbol3.png", offset: 15 },
        { name: "symbol4.png", offset: 15 },
        { name: "symbol5.png", offset: 0 },
    ];

    /** Creates a new Symbol instance from config */
    public static createSymbols(id: number, size: number): Symbol {
       
        const list = Symbol.SYMBOL_TEXTURES;
        const { name, offset } = list[id];
        let texture: Texture;
        try {
            texture = AssetLoader.getTexture(name);
        } catch {
            texture = Texture.EMPTY;
        }
        const symbol = new Symbol(id, texture,offset);
        symbol.fitToSize(size);
        return symbol;
    }


}
