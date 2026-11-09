// 核心引擎：纯逻辑，不依赖 DOM / wx，可在 Node 和浏览器 / 小游戏里复用
(function (root) {
function getData() {
if (typeof require!== 'undefined') { try { return require('./data.js');} catch (e) {}}
return root.MingData;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v));}
function clone(o) { return JSON.parse(JSON.stringify(o));}

var Game = {
newGame: function (originId, name, talentId) {
var D = getData();
var origin = D.ORIGINS.find(function (o) { return o.id === originId;}) || D.ORIGINS[0];
var talent = (D.TALENTS || []).find(function (t) { return t.id === talentId;}) || D.TALENTS[0];
var st = {
version: 1, name: name || '沈知远', originId: origin.id, originName: origin.name,
year: D.START_YEAR, age: D.START_AGE, generation: 1,
rankIndex: 0, yearsInRank: 0, yearsSinceEval: 0,
res: { silver: 120, privateSilver: 30, grain: 200, mu: 370, households: 300, population: 1000, minxin: 55, zhian: 55, lizhi: 55, shengwang: 30, zhengji: 20, jiankang: 85, tanmo: 5, xinren: 30 },
attr: { caixue: 50, renmai: 30, six: { zhili: 50, xueshi: 50, caiji: 50, tongyu: 50, dexing: 55, tipo: 55 } },
talentId: talent.id, talentName: talent.name,
equip: { guanfu: 0, guanyin: 0, kaoshan: 0, mensheng: 0, liangtian: 0, hufu: 0},
mat: { gongji: 0},
child: { has: false, age: 0, name: ''},
married: false,
log: [], decisionsThisYear: 0, pendingEvents: [],
status: 'playing', ending: null, poster: null,
stats: { yearsPlayed: 0, eventsDone: 0, promotions: 0, adsWatched: 0}
};
var b = origin.bonus || {};
Object.keys(b).forEach(function (k) { if (k === 'xueshi') st.attr.six.xueshi = clamp(st.attr.six.xueshi + b[k], 0, 100); else if (st.res[k] !== undefined) st.res[k] = clamp(st.res[k] + b[k], 0, 9999); });
var tb = talent.bonus || {};
Object.keys(tb).forEach(function (k) { if (k === 'tanmo') st.res.tanmo = clamp(st.res.tanmo + tb[k], 0, 100); else if (k === 'renmai') st.attr.renmai = clamp(st.attr.renmai + tb[k], 0, 100); else if (st.attr.six[k] !== undefined) st.attr.six[k] = clamp(st.attr.six[k] + tb[k], 0, 100); });
st.log.push('出身：' + origin.name + '；天赋：' + talent.name + '。');
st.log.push('洪武十一年，你奉命出任一县知县，接手三百户、千余人的残破县城。');
return st;
},

// 每年抽 3 个不重复事件
drawYearEvents: function (st, rng) {
var D = getData();
var rand = rng || Math.random;
var pool = D.EVENTS.slice();
var out = [];
while (out.length < D.DECISIONS_PER_YEAR && pool.length) {
var i = Math.floor(rand() * pool.length);
out.push(pool.splice(i, 1)[0]);
}
st.pendingEvents = out;
st.decisionsThisYear = 0;
return out;
},

// 做一个抉择：event + choiceIndex
choose: function (st, event, choiceIndex) {
var D = getData();
if (!st || st.status!== 'playing') return { ok: false, msg: '本局已结束'};
var ch = event.choices[choiceIndex];
if (!ch) return { ok: false, msg: '无此选项'};
var eff = ch.effect || {};
var equipBonus = 0;
// 装备加成：官服+政绩，官印+断案
if (eff.zhengji) eff = Object.assign({}, eff, { zhengji: eff.zhengji + (st.equip.guanfu || 0) * 0}); // 官服在结算时统一加，见下
var gain = 0;
if (eff.zhengji) gain = (st.equip.guanfu || 0); // 每级+1 政绩（简化为直接加）
if (event.cat === '断案' && eff.zhengji) gain += (st.equip.guanfu || 0) + (st.equip.guanyin || 0);
Object.keys(eff).forEach(function (k) {
if (k === 'caixue') st.attr.six.xueshi = clamp(st.attr.six.xueshi + eff[k], 0, 100);
else if (k === 'renmai') st.attr.renmai = clamp(st.attr.renmai + eff[k], 0, 100);
else if (st.attr.six[k] !== undefined) st.attr.six[k] = clamp(st.attr.six[k] + eff[k], 0, 100);
else if (k === 'gongji') st.mat.gongji = Math.max(0, st.mat.gongji + eff[k]);
else if (st.res[k]!== undefined) st.res[k] = clamp(st.res[k] + eff[k], 0, (k === 'silver' || k === 'grain' || k === 'mu' || k === 'households' || k === 'population' || k === 'privateSilver') ? 9999: 100);
});
if (gain) st.res.zhengji = clamp(st.res.zhengji + gain, 0, 100);
if (st.talentId === 'jingshi') st.res.zhengji = clamp(st.res.zhengji + 1, 0, 100);
// 功绩材料：每做一个抉择 +2，升官相关抉择额外+
st.mat.gongji += 2;
st.decisionsThisYear++;
st.stats.eventsDone++;
st.log.push('' + event.title + '：' + (ch.result || ''));
// 家族小推进：结亲/生子事件顺带
if (event.id === 'e06' && choiceIndex === 0) st.married = true;
if (event.id === 'e07' && choiceIndex === 0 &&!st.child.has) { st.child = { has: true, age: 0, name: '沈平安'};}
if (event.id === 'e52' &&!st.child.has) { st.child = { has: true, age: 0, name: '沈平安'};}
if (st.decisionsThisYear >= D.DECISIONS_PER_YEAR) this.endYear(st);
return { ok: true, result: ch.result || '', doneYear: st.decisionsThisYear === 0};
},

endYear: function (st) {
var D = getData();
st.stats.yearsPlayed++;
st.yearsInRank++;
st.yearsSinceEval++;
st.age++;
if (st.child.has) st.child.age++;
// 年度结算：俸禄、田产、门生、护身符
var rank = D.RANKS[st.rankIndex];
st.res.privateSilver = clamp(st.res.privateSilver + (rank.salary || 12), 0, 9999);
st.res.silver = clamp(st.res.silver + Math.floor(st.res.mu / 50) + (st.equip.liangtian || 0) * 5, 0, 9999);
st.res.population = clamp(st.res.population + (st.res.minxin >= 60 ? 12 : 3), 0, 99999);
st.res.households = clamp(Math.floor(st.res.population / 3.3), 0, 99999);
st.res.grain = clamp(st.res.grain + 20 + (st.equip.liangtian || 0) * 15 - 15 + Math.floor(st.res.mu / 100), 0, 9999);
st.res.shengwang = clamp(st.res.shengwang + (st.equip.mensheng || 0) * 2, 0, 100);
st.res.jiankang = clamp(st.res.jiankang - 1 + (st.equip.hufu || 0) * 2, 0, 100);
st.res.minxin = clamp(st.res.minxin + (st.res.grain > 50? 1: -2), 0, 100);
st.year++;
st.decisionsThisYear = 0;
st.pendingEvents = [];
st.log.push('—— ' + st.year + '年，你 ' + st.age + ' 岁，俸禄入账，秋粮入库。');
(D.TIMELINE || []).forEach(function (t) { if (t.year === st.year) st.log.push(t.text); });
if (st.res.tanmo >= 80) return this.endGame(st, 'bangguan');
// 终局判定
if (st.res.minxin <= 0) return this.endGame(st, 'minbian');
if (st.res.jiankang <= 0) return this.endGame(st, 'bingshi');
if (st.age >= 70) return this.endGame(st, st.rankIndex >= 6? 'shoufu': 'zhishi');
// 三年考课
if (st.yearsSinceEval >= D.EVAL_EVERY) return this.evaluate(st);
return { eval: null};
},

evaluate: function (st) {
var D = getData();
st.yearsSinceEval = 0;
var rank = D.RANKS[st.rankIndex];
var need = rank.need;
// 靠山降低要求
var needAdj = Math.max(0, need - (st.equip.kaoshan || 0) * 3);
// 注意：need 是下一级的门槛，当前 rankIndex 对应的是下一级要求存在 ranks[rankIndex+1]
var next = D.RANKS[st.rankIndex + 1];
// 与旧版不同：旧版要两次优秀才升知州；微信版为节奏改为一次优秀即升（考课仍三年一次），README 已注明。
if (!next) return this.endGame(st, 'shoufu');
var threshold = next.need - (st.equip.kaoshan || 0) * 3;
if (st.res.zhengji >= threshold && st.yearsInRank >= 3) {
st.rankIndex++;
st.yearsInRank = 0;
st.stats.promotions++;
st.res.zhengji = Math.max(10, st.res.zhengji - 25);
st.log.push('★ 考课上等！你升任' + D.RANKS[st.rankIndex].name + '（' + D.RANKS[st.rankIndex].pin + '）。');
var poster = this.makePoster(st, 'promotion');
return { eval: 'promote', rank: D.RANKS[st.rankIndex], poster: poster};
}
if (st.res.zhengji < 20) {
// 政绩太差：贬谪一级
if (st.rankIndex > 0) {
st.rankIndex--;
st.yearsInRank = 0;
st.res.zhengji = 30;
st.log.push('考课下等，你被贬了一级。');
return { eval: 'demote'};
}
return this.endGame(st, 'bangguan');
}
st.log.push('考课中等，留任原职，再干三年。');
return { eval: 'stay'};
},

// 装备升级：花银两 + 功绩
upgradeEquip: function (st, equipId) {
var D = getData();
var eq = D.EQUIPS.find(function (e) { return e.id === equipId;});
if (!eq) return { ok: false, msg: '无此装备'};
var lv = st.equip[equipId] || 0;
if (lv >= eq.max) return { ok: false, msg: '已满级'};
var costSilver = eq.baseCost + lv * 15;
var costGongji = 4 + lv * 4;
if (st.res.silver < costSilver) return { ok: false, msg: '官库银两不够（需' + costSilver + '两，公产不可挪用俸余）' };
if (st.mat.gongji < costGongji) return { ok: false, msg: '功绩不够（需' + costGongji + '点），多做抉择或看广告'};
st.res.silver -= costSilver;
st.mat.gongji -= costGongji;
st.equip[equipId] = lv + 1;
st.log.push('装备升级：' + eq.name + '升到' + (lv + 1) + '级。');
return { ok: true, level: lv + 1};
},

// 看广告奖励（网页版模拟3秒，微信版接激励视频；奖励本身免费给）
adReward: function (st, kind) {
st.stats.adsWatched++;
if (kind === 'silver') { st.res.silver += 30; st.log.push('看广告奖励：银两+30。');}
else if (kind === 'gongji') { st.mat.gongji += 10; st.log.push('看广告奖励：功绩+10。');}
else if (kind === 'health') { st.res.jiankang = clamp(st.res.jiankang + 10, 0, 100); st.log.push('看广告奖励：健康+10。');}
else { st.mat.gongji += 6; st.res.silver += 15; st.log.push('看广告奖励：功绩+6，银两+15。');}
return { ok: true};
},

// 家族传承：主角老了/出事后，子嗣继承
inherit: function (st) {
if (!st.child.has || st.child.age < 16) return { ok: false, msg: '子嗣未成年，无法继承'};
var oldRank = st.rankIndex;
var newState = this.newGame(st.originId, st.child.name || '沈平安', st.talentId);
newState.generation = st.generation + 1;
newState.year = st.year;
newState.age = 20;
newState.rankIndex = Math.max(0, oldRank - 2);
newState.res.shengwang = Math.floor(st.res.shengwang * 0.5);
newState.attr.renmai = Math.floor(st.attr.renmai * 0.5);
newState.res.silver = Math.floor(st.res.silver * 0.3);
newState.res.grain = Math.floor(st.res.grain * 0.3);
newState.log.push('第' + newState.generation + '代：' + st.name + '的血脉接过了衣钵，从' + getData().RANKS[newState.rankIndex].name + '重新开始。');
return { ok: true, state: newState};
},

endGame: function (st, endingId) {
st.status = 'ended';
st.ending = endingId;
st.poster = this.makePoster(st, endingId);
var titles = { shoufu: '首辅致仕', zhishi: '告老还乡', bian: '贬谪边疆', minbian: '民变罢官', bingshi: '病逝任上', bangguan: '弹劾罢官', chuancheng: '家族传承'};
st.log.push('' + (titles[endingId] || endingId) + '。');
return { eval: 'ended', ending: endingId, poster: st.poster};
},

makePoster: function (st, kind) {
var D = getData();
var rank = D.RANKS[st.rankIndex];
var lines = (D.POSTER_LINES[kind] || D.POSTER_LINES.zhishi || ['一纸任命，半生浮沉。']);
var title = kind === 'promotion'? ('升任' + rank.name): '浮世千年 · 洪武仕途';
var comment = lines[Math.floor(Math.random() * lines.length)];
return {
title: title, year: st.year, age: st.age, generation: st.generation,
rank: rank.name + ' ' + rank.pin, name: st.name, origin: st.originName,
zhengji: st.res.zhengji, minxin: st.res.minxin, shengwang: st.res.shengwang,
yearsPlayed: st.stats.yearsPlayed, promotions: st.stats.promotions,
comment: comment, kind: kind
};
}
};

if (typeof module!== 'undefined' && module.exports) module.exports = Game;
else root.MingGame = Game;
})(typeof window!== 'undefined'? window: globalThis);
