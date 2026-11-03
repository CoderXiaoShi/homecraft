// Furnish the island: the campfire circle, and right beside it 小石's
// merchant stall — a little souk with a striped awning, a patterned carpet
// of goods and a money crate. Everything static is batched; light is baked
// into the volume, leaving the flame sheets as the only animation.
import * as THREE from 'three';
import { BoxBatch } from '@engine/world/blocks.js';
import { canvasTexture } from '@engine/world/textures.js';
import { CAMPFIRE } from './layout.js';

const L = {
  oak: { tex: 'oak' }, panel: { tex: 'wood_panel' }, walnut: { tex: 'walnut' },
  black: { tex: 'black_metal' },
  ruby: { tex: 'paint', tint: 0x9e3a32 },
  teal: { tex: 'paint', tint: 0x3d6b62 },
  gold: { tex: 'paint', tint: 0xc9963f },
  terra: { tex: 'paint', tint: 0xb46a41 },
  white: { tex: 'paint', tint: 0xf2ede2 },
  skin: { tex: 'paint', tint: 0xd9a066 },
  dark: { tex: 'paint', tint: 0x33383d },
  firewood: { tex: 'walnut', tint: 0x7d5738 },
  hoodie: { tex: 'paint', tint: 0x3e4a56 },
  zip: { tex: 'paint', tint: 0xb8c2c8 },
  denim: { tex: 'paint', tint: 0x3a4660 },
  sneaker: { tex: 'paint', tint: 0xdaddd8 },
  hair: { tex: 'paint', tint: 0x2b2b2e },
  glass: { tex: 'paint', tint: 0x9fb4bd },
  glow: (tint, e = 1) => ({ tex: 'paint', tint, emissive: e }),
};

export function furnish({ layer }) {
  const B = new BoxBatch(layer);
  const batches = { static: B };
  const obstacles = [], lighting = [], hotspots = [], planes = [], surfaces = {};
  const bake = (id, x, y, z, power, radius, direction = null) => lighting.push({ id, position: [x, y, z], power, radius, direction });
  const foot = (x, z, w, d, level = 0) => obstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, level });
  const hot = (id, x, y, z, w, h, d) => hotspots.push({ id, box: new THREE.Box3(new THREE.Vector3(x - w / 2, y, z - d / 2), new THREE.Vector3(x + w / 2, y + h, z + d / 2)) });
  const plane = (w, h, tex, x, y, z, ry = 0, glow = false, rx = 0) => {
    const mat = glow ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0, 'YXZ');
    mesh.receiveShadow = !glow; planes.push(mesh); return mesh;
  };
  const paint = (w, h, fn) => canvasTexture(w, h, fn);

  // --- Campfire: a stone ring, crossed logs, log seats and a woodpile. ---
  const cx = CAMPFIRE.x, cz = CAMPFIRE.z;
  const stoneLight = { tex: 'stone', tint: 0x9a9a94 }, stoneDark = { tex: 'stone', tint: 0x85857e };
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + 0.39;
    B.box(cx + Math.cos(a) * 1.15, 0, cz + Math.sin(a) * 1.15, 0.42, i % 2 ? 0.22 : 0.3, 0.42,
      i % 2 ? stoneLight : stoneDark);
  }
  for (const [dx, dz, ry] of [[0.25, 0, 0.5], [-0.2, 0.15, 1.2], [0, -0.2, 2.2]])
    B.box(cx + dx, 0.1, cz + dz, 0.16, 0.16, 1.1, L.firewood, { ry });
  foot(cx, cz, 2.9, 2.9);
  B.box(cx, 0, cz + 2.35, 1.7, 0.42, 0.5, { tex: 'log' });
  foot(cx, cz + 2.35, 1.8, 0.6);
  for (const sx of [-1, 1]) {
    B.box(cx + sx * 2.05, 0, cz - 1.2, 0.5, 0.42, 1.7, { tex: 'log' }, { ry: -sx * Math.PI / 4 });
    foot(cx + sx * 2.05, cz - 1.2, 1.0, 1.0);
  }
  // Spare firewood stacked north-west of the ring, clear of the west bench.
  B.box(cx - 2.6, 0, cz + 0.6, 0.9, 0.18, 0.24, L.firewood, { ry: 0.1 });
  B.box(cx - 2.6, 0.18, cz + 0.62, 0.85, 0.18, 0.22, L.firewood, { ry: -0.08 });
  B.box(cx - 2.55, 0, cz + 0.95, 0.85, 0.18, 0.24, L.firewood, { ry: -0.15 });
  foot(cx - 2.6, cz + 0.78, 1.0, 0.8);
  bake('campfire', cx, 0.85, cz, 1.5, 9);
  surfaces.fireplace = [
    { position: [cx, 0.14, cz], rotation: 0, width: 1.0, height: 0.55 },
    { position: [cx, 0.14, cz], rotation: Math.PI / 2, width: 1.0, height: 0.55 },
  ];

  // --- 小石's stall: a bare patterned carpet of goods running north-south on
  // the lawn west of the path, a lantern post at its north-east corner and
  // the money crate on its south-east edge. Goods keep clear of the campfire's
  // east bench and the ring to the west. ---
  const carpet = paint(160, 120, (ctx, w, h) => {
    ctx.fillStyle = '#8e2f2a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e2c48c';
    ctx.fillRect(0, 0, w, 10); ctx.fillRect(0, h - 10, w, 10);
    ctx.fillRect(0, 0, 10, h); ctx.fillRect(w - 10, 0, 10, h);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const x = 30 + i * 25, y = 28 + j * 22;
      ctx.fillStyle = '#3d6b62';
      ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 9, y); ctx.fill();
      ctx.fillStyle = '#c9963f';
      ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 3); ctx.lineTo(x - 4, y); ctx.fill();
    }
  });
  plane(2.4, 3.4, carpet, -20.4, 0.015, 19.6, 0, false, -Math.PI / 2);

  // A lantern post lights the stall from its north-east corner.
  B.box(-19.2, 0, 17.8, 0.09, 1.42, 0.09, L.black);
  B.box(-19.2, 1.42, 17.8, 0.16, 0.18, 0.16, L.glow(0xffd9a0));
  B.box(-19.2, 1.6, 17.8, 0.2, 0.05, 0.2, L.walnut);
  foot(-19.2, 17.8, 0.24, 0.24);
  bake('stall-lantern', -19.2, 1.5, 17.8, 0.9, 7);

  // The goods: spice bowls, fabric rolls, a fruit pile and pottery jars.
  const bowl = (x, z, c) => { B.box(x, 0.03, z, 0.3, 0.1, 0.3, c); B.box(x, 0.13, z, 0.38, 0.07, 0.38, c); };
  bowl(-20.2, 20.1, L.terra); bowl(-19.6, 21.2, L.teal); bowl(-20.45, 21.1, L.gold);
  B.box(-19.7, 0.03, 20.3, 1.15, 0.17, 0.17, L.ruby, { ry: 1.69 });
  B.box(-19.75, 0.2, 20.25, 1.15, 0.17, 0.17, L.white, { ry: 1.49 });
  B.box(-19.68, 0.37, 20.35, 1.15, 0.17, 0.17, L.teal, { ry: 1.77 });
  for (const [fx, fz, fy] of [[-20.35, 20.55, 0.03], [-20.2, 20.4, 0.03], [-20.45, 20.4, 0.03], [-20.3, 20.7, 0.17], [-20.15, 20.55, 0.16]])
    B.box(fx, fy, fz, 0.15, 0.14, 0.15, { tex: 'paint', tint: 0xd98a2b });
  B.box(-20.2, 0.03, 19.6, 0.3, 0.3, 0.3, L.terra); B.box(-20.2, 0.33, 19.6, 0.2, 0.16, 0.2, L.terra);
  B.box(-19.4, 0.03, 21.6, 0.26, 0.4, 0.26, L.teal); B.box(-19.4, 0.43, 21.6, 0.16, 0.1, 0.16, L.teal);

  // The money crate: wooden box, ceramic piggy bank, loose coins.
  B.box(-19.0, 0, 20.9, 0.56, 0.55, 0.56, L.panel);
  B.box(-19.0, 0.55, 20.9, 0.6, 0.05, 0.6, L.oak);
  foot(-19.0, 20.9, 0.7, 0.7);
  B.box(-19.0, 0.6, 20.9, 0.3, 0.2, 0.2, L.white);
  B.box(-18.86, 0.62, 20.9, 0.14, 0.13, 0.15, L.white);
  B.box(-18.79, 0.66, 20.9, 0.04, 0.05, 0.07, L.terra);
  B.box(-19.0, 0.81, 20.9, 0.16, 0.025, 0.05, L.dark);
  for (const [gx, gz, n] of [[-19.0, 20.35, 3], [-19.2, 20.4, 2]])
    for (let i = 0; i < n; i++) B.box(gx, 0.02 + i * 0.045, gz, 0.14, 0.045, 0.14, L.gold);

  // --- 程序员小石 beside the fire: hoodie, jeans, glasses, short hair and a
  // laptop held in both hands, facing up the path. ---
  B.at(-22.2, 0, 20.3, 2.0, () => {
    B.box(-0.11, 0, 0.02, 0.16, 0.08, 0.28, L.sneaker);
    B.box(0.11, 0, 0.02, 0.16, 0.08, 0.28, L.sneaker);
    B.box(-0.11, 0.08, 0, 0.2, 0.82, 0.26, L.denim);
    B.box(0.11, 0.08, 0, 0.2, 0.82, 0.26, L.denim);
    B.box(0, 0.9, 0, 0.48, 0.62, 0.34, L.hoodie);
    B.box(0, 0.9, 0.175, 0.05, 0.58, 0.02, L.zip);
    B.box(0, 1.36, -0.14, 0.3, 0.14, 0.12, L.hoodie);
    B.box(0, 1.52, 0, 0.52, 0.12, 0.34, L.hoodie);
    B.box(-0.3, 0.94, 0, 0.1, 0.5, 0.13, L.hoodie);
    B.box(0.3, 0.94, 0, 0.1, 0.5, 0.13, L.hoodie);
    B.box(-0.2, 1.0, 0.16, 0.1, 0.1, 0.26, L.hoodie);
    B.box(0.2, 1.0, 0.16, 0.1, 0.1, 0.26, L.hoodie);
    B.box(-0.14, 1.04, 0.3, 0.08, 0.09, 0.1, L.skin);
    B.box(0.14, 1.04, 0.3, 0.08, 0.09, 0.1, L.skin);
    B.box(0, 1.06, 0.24, 0.38, 0.05, 0.26, L.dark, { rx: -0.3 });
    B.box(0, 1.1, 0.33, 0.34, 0.16, 0.03, L.dark, { rx: -0.3 });
    B.box(0, 1.64, 0, 0.4, 0.32, 0.34, L.skin);
    B.box(-0.09, 1.8, 0.175, 0.1, 0.05, 0.02, L.glass);
    B.box(0.09, 1.8, 0.175, 0.1, 0.05, 0.02, L.glass);
    B.box(0, 1.8, 0.186, 0.03, 0.035, 0.01, L.dark);
    B.box(0, 1.96, 0, 0.42, 0.14, 0.36, L.hair);
    B.box(0, 1.9, -0.16, 0.4, 0.2, 0.03, L.hair);
  });
  foot(-22.2, 20.3, 0.7, 0.7);

  // A floating name tag over 小石's head. Raw canvas text handles CJK (the
  // pixel font doesn't); a sprite keeps it camera-facing like a nameplate.
  const tag = paint(256, 80, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(17, 20, 24, 0.72)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 108 + 26, 12);
    ctx.arc(w / 2 + 108 - 26, 12 + 26, 26, -Math.PI / 2, 0);
    ctx.arc(w / 2 + 108 - 26, 12 + 56 - 26, 26, 0, Math.PI / 2);
    ctx.arc(w / 2 - 108 + 26, 12 + 56 - 26, 26, Math.PI / 2, Math.PI);
    ctx.arc(w / 2 - 108 + 26, 12 + 26, 26, Math.PI, Math.PI * 1.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4efe4';
    ctx.font = '38px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('程序员小石', w / 2, h / 2 + 2);
  });
  const nameTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tag, transparent: true, depthWrite: false }));
  nameTag.scale.set(1.3, 0.41, 1);
  nameTag.position.set(-22.2, 2.42, 20.3);
  planes.push(nameTag);

  // --- Interaction spots: the merchant, his goods and his money crate. ---
  hot('about', -22.2, 0, 20.3, 1.2, 2.2, 1.2);
  hot('works', -20.3, 0, 19.3, 2.4, 1.4, 3.0);
  hot('contact', -19.0, 0, 20.9, 1.4, 1.2, 1.4);

  return { batches, obstacles, lighting, hotspots, planes, surfaces };
}
