window.MM = window.MM || {};
MM.LevelScene = class extends Phaser.Scene {
  constructor() { super('Level'); }
  init(data) { this.stageId = data.stageId; this.result = { money:0, rep:0, penalties:[] }; }

  create() {
    const cfg = MM.StageData[this.stageId];
    this.cfg = cfg;
    this.cameras.main.setBackgroundColor('#34444f');
    this.physics.world.setBounds(0, 0, 3200, MM.C.HEIGHT);

    this.platforms = this.physics.add.staticGroup();
    this.mattresses = [];
    this.createLayout();

    this.player = new MM.Player(this, 120, 460);
    this.physics.add.collider(this.player.body, this.platforms);
    this.cameras.main.startFollow(this.player.body, true, 0.08, 0.08);

    this.dog = new MM.Dog(this, this.player);
    this.enemies = [];
    this.projectiles = [];
    this.requiredKills = cfg.requiredKills;
    this.kills = 0;
    this.chaosMeter = 0;
    this.stageTime = 95;

    this.spawnStageEnemies();
    this.createPickups();
    this.exitDoor = this.add.rectangle(3070, 470, 40, 90, 0x84ffb8);
    this.physics.add.existing(this.exitDoor, true);

    this.hud = new MM.HUD(this);
    this.objective = this.add.text(16, 78, `${cfg.key}: ${cfg.objective}`, { color:'#fff', fontSize:'18px' }).setScrollFactor(0).setDepth(100);

    this.keys = this.input.keyboard.addKeys('A,D,W,S,LEFT,RIGHT,UP,DOWN,SPACE,J,E,Q,R,H,T');
  }

  createLayout() {
    const base = this.add.rectangle(1600, 610, 3200, 40, 0x606060);
    this.physics.add.existing(base, true); this.platforms.add(base);
    for (let i = 0; i < 12; i++) {
      const x = 250 + i * 240;
      const y = 500 - (i % 3) * 95;
      const bed = this.add.rectangle(x, y, 130, 24, 0xc1d5ef).setStrokeStyle(2, 0xffffff);
      this.physics.add.existing(bed, true);
      bed.isMattress = true;
      this.platforms.add(bed);
      this.mattresses.push(bed);
    }
  }

  spawnStageEnemies() {
    const spawn = (type, n) => { for (let i = 0; i < n; i++) this.enemies.push(MM.spawnEnemy(this, type, 500 + i * 280, 380)); };
    if (this.cfg.type === 'bugs') spawn('bug', 7);
    if (this.cfg.type === 'kids') spawn('child', 7);
    if (this.cfg.type === 'bums') spawn('bum', 6);
    if (this.cfg.type === 'mixed') { spawn('bug', 4); spawn('child', 3); spawn('bum', 3); }
    this.enemies.forEach((e) => this.physics.add.collider(e, this.platforms));
  }

  createPickups() {
    this.sprayPickup = this.add.rectangle(1240, 290, 26, 26, 0x9af7a8);
    this.physics.add.existing(this.sprayPickup, true);
    this.blanketPickup = this.add.rectangle(2240, 290, 26, 26, 0xb8b0ff);
    this.physics.add.existing(this.blanketPickup, true);
  }

  addPenalty(label, rep, money) {
    this.result.penalties.push(`${label}: rep ${rep}, money ${money}`);
    this.result.rep += rep;
    this.result.money += money;
    MM.State.rep = MM.Utils.clamp(MM.State.rep + rep, 0, 100);
    MM.State.money = Math.max(0, MM.State.money + money);
  }

  onGroundPoundLand(x, y) {
    this.add.circle(x, y + 10, 70, 0xffdd66, 0.2);
    this.enemies.forEach((e) => {
      if (!e.active) return;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < 85) this.hitEnemy(e, 2);
    });
  }

  hitEnemy(e, dmg) {
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.destroy();
      this.kills += 1;
      const gain = e.type === 'child' ? 4 : 7;
      this.result.money += gain;
      MM.State.money += gain;
    }
  }

  fireSpray() {
    if (!MM.State.sprayUnlocked || MM.State.sprayAmmo <= 0) return;
    MM.State.sprayAmmo -= 1;
    const p = this.add.rectangle(this.player.body.x + this.player.facing * 24, this.player.body.y, 18, 6, 0x9af7a8);
    this.physics.add.existing(p);
    p.body.setAllowGravity(false);
    p.body.setVelocityX(this.player.facing * 540);
    p.life = 1;
    this.projectiles.push(p);
  }

  tryStageComplete() {
    if (this.kills < this.requiredKills) return false;
    if (Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, this.exitDoor.x, this.exitDoor.y) < 90) return true;
    return false;
  }

  update(_time, deltaMs) {
    const dt = deltaMs / 1000;
    this.stageTime -= dt;
    const controls = {
      left: this.keys.A.isDown || this.keys.LEFT.isDown,
      right: this.keys.D.isDown || this.keys.RIGHT.isDown,
      down: this.keys.S.isDown || this.keys.DOWN.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.UP),
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
    };
    this.player.update(dt, controls);
    this.dog.update(dt);

    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.dog.summon();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.dog.bark(this.time.now, this.enemies);
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) this.fireSpray();
    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) this.player.heal(1, 2, 'Sleeping in store');
    if (Phaser.Input.Keyboard.JustDown(this.keys.T)) this.player.heal(1, 1, 'Shoes off in store');

    this.enemies.forEach((e) => {
      if (!e.active || !e.body) return;
      if (e.stun > 0) { e.stun -= dt; e.body.setVelocityX(0); return; }
      const dir = Math.sign(this.player.body.x - e.x);
      const speed = e.type === 'child' ? 155 : e.type === 'bug' ? 95 : 72;
      e.body.setVelocityX(dir * speed);
      if (e.type === 'child' && Math.random() < 0.004) {
        e.body.setVelocityY(-470);
        this.chaosMeter += 3;
      }
      if (e.type === 'bum' && Math.abs(e.body.velocity.x) < 10) {
        e.sleepTimer += dt;
        if (e.sleepTimer > 3) { this.addPenalty('Bum fell asleep on mattress', -5, 0); e.sleepTimer = 0; }
      }

      const onTop = this.player.body.body.velocity.y > 40 && this.player.body.y < e.y - 14 && Math.abs(this.player.body.x - e.x) < 24;
      if (onTop) {
        this.player.body.body.setVelocityY(-330);
        this.hitEnemy(e, 3);
        return;
      }

      if (MM.Utils.overlap(this.player.body, e, 34)) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
          this.hitEnemy(e, 3);
          if (e.type === 'child') this.chaosMeter = Math.max(0, this.chaosMeter - 14);
        } else {
          this.player.damage(1);
          if (e.type === 'bum' && Math.abs(this.player.body.x - e.x) < 30) this.addPenalty('Customer saw bum assault', -4, 0);
        }
      }
    });

    this.projectiles = this.projectiles.filter((p) => {
      if (!p.active || !p.body) return false;
      p.life -= dt;
      this.enemies.forEach((e) => { if (e.active && MM.Utils.overlap(p, e, 28)) { this.hitEnemy(e, 2); p.life = 0; } });
      if (p.life <= 0) { p.destroy(); return false; }
      return true;
    });

    if (this.physics.overlap(this.player.body, this.sprayPickup) && this.sprayPickup.active) {
      this.sprayPickup.destroy();
      MM.State.sprayUnlocked = true;
      MM.State.sprayAmmo += 16;
      this.add.text(this.player.body.x, this.player.body.y - 60, 'Bug Spray Unlocked!', { color:'#9af7a8', fontSize:'18px' });
    }

    if (this.physics.overlap(this.player.body, this.blanketPickup) && this.blanketPickup.active && MM.State.money >= 15) {
      this.blanketPickup.destroy();
      MM.State.money -= 15;
      this.enemies.forEach((e) => { if (e.active && e.type === 'bum') this.hitEnemy(e, 999); });
      this.add.text(this.player.body.x, this.player.body.y - 60, 'Blanket Donation done', { color:'#ddd', fontSize:'18px' });
    }

    this.mattresses.forEach((m) => {
      if (this.player.body.body.touching.down && this.player.body.y < m.y - 8 && Math.abs(this.player.body.x - m.x) < 70) {
        this.player.body.body.setVelocityY(-680);
      }
    });

    if (this.chaosMeter >= 100) {
      this.chaosMeter = 0;
      this.addPenalty('Chaos meter overflow', -6, -20);
    }

    this.hud.update(`${this.cfg.key}  KOs ${this.kills}/${this.requiredKills}  Chaos:${Math.floor(this.chaosMeter)} Time:${Math.ceil(this.stageTime)}`);

    if (MM.State.hp <= 0 || this.stageTime <= 0) {
      MM.State.stageResult = { title: this.cfg.key, result:'Failed shift', money:this.result.money, rep:this.result.rep, penalties:this.result.penalties };
      this.scene.start('Summary', { next:'Lose' });
    }

    if (this.tryStageComplete()) {
      MM.State.stageResult = { title: this.cfg.key, result:'Stage Cleared', money:this.result.money, rep:this.result.rep, penalties:this.result.penalties };
      const isLast = this.stageId === '1-4';
      if (isLast) this.scene.start('Summary', { next:'Cutscene', mode:'final' });
      else this.scene.start('Summary', { next:'Minigame' });
    }
  }
};
