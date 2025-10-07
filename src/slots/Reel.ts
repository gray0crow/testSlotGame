import * as PIXI from 'pixi.js';
import { Symbol } from "./Symbol";
import { gsap } from "gsap";


const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down
const STOP_THRESHOLD = 2; // px/frame - when below this we snap

export class Reel {
    public container: PIXI.Container;
    private symbolSize: number;
    private _speed: number = 0;
    private _isSpinning: boolean = false;

    private _idReel: number;
    private strip: PIXI.Container;
    private symbolCount: number;
    private _symbols: Symbol[] = [];
    private offsetX: number = 0;

    constructor(symbolCount: number, symbolSize: number, idReel: number) {

        this._idReel = idReel;
        this.container = new PIXI.Container();
        this._symbols = [];
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
        this._symbols = [];
        // Clear existing children from the strip
        this.strip.removeChildren();

        // Number of symbols to show continuously while spinning
        const totalSymbols = this.symbolCount * 2; // two full sets for smooth scrolling

        for (let i = 0; i < totalSymbols; i++) {
            // Create a random symbol (different textures each time)
            const symbol = this.createRandomSymbol();
            symbol.x = i * this.symbolSize;
            symbol.y = 0;
            this._symbols.push(symbol);
            this.strip.addChild(symbol);
        }
    }

    /**
     * Creates a random Symbol from available textures.
     */
    private createRandomSymbol(): Symbol {
        const randomIdx = Math.floor(Math.random()  * Symbol.SYMBOL_TEXTURES.length);
        const symbol = Symbol.createSymbols(randomIdx, this.symbolSize);
        return symbol
    }

    /**
     * Called every frame to update spinning position.
     */
    public async update(delta: number) {

        if (!this._isSpinning && this._speed === 0) return;
        const updateSymbols = () => {
            const coutSymbols = this._symbols.length 
            for (let i = 0; i < this.symbolCount; i++) {
                const sym = this._symbols[i];
                this._symbols[coutSymbols - this.symbolCount + i].update(sym.id);  
            }
            // made upddate new symbols what we don't see
            for (let i =0; i < coutSymbols - this.symbolCount; i++) {
                const randomIdx = Math.floor(Math.random() * Symbol.SYMBOL_TEXTURES.length);
                this._symbols[i].update(randomIdx);  
            }    
         
        }
        this.offsetX -= this._speed * delta;
        const totalWidth = this.symbolCount * this.symbolSize;
        if (this.offsetX < 0) {
            this.offsetX += totalWidth;
            updateSymbols();
        } else if (this.offsetX >= totalWidth) {
            this.offsetX -= totalWidth;
            updateSymbols();
        }
        this.strip.x = -this.offsetX;
        if (this._speed == 0) {

            console.log('stopSpin ', this._idReel, this.strip.x, this._speed)
        }
        // If we're stopping, slow down the reel
        if (!this._isSpinning && this._speed > 0) {
            this._speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this._speed < 0.5) {
                this._speed = 0;
                await this.smoothSnapToGrid();
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

        // Smooth transition to the nearest grid position
        await this.animateTo({
            duration: 0.6,
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
        this._speed = 0;
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

        if (this._isSpinning) return;

        this._isSpinning = true;
        this._speed = SPIN_SPEED;
    }

    /**
     * Stops the spinning gradually.
     */
    public stopSpin(): void {
        this._isSpinning = false;

        if (this._speed <= STOP_THRESHOLD) {
            this._speed = 0.5;
        }
    }

    // just for tests
    public  get symbols(): Symbol[] {
        return this._symbols;
    }

    public  get isSpinning(): boolean{
        return this._isSpinning;
    }

    public get speed(): number{
        return this._speed;
    }

    public get stripContainer(): PIXI.Container{
        return this.strip;
    }

    
}
