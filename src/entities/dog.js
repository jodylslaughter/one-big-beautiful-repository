window.MM = window.MM || {};
MM.Dog = class {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.sprite = scene.add.rectangle(player.body.x - 50, player.body.y + 8, 24, 20, 0xc79a60);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setAllowGravity(false);
    this.nextBark = 0;
    this.activeTime = 0;
  }

  summon() {
    this.activeTime = 10;
    MM.State.rep = MM.Utils.clamp(MM.State.rep - 4, 0, 100);
    this.scene.addPenalty('Dog in store', -4, 0);
  }

  bark(time, enemies) {
    if (time < this.nextBark || this.activeTime <= 0) return;
    this.nextBark = time + 4000;
    this.scene.add.text(this.sprite.x, this.sprite.y - 30, 'BARK!', { color:'#fff58a', fontSize:'16px' }).setDepth(40);
    enemies.forEach((e) => {
      if (e.active && MM.Utils.overlap(this.sprite, e, 130)) e.stun = 1.4;
    });
  }

  update(dt) {
    this.activeTime -= dt;
    const tx = this.player.body.x - 46;
    const ty = this.player.body.y + 12;
    this.sprite.x += (tx - this.sprite.x) * 0.08;
    this.sprite.y += (ty - this.sprite.y) * 0.08;
    this.sprite.setAlpha(this.activeTime > 0 ? 1 : 0.2);
  }
};
