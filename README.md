# Mattress Mayhem (Phaser 3)

A small 2D browser action game built with **Phaser 3** using only placeholder graphics.

## Run

Open `index.html` via **GitHub Pages** (or any static file host/server).

The game script is loaded from `game.js` at the project root to keep GitHub Pages paths simple.

## Gameplay

### Start screen
- Click **Play** to begin.

### Level 1: Mattress Store
- Enemies: bed bugs.
- Goal: survive and reach the **exit on the right side** of the store.

### Level 2: Parking Lot Boss
- Boss: fuel-line thief with a larger health pool.
- Two attack patterns:
  - High-speed **dash** toward the player.
  - **Shockwave ring** projectiles fired outward.

## Controls
- **Move:** `W A S D` or arrow keys
- **Attack:** `Space`

## UI
- Player HP is shown in all gameplay scenes.
- Boss HP bar is shown during the boss level.


## Troubleshooting
- If you previously tested an older version and see module/import errors, do a hard refresh so the latest `game.js` is loaded.


## GitHub Pages setup (step-by-step)
1. Push this branch to GitHub.
2. In your repo on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to **main** (or the branch you merged this into) and folder to **/(root)**.
5. Click **Save**.
6. Wait 1–3 minutes, then open the Pages URL shown on that screen.

## If you still see the `phaser.esm.js` / `export default` error
That means your browser is still using an old cached JS file from before this fix.

Do this exactly:
1. Open your game URL.
2. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac) for a hard refresh.
3. If it still fails, open DevTools (**F12**) → right-click refresh button → **Empty Cache and Hard Reload**.
4. As a final fallback, open the site in a private/incognito window.

### Quick verification in DevTools
- Open DevTools → Network tab → reload.
- Confirm you see `game.js?v=20260212b` (status 200).
- Confirm you do **not** see `phaser.esm.js` requested by your own game script.
