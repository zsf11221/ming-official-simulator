// Node 自动化实测：新开一局 → 玩满10年 → 升一次官 → 存档 → 读档恢复 → 玩到结局 → 海报生成
// 存档用内存 localStorage 替身（Node 无 localStorage / wx），只验存档结构，不冒充浏览器实测。
global.localStorage = { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const Game = require('../js/game.js');
const Save = require('../js/save.js');
const Data = require('../js/data.js');
const assert = require('assert');

function seededRandom(seed) { let s = seed; return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

console.log('VERSION:', Data.VERSION, '| events:', Data.EVENTS.length, '| origins:', Data.ORIGINS.length, '| talents:', Data.TALENTS.length, '| timeline:', Data.TIMELINE.length);
assert.strictEqual(Data.VERSION, '1.0.0');
assert.ok(Data.EVENTS.length >= 50, '事件库须≥50条');

// 1. 新开一局：寒门士子 + 清廉刚直，起点与旧版实测一致
let st = Game.newGame('hanmen', '沈知远', 'qinglian');
assert.strictEqual(st.year, 1378);
assert.strictEqual(st.res.mu, 370);
assert.strictEqual(st.res.households, 300);
assert.strictEqual(st.res.population, 1000);
assert.strictEqual(st.res.silver, 110, '寒门士子官库银 120-10=110');
assert.strictEqual(st.attr.six.xueshi, 54, '寒门士子学识 50+4');
assert.strictEqual(st.talentName, '清廉刚直');
console.log('开局 OK：1378年 清河县知县，官库110两，耕地370亩，300户1000人，六维学识54，天赋清廉刚直');

// 2. 玩满 10 年（每年 3 个抉择，优先选政绩最高的选项），记录升官
const rng = seededRandom(42);
let promotedAt = null;
for (let y = 0; y < 10 && st.status === 'playing'; y++) {
  const evs = Game.drawYearEvents(st, rng);
  assert.strictEqual(evs.length, 3, '每年必须抽到3个事件（高密度，旧版前4个月才1个事件的短板已避开）');
  for (const ev of evs) {
    // 选政绩收益最高的选项（贪墨风险高的不选）
    let best = 0, bestScore = -1e9;
    ev.choices.forEach((c, i) => {
      const score = (c.effect.zhengji || 0) * 10 + (c.effect.minxin || 0) - (c.effect.tanmo || 0) * 5;
      if (score > bestScore) { bestScore = score; best = i; }
    });
    const before = st.rankIndex;
    Game.choose(st, ev, best);
    if (st.rankIndex > before && !promotedAt) promotedAt = { year: st.year, rank: Data.RANKS[st.rankIndex].name };
  }
}
console.log('10年实测：', JSON.stringify({ year: st.year, age: st.age, rank: Data.RANKS[st.rankIndex].name, zhengji: st.res.zhengji, minxin: st.res.minxin, tanmo: st.res.tanmo, promotions: st.stats.promotions, eventsDone: st.stats.eventsDone }));
assert.ok(st.stats.yearsPlayed >= 10, '须玩满10年');
assert.ok(st.stats.promotions >= 1, '10年内须至少升官一次');
assert.ok(promotedAt, '须记录升官年份');
console.log('升官 OK：首次升官在', promotedAt.year, '年，升任', promotedAt.rank);

// 3. 装备升级 + 看广告奖励
const up = Game.upgradeEquip(st, 'guanfu');
console.log('装备升级：', JSON.stringify(up), '官服等级=', st.equip.guanfu);
assert.ok(up.ok, '功绩攒够后官服应能升1级');
Game.adReward(st, 'mix');
assert.ok(st.stats.adsWatched >= 1);

// 4. 存档 → 读档恢复（自动存档 + 手动槽1）
Save.saveAuto(st);
Save.saveSlot(1, st);
const loadedAuto = Save.loadAuto();
const loadedSlot = Save.loadSlot(1);
assert.ok(loadedAuto && loadedAuto.year === st.year && loadedAuto.rankIndex === st.rankIndex, '自动存档读档须恢复年份与官职');
assert.ok(loadedSlot && loadedSlot.year === st.year, '手动槽1读档须恢复年份');
assert.ok(Save.slotInfo(1) && Save.slotInfo(1).year === st.year);
console.log('存档/读档 OK：自动+槽1均恢复到', loadedAuto.year, '年', Data.RANKS[loadedAuto.rankIndex].name);

// 5. 继续玩到结局（最多再玩 40 年，优先选政绩选项）
let guard = 0;
while (st.status === 'playing' && guard < 40) {
  guard++;
  const evs = Game.drawYearEvents(st, rng);
  for (const ev of evs) {
    if (st.status !== 'playing') break;
    let best = 0, bestScore = -1e9;
    ev.choices.forEach((c, i) => {
      const score = (c.effect.zhengji || 0) * 10 + (c.effect.minxin || 0) + (c.effect.jiankang || 0) - (c.effect.tanmo || 0) * 5;
      if (score > bestScore) { bestScore = score; best = i; }
    });
    Game.choose(st, ev, best);
  }
}
console.log('结局实测：', JSON.stringify({ status: st.status, ending: st.ending, year: st.year, age: st.age, rank: Data.RANKS[st.rankIndex].name, generation: st.generation, yearsPlayed: st.stats.yearsPlayed }));
assert.strictEqual(st.status, 'ended', '继续玩须能走到一个结局');
assert.ok(st.poster && st.poster.title && st.poster.comment, '结局须生成海报数据');
console.log('海报 OK：', st.poster.title, '|', st.poster.comment, '|', st.poster.rank, st.poster.year + '年');

// 6. 家族传承（若有成年子嗣则验，无则记为未触发，不算失败）
const inh = Game.inherit(st);
console.log('家族传承：', JSON.stringify(inh.ok ? { ok: true, generation: inh.state.generation, rank: Data.RANKS[inh.state.rankIndex].name } : { ok: false, msg: inh.msg }));
console.log('PLAYTEST PASS');
