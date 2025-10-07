import { Howl } from "howler";

export const sound = (function () {
    const store: Record<string, Howl> = {};

  /**
   * Add a sound to the sound store
   * @param alias - Name/alias of the sound
   * @param url - Path or URL to the audio file
   */
  function add(alias: string, url: string): void {
    try {
        store[alias] = new Howl({ src: [url] });
    } catch (e) {
      console.warn("Failed to load sound:", alias, url, e);
    }
  }

  /**
   * Play a sound by alias
   * @param alias - Name of the sound
   * @param loop - Whether the sound should loop
   */
  function play(alias: string, loop: boolean = false): void {
    const sfx = store[alias];
    if (!sfx) {
      console.warn("Sound not found:", alias);
      return;
    }
    sfx.loop(loop);
    sfx.play();
  }

  /**
   * Stop a sound by alias
   * @param alias - Name of the sound
   */
  function stop(alias: string): void {
    const sfx = store[alias];
    if (!sfx) return;
    sfx.stop();
  }

  return { add, play, stop };
})();
