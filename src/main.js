window.MM = window.MM || {};
new Phaser.Game({
  type: Phaser.AUTO,
  width: MM.C.WIDTH,
  height: MM.C.HEIGHT,
  parent: 'app',
  pixelArt: true,
  physics: { default:'arcade', arcade:{ gravity:{ y: MM.C.GRAVITY }, debug:false } },
  scene: [MM.BootScene, MM.MenuScene, MM.CutsceneScene, MM.LevelScene, MM.MinigameScene, MM.SummaryScene, MM.BossScene, MM.WinScene, MM.LoseScene]
});
