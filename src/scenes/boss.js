window.MM = window.MM || {};
MM.BossScene = class extends Phaser.Scene {
  constructor() { super('Boss'); }
  create() {
    this.cameras.main.setBackgroundColor('#2d3640');
    this.physics.world.setBounds(0, 0, MM.C.WIDTH, MM.C.HEIGHT);
    this.player = new MM.Player(this, 200, 500);
    this.floor = MM.Utils.makeSpriteOrRect(this, { x:560, y:612, atlasKey:'props', frame:'floor_01', width:1120, height:36, color:0x666 });
    this.physics.add.existing(this.floor, true);
    this.physics.add.collider(this.player.body, this.floor);

    this.boss = MM.spawnEnemy(this, 'thief', 860, 500);
    this.physics.add.collider(this.boss, this.floor);

    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,S,DOWN,SPACE,J,K');
    this.pillows = [];
    this.sprays = [];
    this.phase = 1;
    this.fuel = 100;
    this.stunsNeeded = 5;
    this.stuns = 0;
    this.bossHp = 40;

    this.hud = this.add.text(16, 14, '', { color:'#fff', fontSize:'22px' });
    this.help = this.add.text(16, 42, 'Controls: A/D move, SPACE jump, K pillow/action, J spray, S+K ground pound', { color:'#ddd', fontSize:'16px' });
    this.bossBarBg = this.add.rectangle(700, 20, 360, 14, 0x000).setOrigin(0, 0);
    this.bossBar = this.add.rectangle(700, 20, 360, 14, 0xff6d46).setOrigin(0, 0);
  }

  spawnPillow() {
    const p = this.add.rectangle(this.player.body.x + this.player.facing * 18, this.player.body.y, 32, 20, 0xc1d5ef);
    this.physics.add.existing(p); p.body.setAllowGravity(false); p.body.setVelocity(this.player.facing * 460, -70); p.life = 1.5;
    this.pillows.push(p);
  }

  spray() {
    if (!MM.State.sprayUnlocked || MM.State.sprayAmmo <= 0) return;
    MM.State.sprayAmmo -= 1;
    const p = this.add.rectangle(this.player.body.x + this.player.facing * 24, this.player.body.y, 18, 6, 0x9af7a8);
    this.physics.add.existing(p); p.body.setAllowGravity(false); p.body.setVelocityX(this.player.facing * 550); p.life = 1;
    this.sprays.push(p);
  }

  update(_t, dms) {
    const dt = dms / 1000;
    const controls = {
      left: this.keys.A.isDown || this.keys.LEFT.isDown,
      right: this.keys.D.isDown || this.keys.RIGHT.isDown,
      down: this.keys.S.isDown || this.keys.DOWN.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.SPACE),
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.K)
    };
    this.player.update(dt, controls);

    if (Phaser.Input.Keyboard.JustDown(this.keys.K) && this.phase === 1) {
      if (this.boss.setFrame && MM.Utils.textureHasFrame(this, 'boss', 'boss_throw_01')) this.boss.setFrame('boss_throw_01');
      this.spawnPillow();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) this.spray();

    if (this.phase === 1) {
      this.fuel -= dt * 8;
      if (this.fuel <= 0) return this.scene.start('Lose');
    } else {
      const dir = Math.sign(this.player.body.x - this.boss.x);
      this.boss.body.setVelocityX(dir * 160);
      if (this.boss.setFrame && MM.Utils.textureHasFrame(this, 'boss', 'boss_crowbar_01')) this.boss.setFrame('boss_crowbar_01');
      if (Math.random() < 0.008) {
        const rock = this.add.circle(this.boss.x, this.boss.y - 30, 10, 0x999);
        this.physics.add.existing(rock);
        rock.body.setVelocity(-dir * 240, -130);
        rock.life = 4;
        this.sprays.push(rock);
      }
    }

    const touchBoss = MM.Utils.overlap(this.player.body, this.boss, 46);
    if (touchBoss) {
      const stomp = this.player.body.body.velocity.y > 30 && this.player.body.y < this.boss.y - 30;
      if (stomp) {
        this.player.body.body.setVelocityY(-330);
        if (this.phase === 2) this.bossHp -= 4;
      } else this.player.damage(1);
    }

    const moveShot = (arr, onHit) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        if (!p.active || !p.body) { arr.splice(i,1); continue; }
        p.life -= dt;
        if (MM.Utils.overlap(p, this.boss, 46)) { onHit(); p.destroy(); arr.splice(i,1); continue; }
        if (p.life <= 0) { p.destroy(); arr.splice(i,1); }
      }
    };

    moveShot(this.pillows, () => {
      if (this.phase === 1) {
        this.stuns += 1;
        if (this.stuns >= this.stunsNeeded) this.phase = 2;
      }
    });

    moveShot(this.sprays, () => { if (this.phase === 2) this.bossHp -= 2; });

    if (this.phase === 2 && this.bossHp <= 0) {
      MM.State.money += 200;
      return this.scene.start('Win');
    }

    if (MM.State.hp <= 0) return this.scene.start('Lose');

    if (this.phase === 1 && this.boss.setFrame && MM.Utils.textureHasFrame(this, 'boss', 'boss_idle_01')) this.boss.setFrame('boss_idle_01');
    this.hud.setText(`Boss Phase ${this.phase}  HP:${MM.State.hp}/${MM.C.MAX_HP}  Fuel:${Math.max(0,Math.ceil(this.fuel))}  Stuns:${this.stuns}/${this.stunsNeeded}`);
    this.bossBar.width = 360 * (this.phase === 1 ? this.fuel / 100 : this.bossHp / 40);
  }
};
