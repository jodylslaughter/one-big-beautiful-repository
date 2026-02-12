window.MM = window.MM || {};
MM.MenuScene = class extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.cameras.main.setBackgroundColor('#1b1e2b');
    MM.State.reset();

    this.add.text(560, 110, "Mr. Napper's Mattress Mayhem", { color:'#fff', fontSize:'56px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 175, 'Shandus vs Bed Bugs, Kids, Bums, and a Fuel-Line Thief', { color:'#d8d8d8', fontSize:'22px' }).setOrigin(0.5);
    this.add.text(
      560,
      260,
      'Core Controls:\nMove: A/D or ←/→    Jump: Space\nAction (stomp/shoo/pillow): K    Spray: J\nGround Pound: hold S/↓ + K (in air)\nDog: Q summon, R bark    Heal: H or T (rep down)',
      { color:'#e0e0e0', fontSize:'20px', align:'center' }
    ).setOrigin(0.5);

    const play = this.add.rectangle(560, 430, 300, 84, 0x3ea66b).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor:true });
    this.add.text(560, 430, 'START SHIFT', { color:'#fff', fontSize:'38px', fontStyle:'bold' }).setOrigin(0.5);
    play.on('pointerover', () => play.setFillStyle(0x4fc57d));
    play.on('pointerout', () => play.setFillStyle(0x3ea66b));
    play.on('pointerdown', () => this.scene.start('Cutscene', { mode:'opening' }));

    const atlasStatus = this.registry.get('atlasStatusText') || 'atlas status unavailable';
    this.add.text(560, 600, `Atlas: ${atlasStatus}`, { color:'#9fd4ff', fontSize:'14px' }).setOrigin(0.5);
  }
};
