# Mr. Napper's Mattress Mayhem

A static **Phaser 3** side-scroller vertical slice designed for **GitHub Pages**.
No npm, no bundler, no build step.

## Run

Deploy this repository to GitHub Pages and open the Pages URL.
Everything is plain static files loaded from `index.html`.

## Controls (shown in-game on each screen)

- Move: `A/D` or `←/→`
- Jump: `Space`
- Action / stomp assist / pillow throw: `K`
- Ground pound: hold `S` or `↓` in air + press `K`
- Bug spray shot: `J` (after Stage 1-1 pickup)
- Shoo action (kids/bums): `E`
- Summon dog companion: `Q` (small reputation penalty)
- Dog bark stun (cooldown): `R`
- Sleep heal: `H` (HP up, reputation down)
- Shoes-off heal: `T` (HP up, reputation down)

## Replayability / fun tuning

- Random **shift modifier** each run (economy, chaos, enemy pressure)
- Dynamic reinforcement waves during stages
- Enemy personalities (`aggressive`, `erratic`, `coward`) and varied movement
- Combo + multiplier scoring (higher money on streaks)
- Random ammo/health drops from defeated enemies
- Minigame depth:
  - Sales: customer profile + dynamic objections
  - Delivery: streak rewards + timer pressure
- Persistent difficulty scaling through the run

## Vertical slice flow

1. Opening cutscene
2. Stage 1-1 Bed Bugs (mattress trampolines + hidden spray pickup)
3. Random minigame (Sales or Delivery)
4. Stage 1-2 Unattended Children (chaos meter)
5. Random minigame
6. Stage 1-3 Bums in Blizzard (sleep penalties + blanket donation)
7. Random minigame
8. Stage 1-4 Mixed Chaos
9. Final cutscene
10. Final boss (fuel-line thief):
   - Phase 1: pillow stuns before fuel drains out
   - Phase 2: crowbar/rock fight with boss HP

## Systems included

- Tight platformer controls with **coyote time** + **jump buffer**
- Stomp and ground pound attacks
- Ranged bug spray unlock + ammo
- Store dog companion with bark stun cooldown
- HP, money, reputation persistence across stages/minigames
- End-of-stage summary with penalties
- Win/Lose screens

## File structure

- `src/core`: config, utils, shared state
- `src/data`: stage/cutscene data
- `src/entities`: player, dog, enemy factories
- `src/ui`: HUD
- `src/scenes`: boot/menu/cutscene/levels/minigame/summary/boss/end

## Texture atlas support (optional)

The game now attempts to load optional atlases from `assets/atlases/`:
- `shandus.png` + `shandus.json`
- `boss.png` + `boss.json`
- `enemies.png` + `enemies.json`
- `props.png` + `props.json`

If any atlas is missing, the game gracefully falls back to placeholder rectangles/circles.
A developer status line is shown on the menu and an `[AtlasStatus]` line is logged in the browser console.

### Frame naming conventions

- `shandus_idle_01`
- `shandus_walk_01..04`
- `shandus_jump_01`
- `shandus_pound_01`
- `bedbug_walk_01..02`
- `kid_run_01..04`
- `dog_run_01..04`
- `dog_bark_01..02`
- `boss_idle_01..02`
- `boss_throw_01..03`
- `boss_crowbar_01..03`
