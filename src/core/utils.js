window.MM = window.MM || {};
MM.Utils = {
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  overlap(a, b, pad) { return Math.abs(a.x - b.x) < pad && Math.abs(a.y - b.y) < pad; },

  atlasReady(key) {
    return !!(MM.State && MM.State.atlases && MM.State.atlases[key]);
  },

  textureHasFrame(scene, atlasKey, frame) {
    if (!scene.textures.exists(atlasKey)) return false;
    const tx = scene.textures.get(atlasKey);
    return tx && tx.has(frame);
  },

  makeSpriteOrRect(scene, opts) {
    const { x, y, atlasKey, frame, width = 32, height = 32, color = 0xffffff } = opts;
    if (atlasKey && frame && MM.Utils.atlasReady(atlasKey) && MM.Utils.textureHasFrame(scene, atlasKey, frame)) {
      const spr = scene.add.sprite(x, y, atlasKey, frame);
      spr.setDisplaySize(width, height);
      return spr;
    }
    return scene.add.rectangle(x, y, width, height, color);
  }
};
