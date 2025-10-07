import * as PIXI from 'pixi.js';
import { Reel } from '../slots/Reel';

describe('Reel', () => {
    
  let reel: Reel;
  beforeEach(() => {
    reel = new Reel(3, 100, 0);
  });

  it('should initialize with correct symbol count', () => {
    expect(reel.symbols.length).toBe(3 * 2);
  });

  it('should start spinning when startSpin() called', () => {
    reel.startSpin();
    expect(reel.isSpinning).toBe(true);
    expect(reel.speed).toBe(50);
  });

  it('should stop spinning when stopSpin() called', async () => {
    reel.startSpin();
    reel.stopSpin();
    expect(reel.isSpinning).toBe(false);
  });

  it('should wrap symbols correctly during update', () => {
    reel.startSpin();
    const oldX = reel.stripContainer.x;
    reel.update(1);
    expect(reel.stripContainer.x).not.toBe(oldX);
  });

});
