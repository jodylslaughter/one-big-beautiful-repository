window.MM = window.MM || {};
MM.MenuScene = class extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.cameras.main.setBackgroundColor('#1b1e2b');
    MM.State.reset();

    this.add.text(560, 95, "Mr. Napper's Mattress Mayhem", { color:'#fff', fontSize:'54px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 155, 'Replayable Vertical Slice Build', { color:'#d8d8d8', fontSize:'20px' }).setOrigin(0.5);

    const modifier = MM.Utils.pick(MM.C.RUN_MODIFIERS);
    MM.State.runModifier = modifier;
    this.add.text(560, 210, `Tonight's Shift Modifier: ${modifier.name}`, { color:'#ffd88f', fontSize:'24px', fontStyle:'bold' }).setOrigin(0.5);
    this.add.text(560, 243, modifier.desc, { color:'#efe7c7', fontSize:'18px' }).setOrigin(0.5);

    this.add.text(
      560,
      320,
      'Core Controls:\nMove: A/D or ←/→    Jump: Space\nAction (stomp/shoo/pillow): K    Spray: J\nGround Pound: hold S/↓ + K (in air)\nDog: Q summon, R bark    Heal: H or T (rep down)',
      { color:'#e0e0e0', fontSize:'19px', align:'center' }
    ).setOrigin(0.5);

    const play = this.add.rectangle(560, 475, 300, 84, 0x3ea66b).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor:true });
    this.add.text(560, 475, 'START SHIFT', { color:'#fff', fontSize:'38px', fontStyle:'bold' }).setOrigin(0.5);
    play.on('pointerover', () => play.setFillStyle(0x4fc57d));
    play.on('pointerout', () => play.setFillStyle(0x3ea66b));
    play.on('pointerdown', () => this.scene.start('Cutscene', { mode:'opening' }));

    const atlasStatus = this.registry.get('atlasStatusText') || 'atlas status unavailable';
    this.add.text(560, 600, `Atlas: ${atlasStatus}`, { color:'#9fd4ff', fontSize:'14px' }).setOrigin(0.5);
  }
};
