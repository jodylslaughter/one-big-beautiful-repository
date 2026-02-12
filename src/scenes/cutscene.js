window.MM = window.MM || {};
MM.CutsceneScene = class extends Phaser.Scene {
  constructor() { super('Cutscene'); }
  init(data) { this.mode = data.mode; }
  create() {
    this.cameras.main.setBackgroundColor('#151515');
    const lines = this.mode === 'opening' ? MM.Cutscenes.opening : MM.Cutscenes.final;
    this.add.rectangle(560, 220, 220, 120, 0x6a86b8);
    this.add.text(560, 380, lines[0], { color:'#fff', fontSize:'28px', align:'center', wordWrap:{ width:1000 }}).setOrigin(0.5);
    let i = 0;
    this.input.on('pointerdown', () => {
      i += 1;
      if (i < lines.length) this.children.list[this.children.list.length - 1].setText(lines[i]);
      else if (this.mode === 'opening') this.scene.start('Level', { stageId: MM.C.STAGES[0] });
      else this.scene.start('Boss');
    });
    this.add.text(560, 545, 'Click to continue', { color:'#a7a7a7', fontSize:'20px' }).setOrigin(0.5);
    this.add.text(560, 580, 'Controls reminder: A/D move • SPACE jump • K action • J spray', { color:'#8f8f8f', fontSize:'16px' }).setOrigin(0.5);
  }
};
