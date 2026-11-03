export default {
  name: '程序员小石',
  // 64×64 PNG, 4px arms, ≤ 18000 bytes. docs/avatar.md
  skin: '',
  languages: ['zh', 'en'],
  // weather: { city: '上海', cityEn: 'Shanghai', latitude: 31.23, longitude: 121.47, timezone: 'Asia/Shanghai' },
  weather: null,
  dock: ['about', 'works', 'mailbox', 'phone'],
  mailbox: { endpoint: '', email: '', turnstileSitekey: '' },
  // 多人在线（multiplayer/）：endpoint 指向房间服务器（本地开发用 ws://127.0.0.1:8787，
  // 线上用 wss://…），留空 = 单机站。部署见 multiplayer/README.md。
  // maxRemote 是同屏渲染远端角色上限：>8 自动用实例化角色池（全场 8 个 draw call）。
  multiplayer: { endpoint: '', maxRemote: 24 },
  badge: true,
};
