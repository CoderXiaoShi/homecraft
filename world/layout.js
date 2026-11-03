// 石兴龙的小岛。One block = 1 m. x east, z south (towards the opening
// camera), y up. The ground is y = 0.

// A compact island around the campfire and 小石's stall: the east coast runs
// ten blocks east of the stall, the north coast ten blocks north of the small
// tree; the west and south coasts hug the rest of the content.
export const ISLAND = { x0: -34, x1: -10, z0: 4, z1: 25 };

// The campfire circle on the south-west lawn, two blocks south so it sits
// closer to the sea-facing front.
export const CAMPFIRE = { x: -24, z: 18 };

// Two block trees beside the campfire — one tall to the south-west, one small
// to the north-west — framing the fire and 小石's stall from the path. Trunks
// stay clear of the benches, the stepping stones, the coast sand and the
// dog's roaming area. [x, z, trunk height, crown radius]
export const TREES = [
  [-27, 22, 7, 3],
  [-28, 14, 4, 2],
];

// Stepping stones, [x, z], drawn as single travertine cells: the spur from
// the portal down to the stall, plus a step by the mailbox.
export const STONES = [
  [-16, 10],
  [-13, 10], [-15, 12], [-17, 14], [-19, 15], [-21, 15],
];

export const MAILBOX = { x: -16, z: 8, yaw: 0 };
// The portal stands on the east lawn facing the lounge (yaw -π/2 = west), so
// arriving visitors step out towards the stall with the sea at their backs.
export const PORTAL = { x: -12, z: 11, yaw: -Math.PI / 2 };

// Spawn on the lawn east of the stall, facing northeast; the opening camera
// starts high to the east and looks west, then settles in behind.
export const SPAWN = { x: -15.6, z: 19, heading: Math.PI * 0.75 };

// Each station is a spot you can walk up to. `at` is where the player stands,
// `look` the point they face. `page: false` marks scenic stops with no card.
export const STATIONS = [
  { id: 'about', name: '关于我', en: 'About me', at: [-21, 21.7], look: [-22.2, 20.3] },
  { id: 'works', name: '作品', en: 'Works', at: [-17.6, 20.6], look: [-19.8, 20.5] },
  { id: 'contact', name: '联系', en: 'Contact', at: [-17.4, 21.8], look: [-19.0, 20.9] },
  { id: 'campfire', name: '篝火', en: 'Campfire', at: [-22.5, 14.8], look: [-24, 18], page: false },
  { id: 'mailbox', name: '留言', en: 'Mailbox', icon: 'mail', at: [MAILBOX.x, MAILBOX.z + 1.2], look: [MAILBOX.x, MAILBOX.z] },
  { id: 'portal', name: '传送门', en: 'Portal', icon: 'portal', at: [PORTAL.x + Math.sin(PORTAL.yaw) * 2.4, PORTAL.z + Math.cos(PORTAL.yaw) * 2.4], look: [PORTAL.x, PORTAL.z] },
];

// The baked lamp light covers the campfire and 小石's stall beside it
// (min corner, size in metres, texels).
export const LIGHT_VOLUME = { min: [-28, -1, -13], extent: [42, 13, 36], size: [42, 17, 36] };

// The opening shot starts high over the lawn east of the stall, looking
// west across it to the campfire, then swoops in behind the player.
export const INTRO = { pos: [-9, 7, 19], portrait: [-2.7, 10.6, 18.5], look: [-20.4, 0.5, 19.6] };

// The cat roams the north-east lawn by the mailbox; the dog roams the central
// lawn between the stall and the coast. All anchors sit inside the island and
// clear of furniture feet.
export const PETS = {
  cat: {
    anchors: [[-17, 6.5], [-13, 5.5], [-14, 9.5], [-17.5, 9]],
    home: [-14, 9.5],
    within: (x, z) => x >= -19 && x <= -12 && z >= 4.5 && z <= 11,
  },
  dog: {
    anchors: [[-13.5, 12.5], [-16.5, 20.5], [-23.5, 21], [-18.5, 21], [-11.9, 13.2]],
    home: [-13.5, 12.5],
    within: (x, z) => z >= 5 && z <= 21 && x >= -25 && x <= -11.5,
  },
};
