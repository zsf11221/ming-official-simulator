// 网页试玩版 UI：复用 js/data.js + js/save.js + js/game.js
(function () {
  var D = window.MingData, Save = window.MingSave, Game = window.MingGame;
  var st = null, currentEvents = [], selectedOrigin = 'hanmen', selectedTalent = 'jingshi';
  var $ = function (id) { return document.getElementById(id); };

  function show(id) {
    ['screen-home', 'screen-game', 'screen-end'].forEach(function (s) { $(s).style.display = s === id ? 'block' : 'none'; });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function refreshSaveList() {
    var auto = Save.loadAuto();
    var html = '';
    if (auto) html += '<div class="save-item"><span>💾 自动存档：' + auto.year + '年 · ' + D.RANKS[auto.rankIndex].name + ' · ' + auto.age + '岁</span><button class="btn small" onclick="window.__loadAuto()">继续</button></div>';
    Save.listSlots().forEach(function (info, i) {
      if (!info) return;
      var d = new Date(info.savedAt);
      html += '<div class="save-item"><span>📁 存档' + (i + 1) + '：' + info.year + '年 · ' + D.RANKS[info.rank].name + ' · ' + d.toLocaleString() + '</span><button class="btn small" onclick="window.__loadSlot(' + (i + 1) + ')">读档</button></div>';
    });
    $('save-list').innerHTML = html || '<div class="note">暂无存档，先新开一局。</div>';
    $('btn-continue').disabled = !auto;
  }
  window.__loadAuto = function () { var s = Save.loadAuto(); if (s) startFrom(s); };
  window.__loadSlot = function (n) { var s = Save.loadSlot(n); if (s) startFrom(s); };

  function renderTalents() {
    $('talent-list').innerHTML = D.TALENTS.map(function (t) {
      return '<div class="origin' + (t.id === selectedTalent ? ' sel' : '') + '" data-id="' + t.id + '"><b>' + t.name + '</b><br>' + t.desc + '</div>';
    }).join('');
    document.querySelectorAll('#talent-list .origin').forEach(function (el) {
      el.onclick = function () { selectedTalent = el.getAttribute('data-id'); renderTalents(); };
    });
  }
  function renderOrigins() {
    $('origin-list').innerHTML = D.ORIGINS.map(function (o) {
      return '<div class="origin' + (o.id === selectedOrigin ? ' sel' : '') + '" data-id="' + o.id + '"><b>' + o.name + '</b><br>' + o.desc + '</div>';
    }).join('');
    document.querySelectorAll('#origin-list .origin').forEach(function (el) {
      el.onclick = function () { selectedOrigin = el.getAttribute('data-id'); renderOrigins(); };
    });
    renderTalents();
  }

  function startFrom(s) {
    st = s; if (st.status !== 'playing') { showEnd(); return; }
    if (!st.pendingEvents || !st.pendingEvents.length) Game.drawYearEvents(st);
    currentEvents = st.pendingEvents;
    show('screen-game'); render();
  }
  function newGame() {
    st = Game.newGame(selectedOrigin, undefined, selectedTalent);
    Game.drawYearEvents(st);
    currentEvents = st.pendingEvents;
    Save.saveAuto(st);
    show('screen-game'); render();
  }

  function render() {
    if (!st) return;
    var rank = D.RANKS[st.rankIndex];
    $('st-year').textContent = '洪武' + (st.year - 1367) + '年 · ' + st.year + '年';
    $('st-age').textContent = st.age;
    $('st-gen').textContent = st.generation;
    $('st-rank').textContent = rank.name + ' ' + rank.pin;
    var r = st.res;
    $('res-grid').innerHTML =
      res('🏛️ 官库银两', r.silver) + res('💰 俸余', r.privateSilver) + res('🌾 官仓粮食', r.grain) +
      res('🌾 耕地', r.mu + '亩') + res('🏠 户数', r.households) + res('👥 人口', r.population) +
      res('❤️ 民心', r.minxin) + res('⭐ 声望', r.shengwang) + res('📈 政绩', r.zhengji) +
      res('💪 健康', r.jiankang) + res('⚠️ 贪墨风险', r.tanmo) + res('🎖️ 功绩', st.mat.gongji);
    var six = st.attr.six || {};
    $('six-panel').innerHTML = '<b>六维</b> ' + D.SIX_DIMS.map(function (d) { return d.name + (six[d.id] == null ? '' : six[d.id]); }).join(' · ') +
      ' &nbsp;|&nbsp; 出身：' + st.originName + ' · 天赋：' + (st.talentName || '') + ' · 子嗣：' + (st.child.has ? st.child.age + '岁' : '未有') + ' · 升官' + st.stats.promotions + '次';
    var next = D.RANKS[st.rankIndex + 1];
    $('risk-panel').innerHTML = '<b>⚠️ 三条风险线</b><br>考课：' + (next ? ('下一级' + next.name + '需政绩' + next.need + '，当前' + r.zhengji + '，在任' + st.yearsInRank + '年，满3年考课') : '已是首辅') +
      '<br>贪墨：风险 ' + r.tanmo + '/100，≥80 被弹劾罢官 · 健康 ' + r.jiankang + '，≤0 病逝 · 民心 ' + r.minxin + '，≤0 民变罢官';
    var upcoming = (D.TIMELINE || []).filter(function (t) { return t.year >= st.year; }).slice(0, 2);
    $('timeline-panel').innerHTML = '<b>🌏 天下风云</b><br>' + (upcoming.length ? upcoming.map(function (t) { return t.year + '年：' + t.text.replace('天下风云：', ''); }).join('<br>') : '已到靖难之后，天下初定。');
    function res(label, v) { return '<div class="res">' + label + '<b>' + v + '</b></div>'; }
    $('log-box').innerHTML = st.log.slice(-30).reverse().map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('');
    renderEvent();
    renderEquip();
  }

  function renderEvent() {
    var box = $('event-box');
    if (st.status !== 'playing') { showEnd(); return; }
    if (st.decisionsThisYear >= D.DECISIONS_PER_YEAR) { Game.drawYearEvents(st); currentEvents = st.pendingEvents; }
    var idx = st.decisionsThisYear;
    var ev = currentEvents[idx];
    if (!ev) { Game.drawYearEvents(st); currentEvents = st.pendingEvents; ev = currentEvents[0]; }
    box.innerHTML = '<h3>今年第 ' + (idx + 1) + ' / ' + D.DECISIONS_PER_YEAR + ' 件政事 · ' + esc(ev.cat) + '</h3>' +
      '<p><b>' + esc(ev.title) + '</b><br>' + esc(ev.text) + '</p>' +
      ev.choices.map(function (c, i) { return '<button class="choice" data-i="' + i + '">' + esc(c.text) + '</button>'; }).join('') +
      '<p class="note">每做一个抉择功绩+2。每年做满3件政事就过一年，三年一考课，政绩够就升官。</p>';
    box.querySelectorAll('.choice').forEach(function (btn) {
      btn.onclick = function () {
        var res = Game.choose(st, ev, parseInt(btn.getAttribute('data-i'), 10));
        Save.saveAuto(st);
        if (st.status !== 'playing') { showEnd(); return; }
        if (res && res.eval === 'promote') { alert('★ 升官了！' + res.rank.name + '（' + res.rank.pin + '），海报已生成，去结局页查看或继续玩。'); drawPoster(res.poster); }
        render();
      };
    });
  }

  function renderEquip() {
    var p = $('equip-panel');
    p.innerHTML = '<h3>🎖️ 装备升级（银两+功绩，免费路可通关）</h3>' +
      D.EQUIPS.map(function (e) {
        var lv = st.equip[e.id] || 0;
        var costS = e.baseCost + lv * 15, costG = 4 + lv * 4;
        return '<div class="equip-row"><span><b>' + e.name + ' Lv.' + lv + '/' + e.max + '</b><br><span class="note">' + e.desc + '</span></span>' +
          '<button class="btn small" ' + (lv >= e.max ? 'disabled' : '') + ' onclick="window.__upg(\'' + e.id + '\')">升级 ' + costS + '两+' + costG + '功绩</button></div>';
      }).join('') + '<p class="note">功绩不够？多做抉择，或点“看广告领奖励”（网页版模拟3秒，微信版接真实激励视频）。</p>';
  }
  window.__upg = function (id) {
    var r = Game.upgradeEquip(st, id);
    if (!r.ok) alert(r.msg); else { Save.saveAuto(st); render(); }
  };

  function showEnd() {
    show('screen-end');
    var titles = { shoufu: '首辅致仕', zhishi: '告老还乡', bian: '贬谪边疆', minbian: '民变罢官', bingshi: '病逝任上', bangguan: '弹劾罢官' };
    $('end-title').textContent = st.ending ? ('结局 · ' + (titles[st.ending] || st.ending)) : '本局结束';
    $('end-text').textContent = st.name + '，第' + st.generation + '代，' + st.year + '年，' + D.RANKS[st.rankIndex].name + '，在任' + st.stats.yearsPlayed + '年，升官' + st.stats.promotions + '次。';
    if (st.poster) drawPoster(st.poster);
    var canInherit = st.child.has && st.child.age >= 16;
    $('btn-inherit').style.display = canInherit ? 'block' : 'none';
    Save.clearAuto();
  }

  function drawPoster(poster) {
    var c = $('poster'), ctx = c.getContext('2d');
    ctx.fillStyle = '#7a1f1f'; ctx.fillRect(0, 0, 720, 960);
    ctx.fillStyle = '#fbf6ea'; ctx.fillRect(24, 24, 672, 912);
    ctx.fillStyle = '#7a1f1f'; ctx.font = 'bold 44px serif'; ctx.textAlign = 'center';
    ctx.fillText('浮世千年 · 洪武仕途', 360, 110);
    ctx.font = '28px serif'; ctx.fillStyle = '#333';
    ctx.fillText(poster.title, 360, 170);
    ctx.font = '22px sans-serif'; ctx.textAlign = 'left';
    var lines = ['姓名：' + poster.name + '（' + poster.origin + '）', '年份：' + poster.year + '年 · ' + poster.age + '岁 · 第' + poster.generation + '代',
      '官职：' + poster.rank, '政绩 ' + poster.zhengji + ' · 民心 ' + poster.minxin + ' · 声望 ' + poster.shengwang,
      '在任 ' + poster.yearsPlayed + ' 年 · 升官 ' + poster.promotions + ' 次', '', '“' + poster.comment + '”', '', '一纸任命 · 半生浮沉'];
    lines.forEach(function (l, i) { ctx.fillText(l, 80, 240 + i * 52); });
    ctx.textAlign = 'center'; ctx.font = '18px sans-serif'; ctx.fillStyle = '#8a6d3b';
    ctx.fillText('微信小游戏试玩版 · ming-official-simulator', 360, 900);
  }

  // 按钮
  $('btn-new').onclick = function () { $('origin-picker').style.display = 'block'; renderOrigins(); $('origin-picker').scrollIntoView(); };
  $('btn-start').onclick = newGame;
  $('btn-continue').onclick = function () { var s = Save.loadAuto(); if (s) startFrom(s); };
  $('btn-load').onclick = function () { refreshSaveList(); alert('下面列出了自动存档和3个手动存档槽，点“继续/读档”即可恢复。'); };
  $('btn-home').onclick = function () { if (st) Save.saveAuto(st); show('screen-home'); refreshSaveList(); };
  $('btn-save').onclick = function () {
    var n = prompt('存到哪个槽？输入 1 / 2 / 3', '1');
    if (n === '1' || n === '2' || n === '3') { Save.saveSlot(parseInt(n, 10), st); Save.saveAuto(st); alert('已存到存档槽 ' + n + '，刷新页面后点“读档”可恢复。'); render(); }
  };
  $('btn-equip').onclick = function () { var p = $('equip-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; };
  $('btn-ad').onclick = function () {
    var box = $('ad-box'); box.style.display = 'block';
    var n = 3; $('ad-count').textContent = n;
    var t = setInterval(function () {
      n--; if (n <= 0) { clearInterval(t); box.style.display = 'none'; Game.adReward(st, 'mix'); Save.saveAuto(st); render(); alert('广告看完啦：功绩+6，银两+15。微信版将接真实激励视频广告。'); }
      else $('ad-count').textContent = n;
    }, 1000);
  };
  $('btn-dl-poster').onclick = function () {
    var a = document.createElement('a'); a.download = 'hongwu-shitu-poster.png';
    a.href = $('poster').toDataURL('image/png'); a.click();
  };
  $('btn-inherit').onclick = function () {
    var r = Game.inherit(st);
    if (!r.ok) { alert(r.msg); return; }
    st = r.state; Game.drawYearEvents(st); currentEvents = st.pendingEvents; Save.saveAuto(st); show('screen-game'); render();
  };
  $('btn-again').onclick = function () { show('screen-home'); refreshSaveList(); $('origin-picker').style.display = 'block'; renderOrigins(); };
  $('btn-back-home').onclick = function () { show('screen-home'); refreshSaveList(); };

  if ($('rules-text')) $('rules-text').textContent = D.RULES;
  show('screen-home'); refreshSaveList(); renderOrigins();
})();
