// White doves over the island and the sea around it: 2-8 of them per visit,
// soaring wide circles well past the coast, and only rarely — a one-in-ten
// roll at each waypoint, at most two at a time — dropping onto the rug or
// grass before taking off again. The whole flock rides six instanced meshes
// (body, head, beak, tail, wings), so the draw-call cost is fixed;
// update(dt) allocates nothing — every dove's state is fixed at build time
// and reused in place.

import * as THREE from 'three';

// The soaring volume reaches over the sea on every side of the island.
const CRUISE = { x0: -44, x1: -1, z0: -6, z1: 34, y0: 4, y1: 12 };
const SPOTS = [
  [-15, 15.5], [-18.5, 21.5], [-13.5, 18.5], [-22, 15.5], [-19.5, 21.5],
  [-14.5, 12.5], [-20.5, 15.5], [-20.4, 19.6], [-16.5, 18], [-12.5, 17],
];
const MAX_GROUNDED = 2, LAND_ROLL = 0.1;
const WHITE = 0xf3f1ea, GREY = 0xd8d4ca, BEAK = 0xe8a24a;
const dummy = new THREE.Object3D();
const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

const pickCruise = d => {
  d.tx = CRUISE.x0 + Math.random() * (CRUISE.x1 - CRUISE.x0);
  d.ty = CRUISE.y0 + Math.random() * (CRUISE.y1 - CRUISE.y0);
  d.tz = CRUISE.z0 + Math.random() * (CRUISE.z1 - CRUISE.z0);
};

export function buildDoves() {
  const count = 2 + Math.floor(Math.random() * 7);   // 2..8 doves per visit
  const part = (w, h, d, mat) => {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(w, h, d), mat, count);
    mesh.frustumCulled = false;                       // instances spread over the sky
    return mesh;
  };
  const meshes = {
    body: part(0.2, 0.14, 0.3, new THREE.MeshLambertMaterial({ color: WHITE })),
    head: part(0.11, 0.1, 0.1, new THREE.MeshLambertMaterial({ color: WHITE })),
    beak: part(0.035, 0.03, 0.07, new THREE.MeshLambertMaterial({ color: BEAK })),
    tail: part(0.13, 0.025, 0.14, new THREE.MeshLambertMaterial({ color: GREY })),
    wings: part(0.42, 0.02, 0.13, new THREE.MeshLambertMaterial({ color: GREY })),
  };
  const doves = [];
  for (let i = 0; i < count; i++) {
    const d = {
      mode: 'fly', x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0,
      yaw: Math.random() * Math.PI * 2, speed: 3 + Math.random() * 1.5,
      timer: 0, phase: Math.random() * Math.PI * 2, fold: 0, flap: 0,
    };
    d.x = CRUISE.x0 + Math.random() * (CRUISE.x1 - CRUISE.x0);
    d.z = CRUISE.z0 + Math.random() * (CRUISE.z1 - CRUISE.z0);
    d.y = CRUISE.y0 + Math.random() * (CRUISE.y1 - CRUISE.y0);
    pickCruise(d);
    doves.push(d);
  }

  function update(dt, elapsed) {
    let busy = 0;                                     // grounded + landing doves
    for (let i = 0; i < doves.length; i++) if (doves[i].mode !== 'fly') busy++;
    for (let i = 0; i < doves.length; i++) {
      const d = doves[i];
      if (d.mode === 'ground') {
        d.timer -= dt;
        d.yaw += Math.sin(elapsed * 0.6 + d.phase) * dt * 0.4;
        if (d.timer <= 0) { d.mode = 'fly'; pickCruise(d); }
      } else {
        d.yaw += wrap(Math.atan2(d.tx - d.x, d.tz - d.z) - d.yaw) * Math.min(1, dt * 2.5);
        const step = d.speed * dt;
        d.x += Math.sin(d.yaw) * step; d.z += Math.cos(d.yaw) * step;
        d.y += Math.sign(d.ty - d.y) * Math.min(Math.abs(d.ty - d.y), 1.2 * dt);
        if (Math.hypot(d.tx - d.x, d.tz - d.z) < 0.8) {
          if (d.mode === 'land') {                    // touched down on the spot
            d.mode = 'ground'; d.x = d.tx; d.y = 0.055; d.z = d.tz;
            d.timer = 4 + Math.random() * 6;
          } else if (busy < MAX_GROUNDED && Math.random() < LAND_ROLL) {
            const spot = SPOTS[(Math.random() * SPOTS.length) | 0];
            d.mode = 'land'; d.tx = spot[0]; d.ty = 0.055; d.tz = spot[1];
            busy++;
          } else pickCruise(d);
        }
      }
      d.fold = d.mode === 'ground' ? 0.12 : 0;
      d.flap = d.mode === 'ground' ? 0 : Math.sin(elapsed * 13 + d.phase) * 0.95;
      write(i, d);
    }
    for (const key in meshes) meshes[key].instanceMatrix.needsUpdate = true;
  }

  // One dove = five instanced boxes yawed around its spot; the wings roll
  // around the dove's own forward axis to flap.
  function write(i, d) {
    const s = Math.sin(d.yaw), c = Math.cos(d.yaw);
    const place = (mesh, idx, ox, oy, oz, roll = 0) => {
      dummy.position.set(d.x + ox * c + oz * s, d.y + oy, d.z - ox * s + oz * c);
      dummy.rotation.set(0, d.yaw, roll, 'YZX');
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    };
    place(meshes.body, i, 0, 0.1, 0);
    place(meshes.head, i, 0, 0.17, 0.14);
    place(meshes.beak, i, 0, 0.155, 0.21);
    place(meshes.tail, i, 0, 0.12, -0.2);
    place(meshes.wings, i * 2, -0.2, 0.05, 0, -d.fold - d.flap);
    place(meshes.wings, i * 2 + 1, 0.2, 0.05, 0, d.fold + d.flap);
  }

  return { meshes: Object.values(meshes), update };
}
