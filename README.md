# testSlotGame
Slot Machine Technical Test
This project is a horizontal slot machine built with TypeScript and PIXI.js, featuring spinning reels, sound effects, and a modular structure. Done as part of a technical assessment.

What it includes
* Smooth spinning of reels
* Reusable Symbol and Reel classes
* Basic sound system (Howler.js)
* PIXI-based UI: start button, layout, animations
* Extensible architecture for future features
* Unit tests (Jest)

Project Structure
__mocks__/..
assets/ ...
src/
├── slots/
│   ├── Symbol.ts      # Represents a symbol on a reel
│   ├── Reel.ts        # Handles spinning logic
│   └── SlotMachine.ts # Manages all reels and game flow
├── utils/
│   ├── AssetLoader.ts # Loads assets and textures
│   └── sound.ts       # Sound management with Howler
├── ui/
│   └── UI.ts          # UI controls and layout
└── __tests__/
    ├── Symbol.test.ts
    ├── Reel.test.ts
    └── SlotMachine.test.ts


Features
* Reels spin horizontally with GSAP
* Symbols recycle smoothly for continuous spinning
* Soft stop with bounce animation
* Emits reelStopped events
* Simple sound playback (play/stop)
* Responsive start button that adjusts to size

How to install and run

# Clone the repo
git clone <your_repo_url>
cd slot-machine

# Install dependencies
npm install

# Run in development mode
npm run dev

Assets like textures and sounds should be in the /assets/ folder.

Notes
Built with TypeScript, following SOLID principles
Modular and easy to test
Uses async/await and events for flow control
Animations with GSAP

Author: Vlasenko Anna
