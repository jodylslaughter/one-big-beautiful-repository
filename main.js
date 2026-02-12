
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1b1e2b');

    this.add
      .text(GAME_WIDTH / 2, 140, 'Mattress Mayhem', {
        fontFamily: 'Arial',
        fontSize: '56px',
        color: '#f0f0f0',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 210, 'WASD / Arrows to move • Space to attack', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#d8d8d8'
      })
      .setOrigin(0.5);

    const playButton = this.add
      .rectangle(GAME_WIDTH / 2, 320, 260, 84, 0x3ea66b)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(playButton.x, playButton.y, 'PLAY', {
        fontFamily: 'Arial',
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    playButton.on('pointerover', () => playButton.setFillStyle(0x4fc57d));
    playButton.on('pointerout', () => playButton.setFillStyle(0x3ea66b));
    playButton.on('pointerdown', () => this.scene.start('MattressStoreScene'));
  }
}

class BaseCombatScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.playerMaxHp = 100;
    this.attackDuration = 180;
    this.attackCooldown = 260;
  }

  createCommonWorld(backgroundColor, levelLabel) {
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.player = this.add.rectangle(90, GAME_HEIGHT / 2, 42, 42, 0x4ea5ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.hp = this.playerMaxHp;
    this.player.isInvulnerable = false;

    this.playerAttack = this.add.rectangle(this.player.x, this.player.y, 48, 48, 0xfff34f, 0.35);
    this.physics.add.existing(this.playerAttack);
    this.playerAttack.body.setAllowGravity(false);
    this.playerAttack.body.setImmovable(true);
    this.playerAttack.activeWindow = false;
    this.playerAttack.setVisible(false);

    this.enemies = this.physics.add.group();

    this.levelText = this.add
      .text(20, 16, levelLabel, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#f5f5f5',
        fontStyle: 'bold'
      })
      .setDepth(20);

    this.playerHpText = this.add
      .text(20, 48, '', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
      })
      .setDepth(20);

    this.physics.add.collider(this.player, this.enemies, this.onPlayerHitEnemy, undefined, this);
    this.physics.add.overlap(this.playerAttack, this.enemies, this.onAttackHitEnemy, undefined, this);

    this.lastAttackAt = 0;
    this.facing = new Phaser.Math.Vector2(1, 0);

    this.resultText = null;
    this.gameOver = false;
  }

  updateCommon(time) {
    if (this.gameOver) {
      return;
    }

    this.handlePlayerMove();

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && time - this.lastAttackAt > this.attackCooldown) {
      this.performAttack();
      this.lastAttackAt = time;
    }

    this.playerHpText.setText(`Player HP: ${Math.max(0, this.player.hp)}`);

    if (this.player.hp <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.showResult('You got flattened! Click to restart', '#ff8f8f');
      this.input.once('pointerdown', () => this.scene.start('StartScene'));
    }
  }

  handlePlayerMove() {
    const speed = 220;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    const vec = new Phaser.Math.Vector2(vx, vy);
    if (vec.lengthSq() > 0) {
      vec.normalize();
      this.player.body.setVelocity(vec.x * speed, vec.y * speed);
      this.facing.copy(vec);
    } else {
      this.player.body.setVelocity(0, 0);
    }
  }

  performAttack() {
    const reach = 36;
    const attackSize = 58;

    this.playerAttack.setPosition(
      this.player.x + this.facing.x * reach,
      this.player.y + this.facing.y * reach
    );
    this.playerAttack.setSize(attackSize, attackSize);
    this.playerAttack.body.setSize(attackSize, attackSize, true);
    this.playerAttack.setVisible(true);
    this.playerAttack.activeWindow = true;

    this.time.delayedCall(this.attackDuration, () => {
      this.playerAttack.activeWindow = false;
      this.playerAttack.setVisible(false);
    });
  }

  onAttackHitEnemy(attack, enemy) {
    if (!attack.activeWindow || !enemy.active) return;

    enemy.hp -= 20;
    const knockVec = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y)
      .normalize()
      .scale(220);
    enemy.body.setVelocity(knockVec.x, knockVec.y);

    if (enemy.hp <= 0) {
      enemy.destroy();
    }
  }

  onPlayerHitEnemy(player, enemy) {
    if (this.player.isInvulnerable || !enemy.active) return;

    this.player.hp -= enemy.touchDamage ?? 8;
    this.player.isInvulnerable = true;
    this.tweens.add({ targets: this.player, alpha: 0.2, duration: 80, yoyo: true, repeat: 5 });

    const push = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y).normalize().scale(320);
    player.body.setVelocity(push.x, push.y);

    this.time.delayedCall(650, () => {
      this.player.isInvulnerable = false;
      this.player.setAlpha(1);
    });
  }

  showResult(text, color) {
    if (this.resultText) this.resultText.destroy();
    this.resultText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
        fontFamily: 'Arial',
        fontSize: '40px',
        color,
        align: 'center',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(30);
  }
}

class MattressStoreScene extends BaseCombatScene {
  constructor() {
    super('MattressStoreScene');
  }

  create() {
    this.createCommonWorld('#44363d', 'Level 1: Mattress Store');

    for (let x = 220; x < 860; x += 140) {
      const mat = this.add.rectangle(x, 180 + ((x / 140) % 2) * 160, 120, 60, 0x7a6f7f).setAlpha(0.85);
      mat.setStrokeStyle(3, 0x9c8fac);
    }

    this.exitZone = this.add.rectangle(GAME_WIDTH - 22, GAME_HEIGHT / 2, 34, GAME_HEIGHT, 0x70d8ff, 0.5);
    this.physics.add.existing(this.exitZone, true);

    this.add
      .text(GAME_WIDTH - 75, 26, 'EXIT →', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#dcf7ff'
      })
      .setOrigin(0.5);

    const bugSpawns = [
      [330, 120],
      [430, 370],
      [570, 220],
      [700, 430],
      [780, 120]
    ];

    bugSpawns.forEach(([x, y]) => {
      const bug = this.add.circle(x, y, 18, 0xbf2f4f);
      this.physics.add.existing(bug);
      bug.body.setCollideWorldBounds(true);
      bug.hp = 35;
      bug.speed = Phaser.Math.Between(70, 110);
      bug.touchDamage = 9;
      this.enemies.add(bug);
    });

    this.physics.add.overlap(this.player, this.exitZone, () => {
      if (!this.gameOver) {
        this.scene.start('ParkingLotBossScene', { hpCarry: this.player.hp });
      }
    });
  }

  update(time) {
    this.updateCommon(time);
    if (this.gameOver) return;

    this.enemies.getChildren().forEach((bug) => {
      if (!bug.body) return;
      const chase = new Phaser.Math.Vector2(this.player.x - bug.x, this.player.y - bug.y).normalize();
      bug.body.setVelocity(chase.x * bug.speed, chase.y * bug.speed);
    });
  }
}

class ParkingLotBossScene extends BaseCombatScene {
  constructor() {
    super('ParkingLotBossScene');
  }

  init(data) {
    this.carriedHp = data.hpCarry;
  }

  create() {
    this.createCommonWorld('#2f3a44', 'Level 2: Parking Lot Boss');
    if (typeof this.carriedHp === 'number') {
      this.player.hp = Math.max(25, this.carriedHp);
    }

    for (let y = 90; y < GAME_HEIGHT; y += 110) {
      this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 80, 6, 0x576b7a, 0.55);
    }

    this.boss = this.add.rectangle(760, GAME_HEIGHT / 2, 92, 92, 0xe0702f);
    this.physics.add.existing(this.boss);
    this.boss.body.setCollideWorldBounds(true);
    this.boss.hp = 260;
    this.boss.maxHp = 260;
    this.boss.touchDamage = 14;
    this.boss.speed = 110;
    this.enemies.add(this.boss);

    this.bossLabel = this.add
      .text(640, 108, 'Fuel-Line Thief', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffdcb6',
        fontStyle: 'bold'
      })
      .setDepth(20);

    this.bossHpBack = this.add.rectangle(770, 84, 260, 18, 0x000000).setOrigin(0, 0.5).setDepth(20);
    this.bossHpBar = this.add.rectangle(770, 84, 260, 18, 0xff7b3d).setOrigin(0, 0.5).setDepth(21);

    this.shockwaves = this.physics.add.group();
    this.physics.add.overlap(this.player, this.shockwaves, this.onPlayerHitShockwave, undefined, this);

    this.nextDashAt = 0;
    this.nextRingAt = 1400;
  }

  update(time) {
    this.updateCommon(time);
    if (this.gameOver) return;

    if (!this.boss.active) {
      this.gameOver = true;
      this.showResult('Boss defeated! Click to return to title', '#9dffae');
      this.input.once('pointerdown', () => this.scene.start('StartScene'));
      return;
    }

    this.updateBossUi();

    if (time > this.nextDashAt) {
      this.doBossDash();
      this.nextDashAt = time + 1900;
    }

    if (time > this.nextRingAt) {
      this.spawnShockwaveRing();
      this.nextRingAt = time + 2600;
    }

    this.shockwaves.getChildren().forEach((wave) => {
      if (!wave.active || !wave.body) return;
      if (
        wave.x < -40 ||
        wave.x > GAME_WIDTH + 40 ||
        wave.y < -40 ||
        wave.y > GAME_HEIGHT + 40
      ) {
        wave.destroy();
      }
    });
  }

  onAttackHitEnemy(attack, enemy) {
    super.onAttackHitEnemy(attack, enemy);
    if (enemy === this.boss && enemy.hp <= 0) {
      this.bossLabel.destroy();
      this.bossHpBack.destroy();
      this.bossHpBar.destroy();
    }
  }

  updateBossUi() {
    const pct = Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
    this.bossHpBar.width = 260 * pct;
  }

  doBossDash() {
    const dir = new Phaser.Math.Vector2(this.player.x - this.boss.x, this.player.y - this.boss.y).normalize();
    this.boss.body.setVelocity(dir.x * 360, dir.y * 360);
    this.time.delayedCall(420, () => {
      if (!this.boss.body) return;
      this.boss.body.setVelocity(0, 0);
    });
  }

  spawnShockwaveRing() {
    const count = 8;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const wave = this.add.circle(this.boss.x, this.boss.y, 10, 0xffd76e);
      this.physics.add.existing(wave);
      wave.body.setAllowGravity(false);
      wave.body.setImmovable(true);
      wave.damage = 11;
      const speed = 210;
      wave.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.shockwaves.add(wave);

      this.tweens.add({
        targets: wave,
        alpha: 0.15,
        scale: 1.5,
        duration: 900,
        onComplete: () => wave.destroy()
      });
    }
  }

  onPlayerHitShockwave(player, wave) {
    if (!wave.active || this.player.isInvulnerable) return;
    this.player.hp -= wave.damage;
    wave.destroy();
    this.player.isInvulnerable = true;
    this.tweens.add({ targets: this.player, alpha: 0.2, duration: 80, yoyo: true, repeat: 4 });
    this.time.delayedCall(550, () => {
      this.player.isInvulnerable = false;
      this.player.setAlpha(1);
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [StartScene, MattressStoreScene, ParkingLotBossScene]
};

new Phaser.Game(config);
