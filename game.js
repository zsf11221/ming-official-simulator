// 微信小游戏入口：Canvas 渲染，复用 js/data.js + js/save.js + js/game.js
// AppID 在 project.config.json 里留空，用户注册小游戏账号后填入即可在开发者工具运行。
// 激励视频：有广告单元 ID 时接 wx.createRewardedVideoAd，无 ID 时降级为模拟奖励，不报错。
var D = require('./js/data.js');
var Save = require('./js/save.js');
var Game = require('./js/game.js');

var canvas = wx.createCanvas();
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var st = null, screen = 'home', events = [], showEquip = false, poster = null, adTimer = 0;
var buttons = [];

function btn(x, y, w, h, label, fn) { buttons.push({ x: x, y: y, w: w, h: h, label: label, fn: fn }); }
function rect(x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function text(s, x, y, size, color, align) {
  ctx.fillStyle = color || '#2b2118'; ctx.font = (size || 16) + 'px sans-serif';
  ctx.textAlign = align || 'left'; ctx.fillText(s, x, y);
}
function wrapText(s, x, y, maxW, size, lh) {
  ctx.font = size + 'px sans-serif'; var line = '', yy = y;
  for (var i = 0; i < s.length; i++) {
    var t = line + s[i];
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = s[i]; yy += lh; } else line = t;
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

function drawHome() {
  buttons = [];
  rect(0, 0, W, H, '#fbf6ea');
  rect(0, 0, W, 90, '#7a1f1f');
  text('浮世千年 · 洪武仕途', W / 2, 55, 24, '#f5e6c8', 'center');
  text('洪武十一年 · 一纸任命 · 半生浮沉', 20, 130, 15, '#8a6d3b');
  wrapText('大明立国未久。你奉命出任一县知县，接手三百户、千余人的残破县城。从断案劝农，到结亲育子，从朝廷考课，到仕途沉浮。', 20, 165, W - 40, 15, 24);
  var auto = Save.loadAuto();
  var y = 320;
  if (auto) { btn(40, y, W - 80, 52, '继续游戏（' + auto.year + '年 · ' + D.RANKS[auto.rankIndex].name + '）', function () { startFrom(auto); }); y += 66; }
  btn(40, y, W - 80, 52, '新开一局', function () { st = Game.newGame('hanmen', undefined, 'jingshi'); Game.drawYearEvents(st); events = st.pendingEvents; screen = 'game'; draw(); });
  btn(40, y + 66, W - 80, 52, '读档（3个槽）', function () { loadSlotMenu(); });
  drawButtons();
  text('个人主体 · 纯广告变现 · 看广告只是加速', 20, H - 30, 12, '#8a7a5a');
}
function loadSlotMenu() {
  var s = Save.loadSlot(1) || Save.loadSlot(2) || Save.loadSlot(3) || Save.loadAuto();
  if (s) startFrom(s);
  else wx.showToast({ title: '暂无存档', icon: 'none' });
}
function startFrom(s) {
  st = s;
  if (st.status !== 'playing') { screen = 'end'; poster = st.poster; draw(); return; }
  if (!st.pendingEvents || !st.pendingEvents.length) Game.drawYearEvents(st);
  events = st.pendingEvents; screen = 'game'; draw();
}

function drawGame() {
  buttons = [];
  rect(0, 0, W, H, '#fbf6ea');
  rect(0, 0, W, 70, '#7a1f1f');
  var rank = D.RANKS[st.rankIndex];
  text('洪武' + (st.year - 1367) + '年 ' + st.year + '年 · ' + st.age + '岁', 16, 32, 15, '#fff');
  text(rank.name + ' ' + rank.pin, 16, 56, 14, '#f5e6c8');
  text('官库' + st.res.silver + ' 俸余' + st.res.privateSilver + ' 粮' + st.res.grain, W - 16, 32, 13, '#fff', 'right');
  text('声' + st.res.shengwang + ' 政' + st.res.zhengji + ' 健' + st.res.jiankang + ' 贪' + st.res.tanmo, W - 16, 56, 13, '#fff', 'right');
  var y = 86;
  btn(16, y, 100, 36, '存档', function () { Save.saveSlot(1, st); Save.saveAuto(st); wx.showToast({ title: '已存档', icon: 'success' }); });
  btn(124, y, 120, 36, '装备升级', function () { showEquip = !showEquip; draw(); });
  btn(252, y, 130, 36, '看广告领奖励', function () { watchAd(); });
  y += 50;
  if (showEquip) {
    rect(16, y, W - 32, 170, '#fff');
    text('装备升级（银两+功绩）', 28, y + 24, 15, '#7a1f1f');
    D.EQUIPS.forEach(function (e, i) {
      var lv = st.equip[e.id] || 0;
      text(e.name + ' Lv.' + lv + '/' + e.max, 28, y + 52 + i * 24, 13, '#333');
      btn(W - 110, y + 32 + i * 24, 86, 22, '升级', (function (id) { return function () { var r = Game.upgradeEquip(st, id); wx.showToast({ title: r.ok ? '升级成功' : r.msg, icon: 'none' }); Save.saveAuto(st); draw(); }; })(e.id));
    });
    y += 180;
  }
  var idx = st.decisionsThisYear;
  var ev = events[idx] || events[0];
  if (ev) {
    rect(16, y, W - 32, 220, '#fff');
    text('今年第 ' + (idx + 1) + ' / 3 件政事 · ' + ev.cat, 28, y + 26, 14, '#7a1f1f');
    text(ev.title, 28, y + 52, 17, '#222');
    wrapText(ev.text, 28, y + 80, W - 56, 14, 22);
    ev.choices.forEach(function (c, i) {
      btn(28, y + 140 + i * 44, W - 56, 36, (i + 1) + '. ' + c.text, (function (e2, ci) {
        return function () {
          var r = Game.choose(st, e2, ci); Save.saveAuto(st);
          if (st.status !== 'playing') { screen = 'end'; poster = st.poster; }
          else if (r && r.eval === 'promote') { poster = r.poster; wx.showToast({ title: '升官了！' + r.rank.name, icon: 'success' }); }
          draw();
        };
      })(ev, i));
    });
  }
  var log = st.log.slice(-4);
  log.forEach(function (l, i) { wrapText(l, 20, H - 120 + i * 26, W - 40, 12, 18); });
  drawButtons();
}

function drawEnd() {
  buttons = [];
  rect(0, 0, W, H, '#7a1f1f');
  rect(16, 16, W - 32, H - 32, '#fbf6ea');
  text('结局', W / 2, 80, 28, '#7a1f1f', 'center');
  if (poster) {
    text(poster.title, W / 2, 120, 20, '#333', 'center');
    text(poster.name + ' · ' + poster.rank, W / 2, 155, 15, '#333', 'center');
    text(poster.year + '年 · ' + poster.age + '岁 · 在任' + poster.yearsPlayed + '年', W / 2, 185, 15, '#333', 'center');
    wrapText('“' + poster.comment + '”', 40, 230, W - 80, 16, 26);
  }
  btn(40, H - 180, W - 80, 48, '分享海报', function () {
    if (wx.shareAppMessage) wx.shareAppMessage({ title: '我在洪武仕途做到' + (poster ? poster.rank : '') + '，你来试试？' });
  });
  btn(40, H - 120, W - 80, 48, '再开一局', function () { screen = 'home'; draw(); });
  drawButtons();
}

function drawButtons() {
  buttons.forEach(function (b) {
    rect(b.x, b.y, b.w, b.h, '#7a1f1f');
    ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center';
    var label = b.label.length > 18 ? b.label.slice(0, 18) + '…' : b.label;
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 5);
  });
}

function watchAd() {
  // 有广告单元 ID 时接真实激励视频；无 ID 时降级模拟，不报错。
  try {
    if (wx.createRewardedVideoAd) {
      var ad = wx.createRewardedVideoAd({ adUnitId: '' });
      if (ad && ad.show) {
        ad.show().catch(function () { Game.adReward(st, 'mix'); Save.saveAuto(st); draw(); });
        ad.onClose(function (res) { if (res && res.isEnded) { Game.adReward(st, 'mix'); Save.saveAuto(st); draw(); } });
        return;
      }
    }
  } catch (e) {}
  Game.adReward(st, 'mix'); Save.saveAuto(st);
  wx.showToast({ title: '奖励已领取（模拟广告）', icon: 'none' }); draw();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if (screen === 'home') drawHome();
  else if (screen === 'game') drawGame();
  else drawEnd();
}

wx.onTouchStart(function (res) {
  var t = res.touches[0];
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    if (t.clientX >= b.x && t.clientX <= b.x + b.w && t.clientY >= b.y && t.clientY <= b.y + b.h) { b.fn(); return; }
  }
});
draw();
