window.MM = window.MM || {};
MM.BootScene = class extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
};
