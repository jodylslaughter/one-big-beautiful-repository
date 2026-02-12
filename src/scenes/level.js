window.MM = window.MM || {};
MM.LevelScene = class extends Phaser.Scene {
  constructor() { super('Level'); }
  init(data) { this.stageId = data.stageId; this.result = { money:0, rep:0, penalties:[] }; }

  create() {
    const cfg = MM.StageData[this.stageId];
    this.cfg = cfg;
    this.mod = MM.State.runModifier || { payout:1, enemySpeed:1, enemyCount:1, extraWaves:0, chaosMul:1, repDecay:1, salesHard:1 };
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
    this.requiredKills = Math.max(2, Math.floor(cfg.requiredKills * (this.mod.enemyCount || 1)));
    this.kills = 0;
    this.chaosMeter = 0;
    this.stageTime = 95;
    this.waveBudget = (cfg.type === 'mixed' ? 2 : 1) + (this.mod.extraWaves || 0);
    this.nextWaveAt = 20;
    this.comboTimer = 0;

    this.spawnStageEnemies();
    this.createPickups();
    this.exitDoor = MM.Utils.makeSpriteOrRect(this, {
      x: 3070, y: 470, atlasKey: 'props', frame: 'exit_door_01', width: 40, height: 90, color: 0x84ffb8
    });
    this.physics.add.existing(this.exitDoor, true);

    this.hud = new MM.HUD(this);
    this.objective = this.add.text(16, 82, `${cfg.key}: ${cfg.objective}`, { color:'#fff', fontSize:'18px' }).setScrollFactor(0).setDepth(100);
    this.controlsHint = this.add.text(16, 106, 'Controls: A/D move, SPACE jump, K action, J spray, E shoo, Q dog, R bark', { color:'#dfdfdf', fontSize:'16px' }).setScrollFactor(0).setDepth(100);

    this.keys = this.input.keyboard.addKeys('A,D,S,LEFT,RIGHT,DOWN,SPACE,J,E,Q,R,H,T,K');
    this.trampolineCooldown = 0;
    this.wasPlayerGrounded = false;
  }

  createLayout() {
    const base = MM.Utils.makeSpriteOrRect(this, {
      x: 1600, y: 610, atlasKey: 'props', frame: 'floor_01', width: 3200, height: 40, color: 0x606060
    });
    this.physics.add.existing(base, true); this.platforms.add(base);
    for (let i = 0; i < 12; i++) {
      const x = 250 + i * 240;
      const y = 500 - (i % 3) * 95;
      const bed = MM.Utils.makeSpriteOrRect(this, {
        x, y, atlasKey: 'props', frame: 'mattress_01', width: 130, height: 24, color: 0xc1d5ef
      });
      if (bed.setStrokeStyle) bed.setStrokeStyle(2, 0xffffff);
      this.physics.add.existing(bed, true);
      bed.isMattress = true;
      this.platforms.add(bed);
      this.mattresses.push(bed);
    }
  }

  spawnStageEnemies(countOverride) {
    const spawn = (type, n) => {
      for (let i = 0; i < n; i++) {
        const e = MM.spawnEnemy(this, type, 460 + i * 250 + Phaser.Math.Between(-90, 110), 370);
        e.wanderTarget = e.x + Phaser.Math.Between(-200, 200);
        e.jumpCooldown = Phaser.Math.FloatBetween(0.2, 1.2);
        e.personality = MM.Utils.pick(['aggressive', 'erratic', 'coward']);
        this.enemies.push(e);
        this.physics.add.collider(e, this.platforms);
      }
    };

    const scale = countOverride || 1;
    if (this.cfg.type === 'bugs') spawn('bug', Math.max(2, Math.floor(7 * scale)));
    if (this.cfg.type === 'kids') spawn('child', Math.max(2, Math.floor(7 * scale)));
    if (this.cfg.type === 'bums') spawn('bum', Math.max(2, Math.floor(6 * scale)));
    if (this.cfg.type === 'mixed') {
      spawn('bug', Math.max(2, Math.floor(4 * scale)));
      spawn('child', Math.max(2, Math.floor(3 * scale)));
      spawn('bum', Math.max(2, Math.floor(3 * scale)));
    }
  }

  spawnReinforcementWave() {
    if (this.waveBudget <= 0) return;
    this.waveBudget -= 1;
    const typePool = this.cfg.type === 'mixed' ? ['bug', 'child', 'bum'] : [this.cfg.type === 'kids' ? 'child' : this.cfg.type === 'bums' ? 'bum' : 'bug'];
    const type = MM.Utils.pick(typePool);
    const waveN = 2 + Phaser.Math.Between(0, 2);
    for (let i = 0; i < waveN; i++) {
      const e = MM.spawnEnemy(this, type, this.player.body.x + Phaser.Math.Between(420, 760), 300 + Phaser.Math.Between(-40, 40));
      e.wanderTarget = e.x + Phaser.Math.Between(-170, 170);
      e.jumpCooldown = Phaser.Math.FloatBetween(0.2, 1.0);
      e.personality = MM.Utils.pick(['aggressive', 'erratic', 'coward']);
      this.enemies.push(e);
      this.physics.add.collider(e, this.platforms);
    }
    this.add.text(this.player.body.x + 180, 120, `Wave incoming: ${type}s!`, { color:'#ffd37a', fontSize:'20px' });
  }

  createPickups() {
    this.sprayPickup = MM.Utils.makeSpriteOrRect(this, {
      x: 1240, y: 290, atlasKey: 'props', frame: 'spray_pickup_01', width: 26, height: 26, color: 0x9af7a8
    });
    this.physics.add.existing(this.sprayPickup, true);
    this.blanketPickup = MM.Utils.makeSpriteOrRect(this, {
      x: 2240, y: 290, atlasKey: 'props', frame: 'blanket_pickup_01', width: 26, height: 26, color: 0xb8b0ff
    });
    this.physics.add.existing(this.blanketPickup, true);
  }

  addPenalty(label, rep, money) {
    this.result.penalties.push(`${label}: rep ${rep}, money ${money}`);
    this.result.rep += rep;
    this.result.money += money;
    MM.State.rep = MM.Utils.clamp(MM.State.rep + rep, 0, 100);
    MM.State.money = Math.max(0, MM.State.money + money);
    MM.State.combo = 0;
    this.comboTimer = 0;
  }

  onGroundPoundLand(x, y) {
    this.add.circle(x, y + 10, 70, 0xffdd66, 0.2);
    this.cameras.main.shake(80, 0.0035);
    this.enemies.forEach((e) => {
      if (!e.active) return;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < 90) this.hitEnemy(e, 2, 'groundPound');
    });
  }

  getKillMultiplier() {
    return MM.Utils.clamp(1 + Math.floor(MM.State.combo / 4) * 0.25, 1, 2.5);
  }

  rewardDrop(x, y) {
    const roll = Math.random();
    if (roll < 0.1) {
      const ammo = this.add.rectangle(x, y, 10, 10, 0x9af7a8);
      this.physics.add.existing(ammo);
      ammo.body.setAllowGravity(false);
      ammo.life = 8;
      ammo.type = 'ammo';
      this.projectiles.push(ammo);
    } else if (roll < 0.14) {
      const heart = this.add.rectangle(x, y, 10, 10, 0xff8f8f);
      this.physics.add.existing(heart);
      heart.body.setAllowGravity(false);
      heart.life = 8;
      heart.type = 'heal';
      this.projectiles.push(heart);
    }
  }

  hitEnemy(e, dmg, source) {
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.destroy();
      this.kills += 1;
      MM.State.combo += 1;
      MM.State.maxCombo = Math.max(MM.State.maxCombo, MM.State.combo);
      this.comboTimer = 4;

      const base = e.type === 'child' ? 4 : 7;
      const gain = Math.floor(base * this.getKillMultiplier() * (this.mod.payout || 1));
      this.result.money += gain;
      MM.State.money += gain;
      if (source === 'groundPound') MM.State.rep = MM.Utils.clamp(MM.State.rep + 1, 0, 100);
      this.rewardDrop(e.x, e.y - 20);
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
    p.type = 'spray';
    this.projectiles.push(p);
  }

  tryStageComplete() {
    return this.kills >= this.requiredKills && Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, this.exitDoor.x, this.exitDoor.y) < 90;
  }

  updateEnemyAI(e, dt) {
    if (!e.active || !e.body) return;
    if (e.stun > 0) { e.stun -= dt; e.body.setVelocityX(0); return; }

    e.jumpCooldown -= dt;
    if (Math.abs(e.x - e.wanderTarget) < 40 || Math.random() < 0.006) {
      e.wanderTarget = e.x + Phaser.Math.Between(-260, 260);
      e.wanderTarget = MM.Utils.clamp(e.wanderTarget, 100, 3050);
    }

    let targetX = this.player.body.x;
    if (e.personality === 'erratic' && Math.random() < 0.5) targetX = e.wanderTarget;
    if (e.personality === 'coward') targetX = this.player.body.x + (e.x < this.player.body.x ? -200 : 200);

    let dir = Math.sign(targetX - e.x);
    if (!dir) dir = 1;

    const speedBase = e.type === 'child' ? Phaser.Math.Between(130, 190) : e.type === 'bug' ? Phaser.Math.Between(80, 125) : 72;
    const speed = speedBase * (this.mod.enemySpeed || 1) * MM.State.difficulty;
    e.body.setVelocityX(dir * speed);

    if (e.setFrame) {
      if (e.type === 'bug' && MM.Utils.textureHasFrame(this, 'enemies', 'bedbug_walk_01')) e.setFrame('bedbug_walk_01');
      if (e.type === 'child' && MM.Utils.textureHasFrame(this, 'enemies', 'kid_run_01')) e.setFrame('kid_run_01');
    }

    const onGround = e.body.blocked.down || e.body.touching.down;
    const nearMattress = this.mattresses.some((m) => Math.abs(e.x - m.x) < 90 && e.y > m.y - 65);
    const jumpChance = e.type === 'child' ? 0.03 : 0.015;
    if (onGround && e.jumpCooldown <= 0 && (nearMattress || Math.random() < jumpChance)) {
      e.body.setVelocityY(-(e.type === 'child' ? 520 : 430));
      e.jumpCooldown = Phaser.Math.FloatBetween(0.45, 1.45);
      if (e.type === 'child') this.chaosMeter += 4 * (this.mod.chaosMul || 1);
    }

    if (e.type === 'bum') {
      if (Math.abs(e.body.velocity.x) < 12) {
        e.sleepTimer += dt;
        if (e.sleepTimer > 3) { this.addPenalty('Bum fell asleep on mattress', -5 * (this.mod.repDecay || 1), 0); e.sleepTimer = 0; }
      } else e.sleepTimer = 0;
    }
  }

  update(_time, deltaMs) {
    const dt = deltaMs / 1000;
    this.stageTime -= dt;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0 && MM.State.combo > 0) MM.State.combo = Math.max(0, MM.State.combo - 1);

    const controls = {
      left: this.keys.A.isDown || this.keys.LEFT.isDown,
      right: this.keys.D.isDown || this.keys.RIGHT.isDown,
      down: this.keys.S.isDown || this.keys.DOWN.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.SPACE),
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.K)
    };
    this.player.update(dt, controls);
    this.dog.update(dt);

    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.dog.summon();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.dog.bark(this.time.now, this.enemies);
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) this.fireSpray();
    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) this.player.heal(1, 2, 'Sleeping in store');
    if (Phaser.Input.Keyboard.JustDown(this.keys.T)) this.player.heal(1, 1, 'Shoes off in store');

    if (this.stageTime < this.nextWaveAt && this.waveBudget > 0) {
      this.spawnReinforcementWave();
      this.nextWaveAt -= Phaser.Math.Between(14, 20);
    }

    this.enemies.forEach((e) => {
      this.updateEnemyAI(e, dt);

      const onTop = this.player.body.body.velocity.y > 40 && this.player.body.y < e.y - 14 && Math.abs(this.player.body.x - e.x) < 24;
      if (onTop) {
        this.player.body.body.setVelocityY(-330);
        this.hitEnemy(e, 3, 'stomp');
        return;
      }

      if (MM.Utils.overlap(this.player.body, e, 34)) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.K)) {
          this.hitEnemy(e, 3, 'shoo');
          if (e.type === 'child') this.chaosMeter = Math.max(0, this.chaosMeter - 14);
        } else {
          this.player.damage(1);
          if (e.type === 'bum') this.addPenalty('Customer saw bum assault', -4, 0);
        }
      }
    });

    this.projectiles = this.projectiles.filter((p) => {
      if (!p.active || !p.body) return false;
      p.life -= dt;

      if (p.type === 'spray') {
        this.enemies.forEach((e) => { if (e.active && MM.Utils.overlap(p, e, 28)) { this.hitEnemy(e, 2, 'spray'); p.life = 0; } });
      } else if (MM.Utils.overlap(this.player.body, p, 18)) {
        if (p.type === 'ammo') MM.State.sprayAmmo += 4;
        if (p.type === 'heal') MM.State.hp = MM.Utils.clamp(MM.State.hp + 1, 0, MM.C.MAX_HP);
        p.life = 0;
      }

      if (p.life <= 0) { p.destroy(); return false; }
      return true;
    });

    if (this.sprayPickup.active && this.physics.overlap(this.player.body, this.sprayPickup)) {
      this.sprayPickup.destroy();
      MM.State.sprayUnlocked = true;
      MM.State.sprayAmmo += 16;
      this.add.text(this.player.body.x, this.player.body.y - 60, 'Bug Spray Unlocked!', { color:'#9af7a8', fontSize:'18px' });
    }

    if (this.blanketPickup.active && this.physics.overlap(this.player.body, this.blanketPickup) && MM.State.money >= 15) {
      this.blanketPickup.destroy();
      MM.State.money -= 15;
      this.enemies.forEach((e) => { if (e.active && e.type === 'bum') this.hitEnemy(e, 999, 'donation'); });
      this.add.text(this.player.body.x, this.player.body.y - 60, 'Blanket Donation done', { color:'#ddd', fontSize:'18px' });
    }

    this.trampolineCooldown -= dt;
    const pb = this.player.body.body;
    const playerOnGround = pb.blocked.down || pb.touching.down;
    const justLanded = playerOnGround && !this.wasPlayerGrounded;
    if (this.trampolineCooldown <= 0 && justLanded) {
      const bounceMattress = this.mattresses.find((m) => Math.abs(this.player.body.x - m.x) < 72 && this.player.body.y < m.y - 6);
      if (bounceMattress) {
        pb.setVelocityY(-640);
        this.trampolineCooldown = 0.22;
      }
    }
    this.wasPlayerGrounded = playerOnGround;

    if (this.chaosMeter >= 100) {
      this.chaosMeter = 0;
      this.addPenalty('Chaos meter overflow', -6 * (this.mod.repDecay || 1), -20);
    }

    const barkCd = Math.max(0, Math.ceil((this.dog.nextBark - this.time.now) / 1000));
    this.hud.update(
      `${this.cfg.key}  KOs ${this.kills}/${this.requiredKills}  Chaos:${Math.floor(this.chaosMeter)} Time:${Math.ceil(this.stageTime)}`,
      `Combo x${this.getKillMultiplier().toFixed(2)} | Bark CD:${barkCd}s | Waves:${this.waveBudget}`
    );

    if (MM.State.hp <= 0 || this.stageTime <= 0) {
      MM.State.stageResult = {
        title: this.cfg.key,
        result:'Failed shift',
        money:this.result.money,
        rep:this.result.rep,
        penalties:this.result.penalties,
        maxCombo: MM.State.maxCombo
      };
      this.scene.start('Summary', { next:'Lose' });
      return;
    }

    if (this.tryStageComplete()) {
      MM.State.stageResult = {
        title: this.cfg.key,
        result:'Stage Cleared',
        money:this.result.money,
        rep:this.result.rep,
        penalties:this.result.penalties,
        maxCombo: MM.State.maxCombo
      };
      MM.State.difficulty = MM.Utils.clamp(MM.State.difficulty + 0.07, 1, 1.65);
      const isLast = this.stageId === '1-4';
      if (isLast) this.scene.start('Summary', { next:'Cutscene', mode:'final' });
      else this.scene.start('Summary', { next:'Minigame' });
    }
  }
};
