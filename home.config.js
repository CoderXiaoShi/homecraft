export default {
  name: '程序员小石',
  // 64×64 PNG, 4px arms, ≤ 18000 bytes. docs/avatar.md
  skin: '',
  languages: ['zh', 'en'],
  // weather: { city: '上海', cityEn: 'Shanghai', latitude: 31.23, longitude: 121.47, timezone: 'Asia/Shanghai' },
  weather: null,
  dock: ['about', 'works', 'mailbox', 'phone'],
  mailbox: { endpoint: '', email: '', turnstileSitekey: '' },
  // 多人在线（multiplayer/）：本地开发（localhost/127.0.0.1）自动连本机房间服务器
  // `node multiplayer/server/server.js`，线上连部署好的 wss 房间。留空 = 单机站。
  // 部署见 multiplayer/DEPLOY.md。maxRemote 是同屏渲染远端角色上限：
  // >8 自动用实例化角色池（全场 8 个 draw call）。
  multiplayer: {
    endpoint: ['localhost', '127.0.0.1'].includes(location.hostname)
      ? 'ws://127.0.0.1:8787'
      : 'wss://blog-ws.xinglong.tech',
    maxRemote: 24,
  },
  badge: true,
};
