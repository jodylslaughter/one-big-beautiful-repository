window.MM = window.MM || {};
MM.Player = class {
  constructor(scene, x, y) {
    this.scene = scene;
    this.body = scene.add.rectangle(x, y, 36, 52, 0x4ea5ff);
    scene.physics.add.existing(this.body);
    this.body.body.setCollideWorldBounds(true);
    this.body.body.setMaxVelocity(350, 900);
    this.facing = 1;
    this.jumpBuffer = 0;
    this.coyote = 0;
    this.groundPounding = false;
    this.invuln = 0;
  }

  update(dt, controls) {
    const b = this.body.body;
    if (!b) return;
    const speed = 250;
    const onGround = b.blocked.down || b.touching.down;

    if (controls.jumpPressed) this.jumpBuffer = 0.14;
    this.jumpBuffer -= dt;
    this.coyote = onGround ? 0.1 : this.coyote - dt;

    if (controls.left) { b.setVelocityX(-speed); this.facing = -1; }
    else if (controls.right) { b.setVelocityX(speed); this.facing = 1; }
    else b.setVelocityX(b.velocity.x * 0.84);

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      b.setVelocityY(-580);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.groundPounding = false;
    }

    if (!onGround && controls.down && controls.attackPressed) {
      this.groundPounding = true;
      b.setVelocityY(900);
    }

    if (onGround && this.groundPounding) {
      this.groundPounding = false;
      if (this.scene.onGroundPoundLand) this.scene.onGroundPoundLand(this.body.x, this.body.y);
    }

    if (this.invuln > 0) {
      this.invuln -= dt;
      this.body.setAlpha(Math.floor(this.invuln * 20) % 2 ? 0.3 : 1);
    } else {
      this.body.setAlpha(1);
    }
  }

  damage(amount) {
    if (this.invuln > 0) return;
    MM.State.hp = MM.Utils.clamp(MM.State.hp - amount, 0, MM.C.MAX_HP);
    this.invuln = 1;
  }

  heal(amount, repPenalty, reason) {
    MM.State.hp = MM.Utils.clamp(MM.State.hp + amount, 0, MM.C.MAX_HP);
    MM.State.rep = MM.Utils.clamp(MM.State.rep - repPenalty, 0, 100);
    this.scene.addPenalty(reason, -repPenalty, 0);
  }
};
