window.MM = window.MM || {};
MM.MinigameScene = class extends Phaser.Scene {
  constructor() { super('Minigame'); }
  create() {
    this.mode = MM.Utils.pick(['sales', 'delivery']);
    this.cameras.main.setBackgroundColor('#20323a');
    if (this.mode === 'sales') this.createSales(); else this.createDelivery();
  }

  createSales() {
    this.turn = 1;
    this.success = 0;
    this.add.text(560, 100, 'Minigame: Sales Floor', { color:'#fff', fontSize:'40px' }).setOrigin(0.5);
    this.prompt = this.add.text(560, 210, '', { color:'#ddd', fontSize:'24px', align:'center', wordWrap:{ width:980 }}).setOrigin(0.5);
    this.opts = [
      this.add.text(240, 360, '1) Empathy + Budget Plan', { color:'#9ad', fontSize:'26px' }).setInteractive(),
      this.add.text(240, 410, '2) Hard close + urgency', { color:'#9ad', fontSize:'26px' }).setInteractive(),
      this.add.text(240, 460, '3) Upsell premium topper', { color:'#9ad', fontSize:'26px' }).setInteractive()
    ];
    this.opts.forEach((o, idx) => o.on('pointerdown', () => this.pickSales(idx)));
    this.refreshSalesPrompt();
  }

  refreshSalesPrompt() {
    const repFactor = MM.State.rep < 35 ? 'Customer distrust is HIGH.' : 'Customer is listening.';
    this.prompt.setText(`Turn ${this.turn}/3 • ${repFactor}\nClose at least 2 wins. Low reputation makes correct choice stricter.`);
  }

  pickSales(idx) {
    const good = MM.State.rep < 35 ? [0] : [0,2];
    if (good.includes(idx)) { this.success += 1; MM.State.money += idx === 2 ? 30 : 20; }
    else MM.State.money = Math.max(0, MM.State.money - 8);
    this.turn += 1;
    if (this.turn > 3) {
      MM.State.stageResult = { title:'Sales Minigame', result:this.success >= 2 ? 'Sale closed!' : 'Sale lost', money:this.success >= 2 ? 40 : -10, rep:0, penalties:[] };
      this.scene.start('Summary', { next:'Level' });
      return;
    }
    this.refreshSalesPrompt();
  }

  createDelivery() {
    this.add.text(560, 90, 'Minigame: Delivery Run', { color:'#fff', fontSize:'40px' }).setOrigin(0.5);
    this.add.text(560, 130, 'Carry mattresses to target doors (E to drop).', { color:'#ddd', fontSize:'22px' }).setOrigin(0.5);
    this.player = this.add.rectangle(120, 500, 34, 48, 0x4ea5ff); this.physics.add.existing(this.player);
    this.targetLabels = ['2B','3A','1C'];
    this.target = MM.Utils.pick(this.targetLabels);
    this.timer = 22; this.score = 0; this.carrying = true;
    this.doors = this.targetLabels.map((t,i) => ({ label:t, x:740 + i*110, y:500 }));
    this.doors.forEach((d) => this.add.rectangle(d.x, d.y, 70, 110, 0x777).setStrokeStyle(2, 0xddd));
    this.doorText = this.doors.map((d) => this.add.text(d.x, d.y-12, d.label, { color:'#fff', fontSize:'24px' }).setOrigin(0.5));
    this.carry = this.add.rectangle(this.player.x, this.player.y-50, 58, 26, 0xc1d5ef);
    this.status = this.add.text(20, 20, '', { color:'#fff', fontSize:'24px' });
    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,E');
  }

  update(_t, dms) {
    if (this.mode !== 'delivery') return;
    const dt = dms / 1000;
    this.timer -= dt;
    const dir = (this.keys.A.isDown || this.keys.LEFT.isDown ? -1 : 0) + (this.keys.D.isDown || this.keys.RIGHT.isDown ? 1 : 0);
    this.player.body.setVelocityX(dir * 250);
    this.player.x = MM.Utils.clamp(this.player.x, 20, MM.C.WIDTH - 20);
    if (this.carrying) this.carry.setPosition(this.player.x, this.player.y - 52);

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) && this.carrying) {
      const nearest = this.doors.find((door) => Math.abs(this.player.x - door.x) < 45);
      if (nearest) {
        if (nearest.label === this.target) { this.score += 1; MM.State.money += 30; }
        else this.timer -= 4;
        this.target = MM.Utils.pick(this.targetLabels);
      }
    }

    this.status.setText(`Target: ${this.target}   Time: ${Math.ceil(this.timer)}   Score: ${this.score}`);
    if (this.timer <= 0) {
      MM.State.stageResult = { title:'Delivery Minigame', result:'Route complete', money:this.score * 30, rep:0, penalties:[] };
      this.scene.start('Summary', { next:'Level' });
    }
  }
};
