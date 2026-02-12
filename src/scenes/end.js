window.MM = window.MM || {};
MM.WinScene = class extends Phaser.Scene {
  constructor() { super('Win'); }
  create() {
    this.cameras.main.setBackgroundColor('#16351b');
    this.add.text(560, 190, 'YOU WIN', { color:'#a8ffb5', fontSize:'74px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 280, `Final totals: $${Math.floor(MM.State.money)}  Rep ${Math.floor(MM.State.rep)}  Best Combo ${MM.State.maxCombo}`, { color:'#fff', fontSize:'30px', align:'center' }).setOrigin(0.5);
    this.add.text(560, 338, `Modifier played: ${MM.State.runModifier.name}`, { color:'#d6f3ff', fontSize:'20px' }).setOrigin(0.5);
    this.add.text(560, 540, 'Click to return to menu for a new random modifier run', { color:'#ddd', fontSize:'22px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Menu'));
  }
};
MM.LoseScene = class extends Phaser.Scene {
  constructor() { super('Lose'); }
  create() {
    this.cameras.main.setBackgroundColor('#3a1414');
    this.add.text(560, 220, 'SHIFT FAILED', { color:'#ff9e9e', fontSize:'74px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 300, `Totals: $${Math.floor(MM.State.money)}  Rep ${Math.floor(MM.State.rep)}  Combo ${MM.State.maxCombo}`, { color:'#fff', fontSize:'30px' }).setOrigin(0.5);
    this.add.text(560, 540, 'Click to retry from menu', { color:'#ddd', fontSize:'22px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Menu'));
  }
};
