window.MM = window.MM || {};
MM.C = {
  WIDTH: 1120,
  HEIGHT: 630,
  GRAVITY: 1600,
  MAX_HP: 8,
  STAGES: ['1-1', '1-2', '1-3', '1-4'],
  RUN_MODIFIERS: [
    { id:'busy_day', name:'Busy Day', desc:'+15% enemy speed, +20% payout', enemySpeed:1.15, payout:1.2, repDecay:1.0 },
    { id:'clean_store', name:'Clean Store', desc:'-20% enemy count, +10 reputation gain', enemyCount:0.8, payout:1.0, repDecay:0.85 },
    { id:'storm_night', name:'Storm Night', desc:'+1 extra wave, +25% chaos gain', extraWaves:1, payout:1.25, chaosMul:1.25 },
    { id:'coupon_week', name:'Coupon Week', desc:'+30% minigame money, but picky customers', payout:1.3, salesHard:1.2 },
    { id:'normal', name:'Standard Shift', desc:'Balanced rules', payout:1.0, enemySpeed:1.0 }
  ]
};
