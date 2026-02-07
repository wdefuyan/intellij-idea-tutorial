const sections = [
  "明星库", "影视作品", "舞台合集", "音乐作品", "最新更新", "关于我们"
];

const stars = [
  {
    id: "s1", name: "杨紫", region: "北京", roleType: "演员", debut: "2002", company: "欢瑞", representative: "香蜜沉沉烬如霜",
    movies: [{ name: "长相思", year: 2023, platform: "腾讯视频", role: "小夭" }],
    stages: [{ name: "跨年晚会舞台", year: 2024, occasion: "卫视晚会", songs: ["相见恨晚"] }],
    songs: [{ name: "沉香", year: 2024, type: "单曲", album: "沉香如屑 OST" }]
  },
  {
    id: "s2", name: "邓紫棋", region: "上海", roleType: "歌手", debut: "2014", company: "独立", representative: "深夜星河",
    movies: [{ name: "风起云涌", year: 2024, platform: "爱奇艺", role: "客串" }],
    stages: [{ name: "音乐盛典", year: 2023, occasion: "颁奖典礼", songs: ["星与海"] }],
    songs: [{ name: "星与海", year: 2023, type: "单曲", album: "星与海" }]
  },
  {
    id: "s3", name: "赵丽颖", region: "河北", roleType: "演员", debut: "2006", company: "和颂", representative: "知否知否应是绿肥红瘦",
    movies: [{ name: "与凤行", year: 2024, platform: "腾讯视频", role: "沈璃" }],
    stages: [{ name: "微博之夜", year: 2024, occasion: "典礼", songs: ["主题串烧"] }],
    songs: [{ name: "心火", year: 2022, type: "影视原声", album: "幸福到万家 OST" }]
  }
];

const state = {
  section: "明星库",
  region: "全部",
  roleType: "全部",
  resourceType: "全部",
  keyword: "",
  lastSync: localStorage.getItem("lastSync") || "未同步",
  favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
  history: JSON.parse(localStorage.getItem("history") || "[]"),
  feedback: JSON.parse(localStorage.getItem("feedback") || "[]")
};

const nav = document.getElementById("topNav");
const regionFilter = document.getElementById("regionFilter");
const typeFilter = document.getElementById("typeFilter");
const resourceFilter = document.getElementById("resourceFilter");
const keywordInput = document.getElementById("keywordInput");
const listContainer = document.getElementById("listContainer");
const stats = document.getElementById("stats");
const sectionTitle = document.getElementById("sectionTitle");
const lastSync = document.getElementById("lastSync");

function setOptions(select, options) {
  select.innerHTML = options.map(v => `<option value="${v}">${v}</option>`).join("");
}

function renderNav() {
  nav.innerHTML = sections.map(s => `<button class="${s===state.section?"active":""}" data-v="${s}">${s}</button>`).join("");
  nav.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      state.section = btn.dataset.v;
      render();
    };
  });
}

function syncBaidu() {
  const now = new Date().toLocaleString("zh-CN");
  state.lastSync = now;
  localStorage.setItem("lastSync", now);
  const injected = {
    id: `s-${Date.now()}`,
    name: "实时新增艺人",
    region: "广东",
    roleType: "综艺艺人",
    debut: "2024",
    company: "公开信息",
    representative: "新综艺示例",
    movies: [{ name: "示例网剧", year: 2024, platform: "优酷", role: "主演" }],
    stages: [{ name: "新春舞台", year: 2024, occasion: "晚会", songs: ["新歌首唱"] }],
    songs: [{ name: "新歌首唱", year: 2024, type: "合作歌曲", album: "新春合辑" }]
  };
  stars.unshift(injected);
  render();
}

function filteredStars() {
  return stars.filter(s => {
    const resourceHit = state.resourceType === "全部" ||
      (state.resourceType === "电视剧" && s.movies.length) ||
      (state.resourceType === "舞台" && s.stages.length) ||
      (state.resourceType === "音乐" && s.songs.length);

    const text = `${s.name} ${s.representative} ${s.movies.map(m=>m.name).join(" ")} ${s.songs.map(a=>a.name).join(" ")}`;

    return (state.region === "全部" || s.region === state.region)
      && (state.roleType === "全部" || s.roleType === state.roleType)
      && resourceHit
      && (!state.keyword || text.includes(state.keyword));
  });
}

function toHistory(name) {
  state.history = [name, ...state.history.filter(h => h !== name)].slice(0, 10);
  localStorage.setItem("history", JSON.stringify(state.history));
  renderSide();
}

function toggleFavorite(name) {
  if (state.favorites.includes(name)) {
    state.favorites = state.favorites.filter(x => x !== name);
  } else {
    state.favorites.unshift(name);
  }
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  renderSide();
}

function renderStats(items) {
  const movieCount = items.reduce((n, s) => n + s.movies.length, 0);
  const stageCount = items.reduce((n, s) => n + s.stages.length, 0);
  const songCount = items.reduce((n, s) => n + s.songs.length, 0);
  stats.innerHTML = [
    ["收录女明星", items.length],
    ["影视作品", movieCount],
    ["舞台记录", stageCount],
    ["音乐作品", songCount]
  ].map(([k,v]) => `<div class="stat"><strong>${v}</strong><div>${k}</div></div>`).join("");
}

function renderList(items) {
  if (state.section === "关于我们") {
    listContainer.innerHTML = `
      <div class="card"><h3>网站定位</h3><p>提供客观、结构化、可检索的女明星公开资源信息。</p></div>
      <div class="card"><h3>版权声明</h3><p>仅展示公开资料与官方跳转链接，不存储音视频文件。</p></div>
      <div class="card"><h3>联系方式</h3><p>support@example.com（示例）</p></div>`;
    return;
  }

  if (state.section === "最新更新") {
    const updates = stars.slice(0, 5).map(s => `<li>${s.name}：已更新影视/舞台/音乐资料</li>`).join("");
    listContainer.innerHTML = `<div class="card"><h3>最近一周更新</h3><ul>${updates}</ul></div>`;
    return;
  }

  listContainer.innerHTML = items.map(s => {
    const favorited = state.favorites.includes(s.name);
    return `
      <article class="card">
        <h3>${s.name}</h3>
        <div class="meta">地区：${s.region} ｜ 类型：${s.roleType} ｜ 出道：${s.debut} ｜ 公司：${s.company}</div>
        <div class="meta">代表作：${s.representative}</div>
        <div><strong>影视：</strong>${s.movies.map(m=>`${m.name}(${m.year},${m.platform},角色:${m.role})`).join("；")}</div>
        <div><strong>舞台：</strong>${s.stages.map(m=>`${m.name}(${m.year},${m.occasion})`).join("；")}</div>
        <div><strong>音乐：</strong>${s.songs.map(m=>`${m.name}(${m.year},${m.type})`).join("；")}</div>
        <div class="row-actions">
          <button data-view="${s.name}">查看详情</button>
          <button data-fav="${s.name}">${favorited ? "取消收藏" : "收藏"}</button>
        </div>
      </article>`;
  }).join("") || `<div class="card">暂无匹配数据</div>`;

  listContainer.querySelectorAll("button[data-view]").forEach(btn => {
    btn.onclick = () => toHistory(btn.dataset.view);
  });
  listContainer.querySelectorAll("button[data-fav]").forEach(btn => {
    btn.onclick = () => toggleFavorite(btn.dataset.fav);
  });
}

function renderSide() {
  document.getElementById("favorites").innerHTML = state.favorites.map(x => `<li>${x}</li>`).join("") || "<li>暂无收藏</li>";
  document.getElementById("history").innerHTML = state.history.map(x => `<li>${x}</li>`).join("") || "<li>暂无浏览记录</li>";
  document.getElementById("feedbackList").innerHTML = state.feedback.map(x => `<li>${x}</li>`).join("") || "<li>暂无反馈</li>";
}

function render() {
  sectionTitle.textContent = state.section;
  lastSync.textContent = `上次同步：${state.lastSync}`;
  renderNav();
  const items = filteredStars();
  renderStats(items);
  renderList(items);
  renderSide();
}

function init() {
  const regions = ["全部", ...new Set(stars.map(s => s.region))];
  const types = ["全部", ...new Set(stars.map(s => s.roleType))];
  const resources = ["全部", "电视剧", "舞台", "音乐"];
  setOptions(regionFilter, regions);
  setOptions(typeFilter, types);
  setOptions(resourceFilter, resources);

  regionFilter.onchange = () => { state.region = regionFilter.value; render(); };
  typeFilter.onchange = () => { state.roleType = typeFilter.value; render(); };
  resourceFilter.onchange = () => { state.resourceType = resourceFilter.value; render(); };
  keywordInput.oninput = () => { state.keyword = keywordInput.value.trim(); render(); };
  document.getElementById("syncBtn").onclick = syncBaidu;

  document.getElementById("feedbackBtn").onclick = () => {
    const t = document.getElementById("feedbackText");
    const v = t.value.trim();
    if (!v) return;
    state.feedback = [v, ...state.feedback].slice(0, 10);
    localStorage.setItem("feedback", JSON.stringify(state.feedback));
    t.value = "";
    renderSide();
  };

  render();
}

init();
