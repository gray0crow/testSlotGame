import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';
import { Symbol } from "./Symbol";
import { Texture } from "pixi.js";
import { gsap } from "gsap";


interface SymbolConfig {
    name: string;        // texture filename
    offset: number;      // offset for visual fine-tuning
}

const SYMBOL_TEXTURES: SymbolConfig[] = [
    { name: 'symbol1.png', offset: 0 },
    { name: 'symbol2.png', offset: 0 },
    { name: 'symbol3.png', offset: 15 },
    { name: 'symbol4.png', offset: 15 },
    { name: 'symbol5.png', offset: 0 },
];

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down
const STOP_THRESHOLD = 2; // px/frame - when below this we snap

export class Reel {
    public container: PIXI.Container;
    //   private symbols: PIXI.Sprite[];
    private symbolSize: number;
    //   private symbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;

    private _idReel: number;
    private strip: PIXI.Container;
    private symbolCount: number;
    private symbols: Symbol[] = [];
    private offsetX: number = 0;
    private targetLayout: number[] | null = null; // JSON-defined layout to stop on


    constructor(symbolCount: number, symbolSize: number, idReel: number) {

        this._idReel = idReel;
        this.container = new PIXI.Container();
        this.symbols = [];
        this.symbolSize = symbolSize;
        this.symbolCount = symbolCount;

        this.strip = new PIXI.Container();
        this.container.addChild(this.strip);

        this.createSymbols();
    }

    /**
    * Creates symbols for the initial reel strip.
    */
    private createSymbols(): void {
        this.symbols = [];
        // Clear existing children from the strip
        this.strip.removeChildren();

        // Number of symbols to show continuously while spinning
        const totalSymbols = this.symbolCount * 2; // two full sets for smooth scrolling

        for (let i = 0; i < totalSymbols; i++) {
            // Create a random symbol (different textures each time)
            const symbol = this.createRandomSymbol();
            //const symbol = this.createSymbol(i % SYMBOL_TEXTURES.length);
            symbol.x = i * this.symbolSize;
            symbol.y = 0;
            this.symbols.push(symbol);
            this.strip.addChild(symbol);
        }
    }

    /**
     * Creates a random Symbol from available textures.
     */
    private createRandomSymbol(): Symbol {
        const randomIdx = Math.floor(Math.random() * SYMBOL_TEXTURES.length);
        const symbol = Symbol.createSymbols(randomIdx, this.symbolSize);
        return symbol
    }

    /**
     * Called every frame to update spinning position.
     */
    public async update(delta: number) {

        if (!this.isSpinning && this.speed === 0) return;
        const updateSymbols = () => {
            const coutSymbols = this.symbols.length 
            for (let i = 0; i < this.symbolCount; i++) {
                const sym = this.symbols[i];
                this.symbols[coutSymbols - this.symbolCount + i].update(sym.id);  
            }
            // made upddate new symbols what we don't see
            for (let i =0; i < coutSymbols - this.symbolCount; i++) {
                const randomIdx = Math.floor(Math.random() * SYMBOL_TEXTURES.length);
                this.symbols[i].update(randomIdx);  
            }    
         
        }
        this.offsetX -= this.speed * delta;
        const totalWidth = this.symbolCount * this.symbolSize;
        if (this.offsetX < 0) {
            this.offsetX += totalWidth;
            updateSymbols();
        } else if (this.offsetX >= totalWidth) {
            this.offsetX -= totalWidth;
            updateSymbols();
        }
        this.strip.x = -this.offsetX;
        if (this.speed == 0) {

            console.log('stopSpin ', this._idReel, this.strip.x, this.speed)
        }
        // If we're stopping, slow down the reel
        if (!this.isSpinning && this.speed > 0) {
            this.speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this.speed < 0.5) {
                this.speed = 0;
                await this.smoothSnapToGrid();
              //  this.isStopping = false;
            }
        }
    }

    /**
     * Smoothly tween the reel to the nearest aligned symbol with a soft bounce.
     */
    private async smoothSnapToGrid(): Promise<void> {

        const grid = this.symbolSize;
        const totalWidth = this.symbolCount * this.symbolSize;

        // Calculate the nearest grid position to snap to
        const remainder = this.offsetX % grid;
        const half = grid / 2;
        const targetOffset =
            remainder < half
                ? this.offsetX - remainder
                : this.offsetX + (grid - remainder);

        // Cancel any existing tweens to avoid overlap
        gsap.killTweensOf(this);

        console.log('smoothSnapToGrid', this._idReel, this.strip.x, this.speed);

        // Smooth transition to the nearest grid position
        await this.animateTo({
            duration: 0.8,
            targetOffset,
            totalWidth,
            ease: 'power3.out',
        });

        // Normalize the position after tween completes
        const normalizedTarget =
            ((targetOffset % totalWidth) + totalWidth) % totalWidth;
        this.offsetX = normalizedTarget;
        this.strip.x = Math.round(-normalizedTarget);

        // Small bounce animation to make the stop feel more natural
        await this.animateTo({
            duration: 0.1,
            targetOffset: targetOffset,// + grid * 0.1,
            totalWidth,
            ease: 'back.out',
        });

        //Final stabilization (stop movement and snap exactly to grid)
        this.speed = 0;
        const finalWrapped = ((this.offsetX % totalWidth) + totalWidth) % totalWidth;
        this.strip.x = Math.round(-finalWrapped);

        // Emit stop event
        this.container.emit("reelStopped", this._idReel);
    }

    private animateTo({ duration, targetOffset, totalWidth, ease, }: {
        duration: number; targetOffset: number; totalWidth: number; ease: string;
    }): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this, {
                duration,
                offsetX: targetOffset,
                ease,
                onUpdate: () => {
                    // Keep reel visually wrapped within totalWidth
                    const wrapped = ((this.offsetX % totalWidth) + totalWidth) % totalWidth;
                    this.strip.x = Math.round(-wrapped);
                },
                onComplete: resolve,
            });
        });
    }

    /**
     * Starts the spinning animation.
     */
    public startSpin(): void {

        console.log('startSpin ', this._idReel, this.speed)

        if (this.isSpinning) return;

        this.isSpinning = true;
        this.speed = SPIN_SPEED;
        console.log('startSpin--------- ', this._idReel, this.speed)
    }

    /**
     * Stops the spinning gradually.
     */
    public stopSpin(): void {
        console.log('stopSpin ', this._idReel)
        this.isSpinning = false;

        if (this.speed <= STOP_THRESHOLD) {
            this.speed = 0.5;
        }
    }

}
