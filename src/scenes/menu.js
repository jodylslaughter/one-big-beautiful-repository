window.MM = window.MM || {};
MM.MenuScene = class extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.cameras.main.setBackgroundColor('#1b1e2b');
    MM.State.reset();
    this.add.text(560, 120, "Mr. Napper's Mattress Mayhem", { color:'#fff', fontSize:'56px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 190, 'Shandus vs Bed Bugs, Kids, Bums, and One Fuel-Line Thief', { color:'#d8d8d8', fontSize:'22px' }).setOrigin(0.5);
    this.add.text(560, 260, 'Move: A/D or ←/→   Jump: W/↑   Attack: Space   Shoot: J   Shoo: E\nGround Pound: hold S/↓ + Space in air   Dog Summon: Q   Bark: R\nHeal (rep penalty): H sleep / T shoes', { color:'#e0e0e0', fontSize:'20px', align:'center' }).setOrigin(0.5);
    const play = this.add.rectangle(560, 430, 280, 84, 0x3ea66b).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor:true });
    this.add.text(560, 430, 'START SHIFT', { color:'#fff', fontSize:'38px', fontStyle:'bold' }).setOrigin(0.5);
    play.on('pointerover', () => play.setFillStyle(0x4fc57d));
    play.on('pointerout', () => play.setFillStyle(0x3ea66b));
    play.on('pointerdown', () => this.scene.start('Cutscene', { mode:'opening' }));
  }
};
