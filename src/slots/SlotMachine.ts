import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from "pixi-spine";

const REEL_COUNT = 4;
const SYMBOLS_PER_REEL = 6;
const SYMBOL_SIZE = 150;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;

export class SlotMachine {
    public container: PIXI.Container;
    private containerReels: PIXI.Container;
    private reels: Reel[];
    private app: PIXI.Application;
    private isSpinning: boolean = false;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;
    private stoppedReels: number= 0;
    public onSpinEnd?: () => void;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.containerReels = new PIXI.Container();
        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2) - 30;

        this.createBackground();
        this.createReels();
        this.createMask();

        this.initSpineAnimations();
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -20,
                SYMBOL_SIZE * SYMBOLS_PER_REEL + 40, // Width now based on symbols per reel
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createReels(): void {
        this.container.addChild(this.containerReels);
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE, i);
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING) + SYMBOL_SIZE / 2;
            this.containerReels.x = SYMBOL_SIZE;
            this.containerReels.addChild(reel.container);
            this.reels.push(reel);

            // Listen when this reel stops
            reel.container.on("reelStopped", this.onReelStopped.bind(this));
        }
    }

    private createMask(): void {
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff, 1);
        mask.drawRect(-SYMBOL_SIZE, 0, SYMBOL_SIZE * (SYMBOLS_PER_REEL),
            REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)
        );
        mask.endFill();
        this.containerReels.addChild(mask);
        this.containerReels.mask = mask;
    }

    public update(delta: number): void {
        // Update each reel
        for (const reel of this.reels) {
            reel.update(delta);
        }
    }

    public async spin() {
        if (this.isSpinning) return;

        this.isSpinning = true;

        //Start spin sound
        sound.play('Reel spin');

        await this.startReelsSequentially();
        await this.stopReelsSequentially();
    }

    /**
     * Starts all reels one after another with a short delay between each.
     */
    private async startReelsSequentially(): Promise<void> {
        const delayMs = 200;
        for (const reel of this.reels) {
            reel.startSpin();

            await this.delay(delayMs);
        }
    }

    private async stopReelsSequentially(): Promise<void> {
        const delayMs = 200;
        await this.delay(800); // Wait before stopping

        for (const reel of this.reels) {
            reel.stopSpin();
            await this.delay(delayMs);
        }
    }

    private onReelStopped(id: number): void {
        console.log(` Reel ${id} fully stopped`);
        this.stoppedReels++;

        // When all reels stopped — check win
        if (this.stoppedReels >= this.reels.length) {
            this.stoppedReels = 0; // reset for next spin
            this.onAllReelsStopped();
        }
    }

    private onAllReelsStopped(): void {
        this.isSpinning = false;
        sound.stop("Reel spin");

        this.checkWin();
        if (this.onSpinEnd) this.onSpinEnd();
    }

    /**
     * Utility helper to create a delay (async-friendly timeout)
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.3; 

        if (randomWin) {
            sound.play('win');
            console.log('Winner!');

            if (this.winAnimation) {
                // Try to play named animation 'big-boom-h' if exists, otherwise just show it briefly
                this.winAnimation.visible = true;
                try {
                    if (this.winAnimation.state && this.winAnimation.state.hasAnimation && this.winAnimation.state.hasAnimation('start')) {
                        this.winAnimation.state.setAnimation(0, 'start', false);
                        // hide when finished
                        this.winAnimation.state.addListener({
                            complete: (entry: any) => {
                                this.winAnimation!.visible = false;
                            }
                        });
                    }
                } catch (e) {
                    // If anything fails, ensure we hide it later
                    console.warn('Could not play win spine animation', e);
                    setTimeout(() => {
                        this.winAnimation!.visible = false;
                    }, 2000);
                }
            }
        }
    }

    private initSpineAnimations(): void {
        try {
            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }
                this.frameSpine.scale.set(0.8, 0.95);
                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                this.winAnimation.x = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT -1 )) / 2 + 150;
                this.winAnimation.y = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2 - 40;

                this.winAnimation.visible = false;
         
                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }
}
