// 石兴龙的小岛：terrain. The engine calls build() once at boot. Furnish
// (the stall) lives in furnish.js; doves.js adds the white dove flock.
import { buildIsland, buildTrees } from '@engine/world/terrain.js';
import { buildTufts } from '@engine/world/landscape.js';
import { furnish } from './furnish.js';
import { buildDoves } from './doves.js';
import { ISLAND, CAMPFIRE, STONES, TREES } from './layout.js';
import { createMultiplayer } from '../multiplayer/client/index.js';

let dovesUpdate = null;

// What tops each column of the island: path paving, else grass; the coast
// wears a ring of sand.
export function surfaceAt(x, z, edge) {
  if (edge <= 1.4) return 'sand';
  if (STONES.some(([sx, sz]) => sx === x && sz === z)) return 'travertine';
  return 'grass';
}

// Grass tufts and flower patches, merged into a single mesh.
function tuftList() {
  const tufts = [];
  // Sparse tall grass under the two campfire trees.
  const under = [
    [-25.5, 20.5], [-24.8, 22.5], [-26, 24.2], [-28.6, 24.4], [-29.6, 21.2],
    [-26.8, 12.4], [-29.6, 15.2], [-27.2, 16.2], [-26.2, 14.6],
  ];
  under.forEach(([x, z], i) => tufts.push({
    x, z, tile: 'tall_grass', s: 0.75 + (i % 3) * 0.12,
    tint: [0x6f9c52, 0x5f8f4a, 0x86a860][i % 3],
  }));
  const flowers = [
    [-16, 10], [-18.5, 12.5], [-13.5, 15], [-18, 24], [-25, 21], [-29, 12],
    [-20, 24], [-15, 6], [-26, 7], [-12, 22], [-24, 9], [-31, 18],
  ];
  const tiles = ['flower_red', 'flower_white', 'flower_violet'];
  flowers.forEach(([x, z], i) => tufts.push({ x, z, tile: tiles[i % 3], s: 0.9 }));
  return tufts;
}

export function build({ grid, layer, materials }) {
  buildIsland(grid, ISLAND, { surfaceAt });
  buildTrees(grid, TREES);
  const furn = furnish({ layer });
  const tufts = buildTufts(layer, materials, tuftList(), 'meadow');
  const doves = buildDoves();
  dovesUpdate = doves.update;
  return {
    batches: furn.batches, planes: [...furn.planes, tufts, ...doves.meshes], obstacles: furn.obstacles,
    bakes: furn.lighting, hotspots: furn.hotspots, surfaces: furn.surfaces,
  };
}

// Other people on the island, when multiplayer is configured in
// home.config.js. Nothing here may throw: a setup() that does would take the
// whole page down with it, and the site must run without the module. The
// dove flock rides the same per-frame update.
export function setup(app) {
  const dovesTick = (dt, elapsed) => dovesUpdate?.(dt, elapsed);
  try {
    const mp = createMultiplayer(app);
    if (!mp) return { update: dovesTick };
    let warned = false;
    const safe = fn => (...args) => {
      try { fn(...args); } catch (e) { if (!warned) { warned = true; console.warn('multiplayer:', e); } }
    };
    return {
      update: (dt, elapsed, now) => { dovesTick(dt, elapsed); safe(mp.update)(dt, elapsed, now); },
      warmup: safe(mp.warmup),
    };
  } catch (e) {
    console.warn('multiplayer init failed:', e);
    return { update: dovesTick };
  }
}
