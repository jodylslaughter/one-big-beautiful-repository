window.MM = window.MM || {};
MM.Utils = {
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  overlap(a, b, pad) { return Math.abs(a.x - b.x) < pad && Math.abs(a.y - b.y) < pad; }
};
