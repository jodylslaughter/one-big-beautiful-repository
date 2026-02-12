window.MM = window.MM || {};
MM.State = {
  reset() {
    this.hp = MM.C.MAX_HP;
    this.money = 0;
    this.rep = 50;
    this.sprayUnlocked = false;
    this.sprayAmmo = 0;
    this.stageIndex = 0;
    this.stageResult = null;
    this.penalties = [];
    this.atlases = this.atlases || { shandus: false, boss: false, enemies: false, props: false };
  }
};
MM.State.reset();
