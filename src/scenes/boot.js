window.MM = window.MM || {};
MM.BootScene = class extends Phaser.Scene {
  constructor() { super('Boot'); }

  fileExists(path) {
    try {
      const req = new XMLHttpRequest();
      req.open('HEAD', path, false);
      req.send();
      return req.status >= 200 && req.status < 400;
    } catch (_e) {
      return false;
    }
  }

  preload() {
    const atlasDefs = [
      ['shandus', 'assets/atlases/shandus.png', 'assets/atlases/shandus.json'],
      ['boss', 'assets/atlases/boss.png', 'assets/atlases/boss.json'],
      ['enemies', 'assets/atlases/enemies.png', 'assets/atlases/enemies.json'],
      ['props', 'assets/atlases/props.png', 'assets/atlases/props.json']
    ];

    MM.State.atlases = MM.State.atlases || {};
    atlasDefs.forEach(([key]) => { MM.State.atlases[key] = false; });

    this.load.on('filecomplete', (key, type) => {
      if (type && type.includes('atlasjson')) MM.State.atlases[key] = true;
    });

    this.load.on('loaderror', (file) => {
      if (file && MM.State.atlases[file.key] !== undefined) MM.State.atlases[file.key] = false;
    });

    atlasDefs.forEach(([key, png, json]) => {
      if (this.fileExists(png) && this.fileExists(json)) {
        this.load.atlas(key, png, json);
      }
    });
  }

  create() {
    const msg = Object.entries(MM.State.atlases)
      .map(([k, ok]) => `${k}:${ok ? 'OK' : 'fallback'}`)
      .join(' | ');
    console.log('[AtlasStatus]', msg);
    this.registry.set('atlasStatusText', msg);
    this.scene.start('Menu');
  }
};
