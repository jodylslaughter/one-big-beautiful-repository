window.MM = window.MM || {};
MM.SummaryScene = class extends Phaser.Scene {
  constructor() { super('Summary'); }
  init(data) { this.next = data.next; this.mode = data.mode; }
  create() {
    const r = MM.State.stageResult || { title:'Summary', result:'', money:0, rep:0, penalties:[] };
    this.cameras.main.setBackgroundColor('#1e1e1e');
    this.add.text(560, 90, 'Shift Summary', { color:'#fff', fontSize:'46px' }).setOrigin(0.5);
    this.add.text(560, 160, `${r.title} • ${r.result}`, { color:'#d9ecff', fontSize:'28px' }).setOrigin(0.5);
    this.add.text(560, 230, `Money Δ: ${r.money}   Reputation Δ: ${r.rep}`, { color:'#d2ffd2', fontSize:'24px' }).setOrigin(0.5);
    const list = r.penalties.length ? r.penalties.slice(-5).join('\n') : 'No notable penalties.';
    this.add.text(560, 340, list, { color:'#ffcbcb', fontSize:'20px', align:'center', wordWrap:{ width:900 } }).setOrigin(0.5);
    this.add.text(560, 500, `Totals:  HP ${MM.State.hp}/${MM.C.MAX_HP}   $${MM.State.money}   Rep ${MM.State.rep}`, { color:'#fff', fontSize:'24px' }).setOrigin(0.5);
    this.add.text(560, 570, 'Click to continue', { color:'#aaa', fontSize:'22px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.goNext());
  }

  goNext() {
    if (this.next === 'Lose') return this.scene.start('Lose');
    if (this.next === 'Cutscene') return this.scene.start('Cutscene', { mode:this.mode });
    if (this.next === 'Minigame') return this.scene.start('Minigame');
    if (this.next === 'Level') {
      MM.State.stageIndex += 1;
      const id = MM.C.STAGES[MM.State.stageIndex];
      return this.scene.start('Level', { stageId:id });
    }
  }
};
