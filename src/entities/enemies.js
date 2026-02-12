window.MM = window.MM || {};
MM.spawnEnemy = function(scene, type, x, y) {
  const frameMap = { bug: 'bedbug_walk_01', child: 'kid_run_01', bum: null, thief: 'boss_idle_01' };
  const atlasMap = { bug: 'enemies', child: 'enemies', bum: null, thief: 'boss' };
  const color = { bug:0xbf2f4f, child:0xf2ca52, bum:0x8aa3b5, thief:0xcf5b30 }[type] || 0xffffff;
  const size = type === 'thief' ? [76, 88] : [30, 30];

  const g = MM.Utils.makeSpriteOrRect(scene, {
    x,
    y,
    atlasKey: atlasMap[type],
    frame: frameMap[type],
    width: size[0],
    height: size[1],
    color
  });

  scene.physics.add.existing(g);
  g.type = type;
  g.hp = type === 'thief' ? 25 : 3;
  g.stun = 0;
  g.sleepTimer = 0;
  g.chaos = 0;
  g.body.setCollideWorldBounds(true);
  return g;
};
