// 存档系统：网页版 localStorage / 小游戏版 wx.setStorageSync，同一份存档结构
// 存档槽：auto（自动存档）+ slot1/2/3（手动存档）
(function (root) {
  var PREFIX = 'ming_hongwu_';
  function hasWx() { return typeof wx !== 'undefined' && wx && wx.getStorageSync; }
  function get(k) {
    try {
      if (hasWx()) { var v = wx.getStorageSync(PREFIX + k); return v ? JSON.parse(v) : null; }
      var s = (typeof localStorage !== 'undefined') ? localStorage.getItem(PREFIX + k) : null;
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }
  function set(k, v) {
    try {
      var s = JSON.stringify(v);
      if (hasWx()) wx.setStorageSync(PREFIX + k, s);
      else if (typeof localStorage !== 'undefined') localStorage.setItem(PREFIX + k, s);
      return true;
    } catch (e) { return false; }
  }
  function remove(k) {
    try {
      if (hasWx()) wx.removeStorageSync(PREFIX + k);
      else if (typeof localStorage !== 'undefined') localStorage.removeItem(PREFIX + k);
    } catch (e) {}
  }
  var Save = {
    saveAuto: function (state) { return set('auto', { version: 1, savedAt: Date.now(), state: state }); },
    loadAuto: function () { var r = get('auto'); return r && r.state ? r.state : null; },
    saveSlot: function (n, state) { return set('slot' + n, { version: 1, savedAt: Date.now(), state: state }); },
    loadSlot: function (n) { var r = get('slot' + n); return r && r.state ? r.state : null; },
    slotInfo: function (n) {
      var r = get('slot' + n);
      if (!r || !r.state) return null;
      var st = r.state;
      return { savedAt: r.savedAt, year: st.year, rank: st.rankIndex, generation: st.generation, name: st.name };
    },
    listSlots: function () {
      var out = [];
      for (var i = 1; i <= 3; i++) out.push(this.slotInfo(i));
      return out;
    },
    clearSlot: function (n) { remove('slot' + n); },
    clearAuto: function () { remove('auto'); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Save;
  else root.MingSave = Save;
})(typeof window !== 'undefined' ? window : globalThis);
