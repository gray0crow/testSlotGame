import * as PIXI from "pixi.js";
import { sound } from "../utils/sound";

/**
 * A simple reusable UI system 
 */
export class UI {
    public container: PIXI.Container;
    private app: PIXI.Application;
    private spinButton!: PIXI.Sprite;

    private buttonTextures: {
        normal: PIXI.Texture;
        disabled: PIXI.Texture;
    };

    // External callback for click event (assigned from outside)
    public onSpinClick?: () => void;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();

        // Initialize texture placeholders
        this.buttonTextures = {
            normal: PIXI.Texture.EMPTY,
            disabled: PIXI.Texture.EMPTY,
        };

        // Load textures once (self-contained)
        this.preloadButtonAssets().then(() => {
            this.createSpinButton();
     });
    }

    /**
     * Loads the textures for the spin button (normal, hover, disabled).
     */
    private async preloadButtonAssets(): Promise<void> {
        const assets = {
            normal: "assets/images/button_spin.png",
            disabled: "assets/images/button_spin_disabled.png",
        };

        try {
            const [normal, disabled] = await Promise.all([
                PIXI.Assets.load(assets.normal),
                PIXI.Assets.load(assets.disabled),
            ]);

            this.buttonTextures.normal = normal;
            this.buttonTextures.disabled = disabled;
        } catch (err) {
            console.warn("⚠️ Failed to load button textures:", err);
        }
    }

    /**
     * Creates the spin button and attaches UI interactions.
     */
    private createSpinButton(): void {
        this.spinButton = new PIXI.Sprite(this.buttonTextures.normal);

        this.spinButton.anchor.set(0.5);
        this.spinButton.anchor.set(0.5);
       // this.spinButton.width = 200;
       // this.spinButton.height = 120;
       this.spinButton.x = 650;
       this.spinButton.y = 780

        this.spinButton.interactive = true;
        this.spinButton.cursor = "pointer";

        // Pointer events
        this.spinButton.on("pointerover", this.onButtonOver.bind(this));
        this.spinButton.on("pointerout", this.onButtonOut.bind(this));
        this.spinButton.on("pointerdown", this.onButtonClick.bind(this));

        this.container.addChild(this.spinButton);
    }

    /**
     * Handles button click.
     * Plays sound and triggers external callback if defined.
     */
    private onButtonClick(): void {
        sound.play("Spin button");
        this.setEnabled(false); // optional: disable after click
        if (this.onSpinClick) this.onSpinClick();
    }

    /** Button hover effect */
    private onButtonOver(): void {
        this.spinButton.texture = this.buttonTextures.normal;
        this.spinButton.scale.set(1.05);
    }

    /** Reset button when pointer leaves */
    private onButtonOut(): void {
        this.spinButton.texture = this.buttonTextures.normal;
        this.spinButton.scale.set(1.0);
    }

    /**
     * Enables or disables the spin button externally.
     */
    public setEnabled(enabled: boolean): void {
        this.spinButton.texture = enabled ? this.buttonTextures.normal : this.buttonTextures.disabled;
        this.spinButton.interactive = enabled;
    }
}
