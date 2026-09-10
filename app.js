const state = { followers: new Set(), following: new Set(), extras: {}, files: {} };
const $ = (selector) => document.querySelector(selector);
const extraTypes = {
  blocked_profiles: ['blocked', 'Blocked accounts'], close_friends: ['closeFriends', 'Close friends'], following_hashtags: ['hashtags', 'Following hashtags'], hide_story_from: ['hiddenStories', 'Hide story from'], pending_follow_requests: ['pending', 'Pending follow requests'], recent_follow_requests: ['recentRequests', 'Recent follow requests'], recently_unfollowed_profiles: ['unfollowed', 'Recently unfollowed'], removed_suggestions: ['removedSuggestions', 'Removed suggestions'], restricted_profiles: ['restricted', 'Restricted accounts']
};

function normalize(value) { return String(value || '').trim().replace(/^@/, '').toLowerCase(); }
function parseAccounts(data, kind) {
  const entries = kind === 'following' ? data.relationships_following || data : data.relationships_followers || data;
  return new Set((Array.isArray(entries) ? entries : []).flatMap((entry) => {
    if (kind === 'following') return normalize(entry.title) ? [normalize(entry.title)] : [];
    return (entry.string_list_data || []).map((item) => normalize(item.value)).filter(Boolean);
  }));
}
function parseGeneric(data) {
  const values = [];
  const visit = (entry) => {
    if (!entry || typeof entry !== 'object') return;
    if (typeof entry.title === 'string') values.push(entry.title);
    if (typeof entry.value === 'string') values.push(entry.value);
    if (Array.isArray(entry.string_list_data)) entry.string_list_data.forEach(visit);
    Object.entries(entry).forEach(([key, value]) => { if (!['title', 'value', 'string_list_data'].includes(key) && value && typeof value === 'object') Array.isArray(value) ? value.forEach(visit) : visit(value); });
  };
  visit(data);
  return new Set(values.map(normalize).filter(Boolean));
}
function extraTypeFor(filename) {
  const key = filename.toLowerCase().split(/[\\/]/).pop().replace(/\.json$/, '').replace(/_\d+$/, '');
  return extraTypes[key];
}
async function readExtraFiles(files) {
  state.extras = {};
  let loaded = 0;
  for (const file of files) {
    const type = extraTypeFor(file.name);
    if (!type) continue;
    try {
      const values = parseGeneric(JSON.parse(await file.text()));
      state.extras[type[0]] = { label: type[1], values };
      loaded += 1;
    } catch { /* ignore unrelated or invalid JSON files */ }
  }
  $('#extraZone').classList.toggle('loaded', loaded > 0);
  $('#extraFile').textContent = loaded ? `${loaded} kategori berhasil dibaca` : 'Tidak ada kategori yang dikenali';
  updateImportState();
}
async function readFile(file, kind) {
  try {
    const data = JSON.parse(await file.text());
    const parsed = parseAccounts(data, kind);
    state[kind] = new Set([...state[kind], ...parsed]);
    state.files[kind] = file.name;
    const zone = $(`#${kind}Zone`);
    zone.classList.add('loaded');
    $(`#${kind}File`).textContent = `${file.name} · ${state[kind].size} akun`;
    updateImportState();
  } catch { $('#importStatus').textContent = `File ${file.name} tidak bisa dibaca sebagai JSON.`; }
}
async function readZip(file) {
  try {
    if (!window.JSZip) throw new Error('ZIP library belum siap');
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    const followersEntry = entries.find((entry) => /(^|\/)followers[^/]*\.json$/i.test(entry.name));
    const followingEntry = entries.find((entry) => /(^|\/)following\.json$/i.test(entry.name)) || entries.find((entry) => /(^|\/)following_\d+\.json$/i.test(entry.name));
    if (!followersEntry || !followingEntry) throw new Error('File followers/following tidak ditemukan');
    await readFile(new File([await followersEntry.async('blob')], followersEntry.name), 'followers');
    await readFile(new File([await followingEntry.async('blob')], followingEntry.name), 'following');
    const extraFiles = [];
    for (const entry of entries) if (extraTypeFor(entry.name)) extraFiles.push(new File([await entry.async('blob')], entry.name));
    if (extraFiles.length) await readExtraFiles(extraFiles);
    $('#zipZone').classList.add('loaded');
    $('#zipFile').textContent = `${file.name} · siap dianalisis`;
    $('#importStatus').textContent = 'ZIP berhasil dibaca. Data tidak diunggah ke server.';
  } catch (error) { $('#importStatus').textContent = `ZIP tidak bisa dibaca: ${error.message}.`; }
}
function updateImportState() {
  const ready = state.followers.size > 0 && state.following.size > 0;
  $('#analyzeButton').disabled = !ready;
  $('#importStatus').textContent = ready ? 'Data siap dianalisis.' : 'Pilih kedua file untuk memulai.';
}
function render() {
  const mutual = new Set([...state.following].filter((name) => state.followers.has(name)));
  const notBack = [...state.following].filter((name) => !state.followers.has(name));
  $('#followersCount').textContent = state.followers.size.toLocaleString('id-ID');
  $('#followingCount').textContent = state.following.size.toLocaleString('id-ID');
  $('#mutualCount').textContent = mutual.size.toLocaleString('id-ID');
  $('#notFollowingBackCount').textContent = notBack.length.toLocaleString('id-ID');
  $('#listCount').textContent = `${notBack.length} akun`;
  $('#legendMutual').textContent = mutual.size;
  $('#legendNonmutual').textContent = notBack.length;
  const percentage = state.following.size ? Math.round((mutual.size / state.following.size) * 100) : 0;
  $('#mutualPercent').textContent = `${percentage}%`;
  $('#ring').style.background = `conic-gradient(var(--lime) ${percentage * 3.6}deg, #53605a ${percentage * 3.6}deg)`;
  $('#insightCopy').textContent = notBack.length ? `${notBack.length} akun dari following kamu belum tercatat sebagai followers. Kamu bisa meninjau daftar ini satu per satu.` : 'Semua akun yang kamu ikuti juga tercatat mengikuti kamu.';
  $('#results').hidden = false;
  renderList(notBack);
  renderExtras();
}
function renderExtras() {
  const entries = Object.entries(state.extras);
  $('#extraGrid').innerHTML = entries.length ? entries.map(([key, item]) => `<button class="extra-card" data-extra="${key}"><span>${item.label}</span><strong>${item.values.size}</strong><small>lihat daftar →</small></button>`).join('') : '<div class="extra-empty">Upload JSON tambahan dari Instagram untuk melihat kategori lain di sini.</div>';
  $('#extraDetail').hidden = true;
  document.querySelectorAll('.extra-card').forEach((card) => card.addEventListener('click', () => showExtra(card.dataset.extra)));
}
function showExtra(key) {
  const item = state.extras[key];
  if (!item) return;
  $('#extraDetail').hidden = false;
  $('#extraDetailLabel').textContent = 'INSTAGRAM DATA';
  $('#extraDetailTitle').textContent = item.label;
  $('#extraDetailCount').textContent = `${item.values.size} item`;
  $('#extraList').innerHTML = [...item.values].sort((a, b) => a.localeCompare(b)).map((name) => `<div class="account-row"><a href="https://www.instagram.com/${encodeURIComponent(name.replace(/^#/, ''))}" target="_blank" rel="noreferrer">${name.startsWith('#') ? name : `@${name}`}</a><span>lihat ↗</span></div>`).join('');
}
function renderList(accounts) {
  const query = normalize($('#searchInput').value);
  const direction = $('#sortSelect').value === 'za' ? -1 : 1;
  const filtered = accounts.filter((name) => name.includes(query)).sort((a, b) => a.localeCompare(b) * direction);
  $('#accountList').innerHTML = filtered.map((name) => `<div class="account-row"><a href="https://www.instagram.com/${encodeURIComponent(name)}" target="_blank" rel="noreferrer">@${name}</a><span>lihat profil ↗</span></div>`).join('');
  $('#emptyState').hidden = filtered.length > 0;
}
document.querySelectorAll('input[type="file"]').forEach((input) => input.addEventListener('change', async (event) => { const files = [...event.target.files]; if (!files.length) return; if (input.dataset.kind === 'zip') await readZip(files[0]); else if (input.dataset.kind === 'extra') await readExtraFiles(files); else { state[input.dataset.kind] = new Set(); for (const file of files) await readFile(file, input.dataset.kind); } }));
$('#analyzeButton').addEventListener('click', render);
$('#searchInput').addEventListener('input', () => { const notBack = [...state.following].filter((name) => !state.followers.has(name)); renderList(notBack); });
$('#sortSelect').addEventListener('change', () => $('#searchInput').dispatchEvent(new Event('input')));
$('#resetButton').addEventListener('click', () => { state.followers.clear(); state.following.clear(); state.extras = {}; state.files = {}; document.querySelectorAll('input[type="file"]').forEach((input) => { input.value = ''; }); document.querySelectorAll('.dropzone,.zipzone,.extra-zone').forEach((zone) => zone.classList.remove('loaded')); $('#followersFile').textContent = 'Pilih followers_1.json'; $('#followingFile').textContent = 'Pilih following.json'; $('#zipFile').textContent = 'Pilih file ZIP ↗'; $('#extraFile').textContent = 'Pilih beberapa JSON ↗'; $('#results').hidden = true; updateImportState(); });