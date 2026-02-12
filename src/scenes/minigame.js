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
    this.profile = MM.Utils.pick([
      { customer:'Budget Family', weakness:'value', opener:'Kids need better sleep but price is tight.' },
      { customer:'Night Shift Nurse', weakness:'durability', opener:'I need deep recovery after long shifts.' },
      { customer:'Skeptical Contractor', weakness:'proof', opener:'I have heard this store is chaos lately.' }
    ]);

    this.add.text(560, 90, 'Minigame: Sales Floor', { color:'#fff', fontSize:'40px' }).setOrigin(0.5);
    this.add.text(560, 130, 'Controls: Click a response. Close in 3 turns.', { color:'#ddd', fontSize:'18px' }).setOrigin(0.5);
    this.prompt = this.add.text(560, 205, '', { color:'#ddd', fontSize:'24px', align:'center', wordWrap:{ width:980 }}).setOrigin(0.5);

    this.opts = [
      this.add.text(190, 345, '', { color:'#9ad', fontSize:'24px' }).setInteractive(),
      this.add.text(190, 395, '', { color:'#9ad', fontSize:'24px' }).setInteractive(),
      this.add.text(190, 445, '', { color:'#9ad', fontSize:'24px' }).setInteractive()
    ];
    this.opts.forEach((o, idx) => o.on('pointerdown', () => this.pickSales(idx)));
    this.refreshSalesPrompt();
  }

  refreshSalesPrompt() {
    const hard = MM.State.rep < 35 || (MM.State.runModifier.salesHard || 1) > 1;
    this.goodChoice = this.profile.weakness === 'value' ? 0 : this.profile.weakness === 'durability' ? 2 : 1;
    this.goodChoice = hard && Math.random() < 0.35 ? (this.goodChoice + 1) % 3 : this.goodChoice;

    const options = [
      '1) Show budget bundle and monthly plan',
      '2) Show warranty + customer reviews',
      '3) Demo pressure relief + premium topper'
    ];
    this.opts.forEach((o, i) => o.setText(options[i]));

    this.prompt.setText(
      `Turn ${this.turn}/3 • ${this.profile.customer}\n"${this.profile.opener}"\nRep ${Math.floor(MM.State.rep)} (${hard ? 'hard mode' : 'normal'})`
    );
  }

  pickSales(idx) {
    const payoutMul = MM.State.runModifier.payout || 1;
    if (idx === this.goodChoice) {
      this.success += 1;
      MM.State.money += Math.floor((idx === 2 ? 34 : 24) * payoutMul);
      MM.State.rep = MM.Utils.clamp(MM.State.rep + 1, 0, 100);
    } else {
      MM.State.money = Math.max(0, MM.State.money - 10);
      MM.State.rep = MM.Utils.clamp(MM.State.rep - 2, 0, 100);
    }
    this.turn += 1;
    if (this.turn > 3) {
      const won = this.success >= 2;
      MM.State.stageResult = {
        title:'Sales Minigame',
        result: won ? 'Sale closed!' : 'Sale lost',
        money: won ? Math.floor(45 * payoutMul) : -12,
        rep: won ? 2 : -2,
        penalties: []
      };
      this.scene.start('Summary', { next:'Level' });
      return;
    }
    this.refreshSalesPrompt();
  }

  createDelivery() {
    this.add.text(560, 90, 'Minigame: Delivery Run', { color:'#fff', fontSize:'40px' }).setOrigin(0.5);
    this.add.text(560, 130, 'Controls: A/D or ←/→ move • E drop mattress at door', { color:'#ddd', fontSize:'22px' }).setOrigin(0.5);
    this.player = this.add.rectangle(120, 500, 34, 48, 0x4ea5ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.floor = this.add.rectangle(560, 612, 1120, 36, 0x555);
    this.physics.add.existing(this.floor, true);
    this.physics.add.collider(this.player, this.floor);

    this.targetLabels = ['2B','3A','1C','4D'];
    this.target = MM.Utils.pick(this.targetLabels);
    this.timer = 24;
    this.score = 0;
    this.streak = 0;
    this.carrying = true;
    this.deliveries = 0;

    this.doors = this.targetLabels.map((t,i) => ({ label:t, x:680 + i*100, y:500 }));
    this.doors.forEach((d) => this.add.rectangle(d.x, d.y, 70, 110, 0x777).setStrokeStyle(2, 0xddd));
    this.doors.forEach((d) => this.add.text(d.x, d.y-12, d.label, { color:'#fff', fontSize:'24px' }).setOrigin(0.5));

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
    if (this.carrying) this.carry.setPosition(this.player.x, this.player.y - 52);

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) && this.carrying) {
      const nearest = this.doors.find((door) => Math.abs(this.player.x - door.x) < 45);
      if (nearest) {
        if (nearest.label === this.target) {
          this.streak += 1;
          this.score += 1;
          const gain = Math.floor((24 + this.streak * 4) * (MM.State.runModifier.payout || 1));
          MM.State.money += gain;
          this.timer += 0.8;
          this.deliveries += 1;
        } else {
          this.streak = 0;
          this.timer -= 4;
        }
        this.target = MM.Utils.pick(this.targetLabels);
      }
    }

    this.status.setText(`Target:${this.target}  Time:${Math.ceil(this.timer)}  Score:${this.score}  Streak:${this.streak}`);
    if (this.timer <= 0 || this.deliveries >= 8) {
      MM.State.stageResult = {
        title:'Delivery Minigame',
        result:'Route complete',
        money:this.score * 24,
        rep: this.streak >= 3 ? 1 : 0,
        penalties: this.streak === 0 ? ['Wrong apartment slowed route'] : []
      };
      this.scene.start('Summary', { next:'Level' });
    }
  }
};
