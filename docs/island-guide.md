# 石兴龙的小岛 — 开发指南

> 给后续 Agent 的快速上手文件。`AGENTS.md` 是权威 API 手册（坐标、World API、性能预算），先读它；
> 这份文件补充「实际上手怎么干」：当前世界的地图、常见任务配方、验证流程、以及真实踩过的坑。
> 上游模板文档见 `README.md` 与 `docs/`；示例实现见 `examples/terry-home/`。

## 1. 三十秒了解

- 这是 **Homecraft** 模板（Minecraft 风格 3D 个人网站，Three.js + 原生 ES Module，无构建步骤），正在被改造成用户的个人站点「石兴龙的小岛」。
- 引擎（`engine/`）与 vendor **不要动**；所有定制都发生在 `world/`、`index.html`、`home.config.js`、`homecraft.json`、`assets/`。
- 本地预览：`python3 tools/serve.py`（自动挑端口、开浏览器、打印地址、写 `tools/.serve-url`）。本机通常已有一个在后台跑，`npm run check` 会自动连上它，不用重启。
- 每次改动后**刷新浏览器即可**（响应禁用了缓存）。
- 风格基调：极简田园风。木屋与全部家具已应用户要求拆除（2026-11-03），现在岛上的主体是**篝火 + 小石的阿拉伯风货摊 + 一大一小两棵方块树**；点缀色转向赤陶红/奶油/青绿（摊位配色），辅以深核桃木。

## 2. 当前世界布局速查（2026-11-03 缩岛版）

坐标：1 格 = 1 m，x 向东，z 向南（海在南边，开场镜头从南往北看），地面 y=0。详见 `world/layout.js`。

| 区域 | 位置 | 备注 |
|---|---|---|
| 小石的摊位 | 地毯中心 (-20.4, 19.6)，长轴南北向，无棚无牌，在篝火东南草坪上（与火圈、东凳完全脱离） | 花纹地毯、香料碗/布卷/陶罐、存钱罐木箱（毯西端）、灯柱（东北角）。**地毯无碰撞、可踩上去走近小石**；只有木箱/灯柱/商品零散小件保持实体或不设碰撞 |
| NPC 程序员小石 | (-22.2, 20.3) 朝东北偏东（ry 2.0） | BoxBatch 手搭：深色连帽衫+牛仔裤+眼镜+短发、双手捧笔记本；头顶有 THREE.Sprite 名牌（canvas `fillText` 画中文，`pixelText` 不支持 CJK）；about 卡的 hotspot 在他身上 |
| 篝火 CAMPFIRE | (-24, 18) | 石圈 + 三条原木座位 + 柴堆（柴堆坐标随 cx/cz 走，勿再写死）；火焰是 `surfaces.fireplace` 数组 |
| 篝火旁双树 TREES | (-27, 22) 大 / (-28, 14) 小 | `buildTrees` 方块树 [x, z, 干高, 冠半径]；树干在狗活动区外 |
| 信箱 MAILBOX | (-16, 8) yaw 0 | 朝南，毯子西北石板路旁 |
| 传送门 PORTAL | (-12, 11) yaw -π/2 | 朝西迎客；前方草坪已留空 |
| 出生点 SPAWN | (-15.6, 19) heading 3π/4 | 站在摊位东南的开阔草坪上，面朝东北看信箱和传送门（不在传送门旁——玩家默认不是从传送门进来的） |

2026-11-03 起岛屿极简化：木屋（含全部露天家具与门廊甲板）、泳池、菜园都已拆除，`plants.js` 仍在仓库但已无人引用。layout 里没有 HOUSE/POOL/FARM/TERRACE 等导出，引擎全有空值守卫。地表只剩：草、沙圈、travertine 石板路。

**岛屿尺寸（2026-11-03 缩小）**：`ISLAND = { x0: -34, x1: -10, z0: 4, z1: 25 }`（24×21，原 74×57）——东岸在摊位东 10 格，北岸在小树北 10 格，西南岸贴着大树和篝火。传送门、信箱、出生点、猫狗区、石板路都已随之搬进新范围（旧位置 x> -10 / z<4 全部作废）。`INTRO` 开场镜头：起点 [-9,7,19] 俯瞰、看向毯子 [-20.4,0.5,19.6]。**引擎已改两处**：`world/stage.js`（五个时段 sunDir 对向翻转）、`world/rig.js`（HOME_VIEW = 桌面 [π/2, 0.55, 13] / 手机 [π/2, 0.6, 11]——初始化背后镜头为**朝西的低角度斜视角（约 31°）2.5D 视角**）——升级引擎整体替换时这两处需要重做。

站点（STATIONS）：`about`（NPC 小石）、`works`（摊位商品地毯）、`contact`（存钱罐木箱）有卡片，hotspot 都挂在小石的摊位上；`campfire` 是 `page: false` 的地图标记点；`mailbox`、`portal` 由引擎自动处理。

烘焙灯（`bakes`）共 2 盏：campfire、stall-lantern，全部落在 LIGHT_VOLUME（min [-28,-1,-13], extent [42,13,36]）内。**新增灯具必须写 bakes**，否则夜里不亮。

白鸽（`world/doves.js`）：每次进页随机 2-8 只，巡航区是**绕岛含海面的一个大圈**（x -44..-1, z -6..34, 高 4-12 m），大部分时间在飞；每个航点落地掷 1/10 概率，同时落地最多 2 只（`MAX_GROUNDED`）。降落点是一张写死的净空草坪/地毯坐标表（`SPOTS`，避开所有 foot）。改巡航区或降落点时同步避开：篝火 foot、木凳、摊位木箱、NPC、大树树冠。

烘焙灯（`bakes`）共 2 盏：campfire、stall-lantern，全部落在 LIGHT_VOLUME（min [-28,-1,-13], extent [42,13,36]）内。**新增灯具必须写 bakes**，否则夜里不亮。

宠物：猫活动于信箱旁的东北草坪（within x -19..-12, z 4.5..11）；狗活动于中央草坪（within x -25..-11.5, z 5..21），摊位的木箱/灯柱保持实体供导航绕行，地毯本身无碰撞。

## 3. 文件地图：改什么、不改什么

| 文件 | 角色 |
|---|---|
| `world/layout.js` | **先改这个**。所有位置数据：岛范围、出生点、站点、房子、泳池、篝火、菜园、小路石板、树 |
| `world/build.js` | 地形与建筑：`defineBlocks`（方块类型）、`surfaceAt`（每列地表）、`buildPool`、`tuftList`（花草） |
| `world/furnish.js` | 篝火圈 + 小石的摊位 + NPC + hotspots + bakes + surfaces |
| `world/doves.js` | 白鸽群（2-8 只随机）：6 个 InstancedMesh 承载全群，`setup.update` 里状态机驱动（巡航/降落/地面），每帧零分配；地毯无碰撞所以鸽子能落在毯上 |
| `world/plants.js` | 盆栽/室内植物（BoxBatch 实体叶型）——家具拆除后暂无人引用，恢复室内场景时可再用 |
| `multiplayer/` | 多人在线（2026-11-03 加）：`client/` 无依赖 ES 模块 + `server/` Node 房间服务器（依赖 ws）。`world/build.js` 的 `setup()` 是唯一粘合点；`home.config.js` 的 `multiplayer.endpoint` 留空 = 完全关闭。详见 `multiplayer/README.md` |
| `index.html` | 卡片内容（`<article class="page" data-station="id">`）、`<title>`、og 元数据 |
| `home.config.js` | 名字（手机账户卡）、Dock 顺序、语言、皮肤路径 |
| `homecraft.json` | 公开元数据：站点名、url、logo、intro |
| `assets/` | 截图、皮肤、logo |
| `engine/`、`vendor/` | 引擎，别改；升级时整体替换 |
| `examples/terry-home/` | 参考实现——做任何新东西前先去那里找同类物品抄尺寸和材质 |

## 4. 常见任务配方

**加一个可交互站点（如「书架」）**
1. `world/layout.js` 的 `STATIONS` 加一条：`at` 在物体前 ~1.5 m，`look` 指向物体，`icon` 用 `engine/ui/icons.js` 的 ART 里的名字。
2. `index.html` 加对应 `<article class="page" data-station="同样的id">`。
3. `world/furnish.js` 里给那个物体加 `hot('id', x, y, z, w, h, d)`（点击/靠近检测框）。
4. 纯风景点（无卡片）则第 2、3 步都不要，写 `page: false`。

**加一件家具**：在 `world/furnish.js` 用 `B.box(cx, y, cz, w, h, d, look)`（y 是底面高度）；加 `foot()` 碰撞（比实物每边多 ~5 cm）；有灯就 `bake()`；返回值不用动。

**改建筑**：`world/build.js` 的 `grid.set/fill`（半开区间），新方块类型用 `grid.define`；室外地表在 `surfaceAt` 里按区域返回类型名。屋顶/山墙要挂 `'roof'` group，四面墙挂 `wallN/S/E/W`，进屋时引擎才自动隐藏它们。

**改站点名/标题**：`homecraft.json` 的 `name`、`index.html` 的 `<title>` 和 `og:title` 三处必须一起改（check:site 会校验一致性）。`home.config.js` 的 `name` 是**主人名字**（手机账户卡显示），和站点名不是一回事。

**双语**：短标签英文为默认，中文加 `data-zh`；长段落分 `lang="zh-CN"` / `lang="en"` 两份。

**本地试多人在线**：`cd multiplayer/server && BOTS_RECT='-30,6,-12,23' node server.js --bots 8`（起房间+8 个假人在岛上散步），`home.config.js` 的 `multiplayer.endpoint` 填 `ws://127.0.0.1:8787` 后刷新页面；再开一个无痕窗口就是第二个玩家。`npm run check:mp` 是全自动双窗口对拍（自己起临时服务器，走 `?mp=` 参数，不依赖配置）。按 T 聊天，杀掉服务器看「重连中…」降级。**maxRemote > 8 走实例化角色池**（全场共 8 个 draw call），≤8 走逐人引擎 Avatar。

## 5. 每次改动后的验证流程

1. 刷新浏览器肉眼看。
2. `npm run check:site`（无依赖秒出）→ 再 `npm run check`（headless 浏览器双端检查 + 截图到 `tools/.check/`）。**改了视觉必须看至少一张截图**。改了 multiplayer 再跑 `npm run check:mp`（自动起临时房间服务器，不占用 8787）。
3. 预算红线：60 draw calls / 20 万三角面 / 实时灯最多 2 / 每帧零分配。当前基线（极简岛+摊位后）：桌面 23、手机 16 draw calls，~1 万三角面。
4. 浏览器控制台调试 API（详见 AGENTS.md）：`__home.stats()`、`__home.go('about')`、`__home.player.teleport(x, z)`、`__home.setTimeMode('night')`、`__home.rig.showcase([camX,Y,Z], [lookX,Y,Z])`。查夜景灯光必用 night 模式。

**拍验证截图的最简脚本**（playwright 已装在项目 devDependencies；脚本必须放项目目录内才能 resolve 依赖；无头浏览器先试 `{ channel: 'chrome' }` 再回退默认）：

```js
// tools/.check-shot.mjs   node tools/.check-shot.mjs
import { chromium } from 'playwright';
const url = (await import('node:fs')).readFileSync(new URL('./.serve-url', import.meta.url), 'utf8').trim();
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url);
await page.waitForFunction(() => window.__home, null, { timeout: 15000 });
await page.waitForTimeout(4000); // 等开场镜头结束
for (const [name, cam, look] of [['interior', [-8.5,1.8,0.8], [-16.5,0.9,-5.5]]]) {
  await page.evaluate(([c, l]) => __home.rig.showcase(c, l), [cam, look]);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tools/.check/view-${name}.png` });
}
await browser.close();
```

## 6. 踩坑实录（都是真实撞过的）

1. **作品卡片崩引擎**：`ul.store > li[data-work]` 的 `.listing` 里**必须有 `<img>`**（`engine/ui/workbench.js` 会 `querySelector('.listing > img').cloneNode()`，缺图直接 `null.cloneNode` 报错，整个 check 失败）。没有真实作品截图时，用 `placeholder-card` 结构，别上 `ul.store`。
2. **泳池是引擎模块**：`engine/world/pool.js` 只在 `L.POOL` 存在时加载（`main.js` 里有 NO_POOL 空实现兜底）；梯子、池灯这类物件当年是 `furnish.js` 手搭的。泳池已拆，要恢复泳池需连同这两处一起加回来。
3. **`surfaces.fireplace` 支持数组**：篝火用两片交叉火焰（rotation 0 和 π/2 各一），壁炉一片，引擎 `[].concat()` 处理。
4. **`pixelText` 只支持 A–Z、0–9 和少量标点，不支持中文**。所有世界内标牌（如 WELCOME 门牌）只能用英文。
5. **贴片（plane）朝向**：`ry=0` 面朝南、`π/2` 朝东、`-π/2` 朝西、`π` 朝北；贴片必须放在**观者那一侧**、比底板凸出 ~5 mm 才不会被框体挡住（v1 的照片墙和书房屏风就因贴反了而一直没露过画面，拆屋改造时已修正）。要"始终面向镜头"的东西（如 NPC 名牌）用 `THREE.Sprite` 塞进 `planes`——引擎只做 `group.add(p)`，Sprite 也是 Object3D，能直接放。
5b. **canvas 自定义纹理只能贴 plane**：BoxBatch 的 `tex` 只认内置纹理名，传 `canvasTexture` 的原始纹理会渲染成灰色回退（条纹遮阳篷踩过）。另外两层贴片上下夹薄板时，间距要留 ~5 cm，远距离低角度看会 z-fighting。
5c. **世界内中文**：`pixelText` 只支持 A–Z/0–9；中文标牌用 `canvasTexture` + `ctx.font`/`fillText` 走系统 CJK 字体（小石名牌即此做法）。
6. **`rig.showcase()` 没有解锁 API**：锁完相机想恢复，重新 `page.goto(url)` 刷新页面。
7. **引擎对无 HOUSE 完全兼容**：`L.HOUSE || null` 全处有守卫，拆除房子只需删 layout 导出并停掉 `buildShell`，墙隐/屋顶/DOORWAY 逻辑自动关闭。
8. **`page: false` 的站点不要配 hotspot**（terry 的 mountain 也没有）；hotspot 的 `id` 必须和有卡片的 station id 一致。
9. **站点的 `at`/`look` 要避开家具 foot**：站的位置如果踩进障碍框，玩家会被推来推去。选点前先看 furnish.js 里的 foot 坐标。
10. **实体叶植物会「穿墙」**：plants.js 的冠幅按 `width` 缩放，贴墙摆放时留 ~0.5 m，不然叶子插进墙里。
11. **check.mjs 的 showcase 巡检项只对 terry 生效**（依赖 `world.roofAccess`），我们的世界没有屋顶爬梯，返回 null 自动跳过，不用管它输出里的 roof 字样。
12. **宠物路线**：`within()` 是硬边界，anchors 必须都在 within 内且不踩 furniture foot，否则宠物抽搐/卡墙。

## 7. 等用户提供的内容（问过，还没给）

- `homecraft.json` 的一句话简介（intro）和自定义 logo（128×128、≤100 KB）——check:site 目前仅剩这两条 warning。
- 作品卡片内容：作品名 + 一句话介绍 + 链接 + 400×869 竖版 WebP 截图，拿到后把占位卡片升级成 `ul.store` 图文列表（记得每条带 `<img>`）。
- 联系方式：GitHub / 邮箱的真实链接（`index.html` contact 卡里已留好位置，**用户没给链接前不要写 href**）。
- 可选：64×64 皮肤 PNG（`home.config.js` 的 `skin`，规格见 docs/avatar.md），现在还是默认小人。
- 部署前：提醒用户用真手机体验一次帧率（本地帧时间不代表手机端）。

## 8. 汇报习惯

- 用户是中文交流，喜欢**小步迭代**：每完成一个可见的阶段就让他刷新浏览器看效果，再按反馈调。
- 改动完用一两句话报告做了什么 + check 数字（draw calls / 三角面），别贴大段日志。
