window.MM = window.MM || {};
MM.HUD = class {
  constructor(scene) {
    this.scene = scene;
    this.text = scene.add.text(16, 14, '', { fontFamily:'Arial', fontSize:'22px', color:'#fff' }).setDepth(100).setScrollFactor(0);
    this.sub = scene.add.text(16, 38, '', { fontFamily:'Arial', fontSize:'15px', color:'#d8e9ff' }).setDepth(100).setScrollFactor(0);
    this.repBarBg = scene.add.rectangle(16, 62, 220, 12, 0x000000).setOrigin(0, 0.5).setDepth(100).setScrollFactor(0);
    this.repBar = scene.add.rectangle(16, 62, 220, 12, 0x4bd96f).setOrigin(0, 0.5).setDepth(101).setScrollFactor(0);
  }
  update(extra, secondary) {
    this.text.setText(`HP ${MM.State.hp}/${MM.C.MAX_HP}   $${Math.floor(MM.State.money)}   Spray:${MM.State.sprayAmmo}   Combo:${MM.State.combo}` + (extra ? `   ${extra}` : ''));
    this.sub.setText(secondary || `Modifier: ${MM.State.runModifier.name} (${MM.State.runModifier.desc})`);
    this.repBar.width = 2.2 * MM.State.rep;
    this.repBar.setFillStyle(MM.State.rep < 30 ? 0xd9534f : 0x4bd96f);
  }
};
