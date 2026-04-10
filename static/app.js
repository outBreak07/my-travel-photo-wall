// ============================================================
// China Photo Wall - app.js
// ============================================================

const PROVINCE_ADCODE = {
    '北京市':110000,'天津市':120000,'河北省':130000,'山西省':140000,
    '内蒙古自治区':150000,'辽宁省':210000,'吉林省':220000,'黑龙江省':230000,
    '上海市':310000,'江苏省':320000,'浙江省':330000,'安徽省':340000,
    '福建省':350000,'江西省':360000,'山东省':370000,'河南省':410000,
    '湖北省':420000,'湖南省':430000,'广东省':440000,'广西壮族自治区':450000,
    '海南省':460000,'重庆市':500000,'四川省':510000,'贵州省':520000,
    '云南省':530000,'西藏自治区':540000,'陕西省':610000,'甘肃省':620000,
    '青海省':630000,'宁夏回族自治区':640000,'新疆维吾尔自治区':650000,
    '台湾省':710000,'香港特别行政区':810000,'澳门特别行政区':820000,
    '北京':110000,'天津':120000,'上海':310000,'重庆':500000,
    '河北':130000,'山西':140000,'内蒙古':150000,'辽宁':210000,
    '吉林':220000,'黑龙江':230000,'江苏':320000,'浙江':330000,
    '安徽':340000,'福建':350000,'江西':360000,'山东':370000,
    '河南':410000,'湖北':420000,'湖南':430000,'广东':440000,
    '广西':450000,'海南':460000,'四川':510000,'贵州':520000,
    '云南':530000,'西藏':540000,'陕西':610000,'甘肃':620000,
    '青海':630000,'宁夏':640000,'新疆':650000,'台湾':710000,
    '香港':810000,'澳门':820000
};
const ADCODE_TO_PROVINCE = {};
for (const [name, code] of Object.entries(PROVINCE_ADCODE)) {
    if (name.length > 2) ADCODE_TO_PROVINCE[code] = name;
}
const PROVINCE_LIST = Object.keys(PROVINCE_ADCODE).filter(n => n.length > 2).sort();

const PROVINCE_CAPITAL = {
    '北京市':'北京市','天津市':'天津市','上海市':'上海市','重庆市':'重庆市',
    '河北省':'石家庄市','山西省':'太原市','内蒙古自治区':'呼和浩特市',
    '辽宁省':'沈阳市','吉林省':'长春市','黑龙江省':'哈尔滨市',
    '江苏省':'南京市','浙江省':'杭州市','安徽省':'合肥市',
    '福建省':'福州市','江西省':'南昌市','山东省':'济南市',
    '河南省':'郑州市','湖北省':'武汉市','湖南省':'长沙市',
    '广东省':'广州市','广西壮族自治区':'南宁市','海南省':'海口市',
    '四川省':'成都市','贵州省':'贵阳市','云南省':'昆明市',
    '西藏自治区':'拉萨市','陕西省':'西安市','甘肃省':'兰州市',
    '青海省':'西宁市','宁夏回族自治区':'银川市','新疆维吾尔自治区':'乌鲁木齐市',
    '台湾省':'台北市','香港特别行政区':'香港特别行政区','澳门特别行政区':'澳门特别行政区'
};

const PROVINCE_EN = {
    '北京':'Beijing','天津':'Tianjin','河北':'Hebei','山西':'Shanxi',
    '内蒙古':'Inner Mongolia','辽宁':'Liaoning','吉林':'Jilin','黑龙江':'Heilongjiang',
    '上海':'Shanghai','江苏':'Jiangsu','浙江':'Zhejiang','安徽':'Anhui',
    '福建':'Fujian','江西':'Jiangxi','山东':'Shandong','河南':'Henan',
    '湖北':'Hubei','湖南':'Hunan','广东':'Guangdong','广西':'Guangxi',
    '海南':'Hainan','重庆':'Chongqing','四川':'Sichuan','贵州':'Guizhou',
    '云南':'Yunnan','西藏':'Tibet','陕西':'Shaanxi','甘肃':'Gansu',
    '青海':'Qinghai','宁夏':'Ningxia','新疆':'Xinjiang','台湾':'Taiwan',
    '香港':'Hong Kong','澳门':'Macau',
    '北京市':'Beijing','天津市':'Tianjin','河北省':'Hebei','山西省':'Shanxi',
    '内蒙古自治区':'Inner Mongolia','辽宁省':'Liaoning','吉林省':'Jilin',
    '黑龙江省':'Heilongjiang','上海市':'Shanghai','江苏省':'Jiangsu',
    '浙江省':'Zhejiang','安徽省':'Anhui','福建省':'Fujian','江西省':'Jiangxi',
    '山东省':'Shandong','河南省':'Henan','湖北省':'Hubei','湖南省':'Hunan',
    '广东省':'Guangdong','广西壮族自治区':'Guangxi','海南省':'Hainan',
    '重庆市':'Chongqing','四川省':'Sichuan','贵州省':'Guizhou','云南省':'Yunnan',
    '西藏自治区':'Tibet','陕西省':'Shaanxi','甘肃省':'Gansu','青海省':'Qinghai',
    '宁夏回族自治区':'Ningxia','新疆维吾尔自治区':'Xinjiang','台湾省':'Taiwan',
    '香港特别行政区':'Hong Kong','澳门特别行政区':'Macau',
    '南海诸岛':'South China Sea Islands'
};

// ============================================================
// i18n
// ============================================================
const TRANSLATIONS = {
    zh: {
        // Header & nav
        all: '全部', photos: '照片', langSwitch: 'EN',
        // Upload
        upload: '+ 上传', uploadTitle: '上传照片',
        province: '省份', selectProvince: '选择省份...',
        city: '城市', selectProvinceFirst: '请先选择省份',
        description: '描述（可选）', descPlaceholder: '为照片添加描述...',
        images: '图片', cancel: '取消', uploadBtn: '上传', uploading: '上传中...',
        noPhotos: '暂无照片，快去上传吧！', zoomHint: '滚动缩放以探索城市',
        uploadFailed: '上传失败', selectProvinceAlert: '请选择省份',
        selectImagesAlert: '请选择图片', photo_s: '张照片',
        uploadSuccessN: '张照片上传成功', uncategorized: '未分类',
        defaultCapital: '默认上传到省会城市',
        // Photo actions
        editDesc: '编辑', save: '保存', saving: '保存中...', saved: '已保存',
        deleteBtn: '删除', deleteConfirm: '确定要删除这张照片吗？', deleted: '已删除',
        loading: '加载中...', loadFailed: '加载失败',
        // Auth
        login: '登录', logout: '退出', loginBtn: '登录',
        username: '用户名', password: '密码',
        loginSuccess: '登录成功', loginFailed: '登录失败',
        invalidCredentials: '账号或密码错误', loggedOut: '已退出登录',
        pleaseLogin: '请先登录',
        // User management
        manage: '管理', userManagement: '用户管理',
        thUsername: '用户名', thName: '名称', thRole: '角色', thCreated: '创建时间', thActions: '操作',
        nameOptional: '名称（可选）', addBtn: '添加',
        usernamePasswordRequired: '请填写用户名和密码',
        userAdded: '用户已添加', passwordResetDone: '密码已重置',
        deleteUserConfirm: '确定删除用户 ', userDeleted: '已删除',
        nameUpdated: '名称已更新',
        editNameTitle: '编辑名称', resetPasswordTitle: '重置密码',
        promptNewPassword: '请输入 {0} 的新密码:',
        promptDisplayName: '请输入 {0} 的显示名称（留空则显示账号名）:',
        // Comments
        comments: '评论', noComments: '暂无评论', commentPlaceholder: '写评论...',
        reply: '回复', replyTo: '回复 ', replyingTo: '回复', replyVerb: '回复',
        deleteCommentConfirm: '删除此评论？',
        showMoreReplies: '展开剩余 {0} 条回复',
        // Avatar
        avatarTitle: '选择头像', uploadCustomAvatar: '上传自定义',
        avatarChanged: '头像已更新', adminAvatarLocked: '管理员头像不可更改',
    },
    en: {
        // Header & nav
        all: 'All', photos: 'Photos', langSwitch: '中文',
        // Upload
        upload: '+ Upload', uploadTitle: 'Upload Photos',
        province: 'Province', selectProvince: 'Select province...',
        city: 'City', selectProvinceFirst: 'Select province first',
        description: 'Description (optional)', descPlaceholder: 'Add a description...',
        images: 'Images', cancel: 'Cancel', uploadBtn: 'Upload', uploading: 'Uploading...',
        noPhotos: 'No photos yet. Upload some!', zoomHint: 'Scroll to zoom in and explore cities',
        uploadFailed: 'Upload failed', selectProvinceAlert: 'Please select a province',
        selectImagesAlert: 'Please select images', photo_s: 'photo(s)',
        uploadSuccessN: ' photo(s) uploaded', uncategorized: 'Uncategorized',
        defaultCapital: 'Default to capital city',
        // Photo actions
        editDesc: 'Edit', save: 'Save', saving: 'Saving...', saved: 'Saved',
        deleteBtn: 'Delete', deleteConfirm: 'Are you sure you want to delete this photo?', deleted: 'Deleted',
        loading: 'Loading...', loadFailed: 'Load failed',
        // Auth
        login: 'Login', logout: 'Logout', loginBtn: 'Login',
        username: 'Username', password: 'Password',
        loginSuccess: 'Login successful', loginFailed: 'Login failed',
        invalidCredentials: 'Invalid credentials', loggedOut: 'Logged out',
        pleaseLogin: 'Please login first',
        // User management
        manage: 'Manage', userManagement: 'User Management',
        thUsername: 'Username', thName: 'Name', thRole: 'Role', thCreated: 'Created', thActions: 'Actions',
        nameOptional: 'Name (optional)', addBtn: 'Add',
        usernamePasswordRequired: 'Username and password required',
        userAdded: 'User added', passwordResetDone: 'Password reset',
        deleteUserConfirm: 'Delete user ', userDeleted: 'Deleted',
        nameUpdated: 'Name updated',
        editNameTitle: 'Edit name', resetPasswordTitle: 'Reset password',
        promptNewPassword: 'Enter new password for {0}:',
        promptDisplayName: 'Enter display name for {0} (leave empty to show account name):',
        // Comments
        comments: 'Comments', noComments: 'No comments yet', commentPlaceholder: 'Write a comment...',
        reply: 'Reply', replyTo: 'Reply to ', replyingTo: 'Replying to', replyVerb: 'reply',
        deleteCommentConfirm: 'Delete this comment?',
        showMoreReplies: 'Show {0} more replies',
        // Avatar
        avatarTitle: 'Choose Avatar', uploadCustomAvatar: 'Upload Custom',
        avatarChanged: 'Avatar updated', adminAvatarLocked: 'Admin avatar cannot be changed',
    }
};
const LANG_KEYS = Object.keys(TRANSLATIONS);
let currentLang = localStorage.getItem('photowall-lang') || 'zh';
function t(key, ...args) {
    let s = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || key;
    args.forEach((v, i) => { s = s.replace('{' + i + '}', v); });
    return s;
}
function toggleLang() {
    const idx = LANG_KEYS.indexOf(currentLang);
    currentLang = LANG_KEYS[(idx + 1) % LANG_KEYS.length];
    localStorage.setItem('photowall-lang', currentLang);
    updateAllText();
}
let appTitle = '';
let appVersion = '';
function updateTitle() {
    const title = appTitle || 'Photo Wall';
    const full = appVersion ? title + ' v' + appVersion : title;
    document.getElementById('title').textContent = full;
    document.title = full;
}
function updateAllText() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.getAttribute('data-i18n')));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t(el.getAttribute('data-i18n-placeholder')));
    document.getElementById('lang-toggle').textContent = t('langSwitch');
    updateTitle(); updateAuthUI(); updateBreadcrumb(); updateThemeDotTitles();
    if (chart) chart.setOption({ series: [{ label: { formatter: p => currentLang === 'en' ? (PROVINCE_EN[p.name] || p.name) : p.name } }] });
    loadPhotosPanel(currentProvince || undefined, currentCity || undefined);
}

// ============================================================
// Themes
// ============================================================
const THEMES = { light:{en:'Light',zh:'明亮'}, dark:{en:'Dark',zh:'暗黑'}, mocha:{en:'Mocha',zh:'摩卡'}, nord:{en:'Nord',zh:'极光'}, berry:{en:'Berry',zh:'莓果'} };
let currentThemeName = localStorage.getItem('photowall-theme') || 'light';
function setTheme(name) {
    currentThemeName = name; localStorage.setItem('photowall-theme', name);
    document.documentElement.setAttribute('data-theme', name); updateThemeDots();
    if (chart) { const cs = getComputedStyle(document.documentElement); chart.setOption({ series: [{ label:{color:cs.getPropertyValue('--map-label').trim()}, itemStyle:{areaColor:cs.getPropertyValue('--map-area').trim(),borderColor:cs.getPropertyValue('--map-border').trim()}, emphasis:{itemStyle:{areaColor:cs.getPropertyValue('--map-hover').trim()}}, data:buildProvinceMapData() }] }); scheduleOverlay(); }
}
function updateThemeDots() { document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.getAttribute('data-theme-id') === currentThemeName)); }
function updateThemeDotTitles() { document.querySelectorAll('.theme-dot').forEach(d => { const id=d.getAttribute('data-theme-id'); if(THEMES[id]) d.title=THEMES[id][currentLang]; }); }

// ============================================================
// Auth
// ============================================================
let isLoggedIn = false;
let userRole = '';
let loggedInUsername = '';
let loggedInAvatar = '';
let authEnabled = true;
let authSession = localStorage.getItem('photowall-session') || '';
let API = ''; // API base URL, empty = same origin

function isAdmin() { return userRole === 'admin'; }

async function loadConfig() {
    try {
        const resp = await fetch('/api/config');
        const cfg = await resp.json();
        if (cfg.apiBaseUrl) API = cfg.apiBaseUrl;
        if (cfg.title) appTitle = cfg.title;
        if (cfg.version) appVersion = cfg.version;
        updateTitle();
    } catch (e) {}
}

function api(path) { return API + path; }

async function checkAuth() {
    try {
        const resp = await fetch(api('/api/auth/check'), { headers: authSession ? { 'Authorization': 'Bearer ' + authSession } : {} });
        const data = await resp.json();
        authEnabled = data.authEnabled;
        isLoggedIn = data.loggedIn;
        userRole = data.role || '';
        loggedInUsername = data.username || '';
        loggedInAvatar = data.avatar || '';
    } catch (e) { isLoggedIn = false; userRole = ''; loggedInUsername = ''; loggedInAvatar = ''; }
    updateAuthUI();
}

function updateAuthUI() {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isLoggedIn ? '' : 'none');
    const loginBtn = document.getElementById('auth-btn');
    const usersBtn = document.getElementById('users-btn');
    if (!authEnabled) {
        loginBtn.style.display = 'none';
        if (usersBtn) usersBtn.style.display = 'none';
    } else {
        loginBtn.style.display = '';
        loginBtn.textContent = isLoggedIn ? t('logout') : t('login');
        if (usersBtn) { usersBtn.style.display = isAdmin() ? '' : 'none'; usersBtn.textContent = t('manage'); }
    }
    const avatarBtn = document.getElementById('avatar-btn');
    if (avatarBtn) {
        avatarBtn.style.display = isLoggedIn ? '' : 'none';
        if (isLoggedIn && loggedInAvatar) avatarBtn.src = loggedInAvatar;
    }
    scheduleOverlay();
    loadPhotosPanel(currentProvince || undefined, currentCity || undefined);
}

function onAuthBtnClick() {
    if (isLoggedIn) {
        authSession = ''; localStorage.removeItem('photowall-session');
        isLoggedIn = false; userRole = ''; loggedInUsername = ''; loggedInAvatar = '';
        updateAuthUI();
        showToast(t('loggedOut'));
    } else {
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('login-username').focus();
    }
}

function hideLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

async function doLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) return;
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    try {
        const resp = await fetch(api('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (data.session) {
            authSession = data.session;
            localStorage.setItem('photowall-session', authSession);
            isLoggedIn = true;
            userRole = data.role || 'user';
            loggedInUsername = username;
            hideLoginModal();
            updateAuthUI();
            showToast(t('loginSuccess'));
        } else {
            showToast(t('invalidCredentials'));
        }
    } catch (e) {
        showToast(t('loginFailed'));
    }
    btn.disabled = false;
}

function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (authSession) h['Authorization'] = 'Bearer ' + authSession;
    return h;
}

function authUploadHeaders() {
    if (authSession) return { 'Authorization': 'Bearer ' + authSession };
    return {};
}

// ---- User management ----
function showUsersModal() {
    document.getElementById('users-modal').style.display = 'flex';
    document.getElementById('users-modal-title').textContent = t('userManagement');
    loadUsersList();
}
function hideUsersModal() { document.getElementById('users-modal').style.display = 'none'; }

async function loadUsersList() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">Loading...</td></tr>`;
    try {
        const resp = await fetch(api('/api/admin/users'), { headers: authHeaders() });
        const users = await resp.json();
        if (users.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">No users</td></tr>`; return; }
        tbody.innerHTML = users.map(u => {
            const uname = escapeHTML(u.username);
            const displayName = escapeHTML(u.name || '');
            return `<tr>
                <td><b>${uname}</b></td>
                <td class="user-name-cell"><span class="user-name-text">${displayName || '<span style="color:var(--text-muted)">-</span>'}</span> <button class="user-action-btn user-name-edit" onclick="promptEditName('${uname}', '${displayName}')" title="${t('editNameTitle')}"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>
                <td><span class="user-role-tag">${u.role}</span></td>
                <td class="user-date">${u.createdAt}</td>
                <td class="user-actions">
                    <button class="user-action-btn" onclick="promptResetPassword('${uname}')" title="${t('resetPasswordTitle')}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                    <button class="user-action-btn user-action-danger" onclick="deleteUser('${uname}')" title="${t('deleteBtn')}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) { tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger);padding:20px">Failed to load</td></tr>`; }
}

async function addUser() {
    const u = document.getElementById('new-username').value.trim();
    const n = document.getElementById('new-name').value.trim();
    const p = document.getElementById('new-password').value;
    const r = document.getElementById('new-role').value;
    if (!u || !p) { showToast(t('usernamePasswordRequired')); return; }
    try {
        const resp = await fetch(api('/api/admin/users/add'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username: u, password: p, role: r, name: n }) });
        if (resp.ok) { document.getElementById('new-username').value = ''; document.getElementById('new-name').value = ''; document.getElementById('new-password').value = ''; showToast(t('userAdded')); loadUsersList(); }
        else { const d = await resp.json(); showToast(d.error || 'Failed'); }
    } catch (e) { showToast('Failed'); }
}

function promptResetPassword(username) {
    const newPwd = prompt(t('promptNewPassword', username));
    if (!newPwd) return;
    resetPassword(username, newPwd);
}

async function resetPassword(username, newPassword) {
    try {
        const resp = await fetch(api('/api/admin/users/reset-password'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username, newPassword }) });
        if (resp.ok) { showToast(t('passwordResetDone')); }
        else { const d = await resp.json(); showToast(d.error || 'Failed'); }
    } catch (e) { showToast('Failed'); }
}

async function deleteUser(username) {
    if (!confirm(t('deleteUserConfirm') + username + '?')) return;
    try {
        const resp = await fetch(api('/api/admin/users/delete'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username }) });
        if (resp.ok) { showToast(t('userDeleted')); loadUsersList(); }
        else { const d = await resp.json(); showToast(d.error || 'Failed'); }
    } catch (e) { showToast('Failed'); }
}

function promptEditName(username, currentName) {
    const newName = prompt(t('promptDisplayName', username), currentName);
    if (newName === null) return;
    updateUserName(username, newName.trim());
}

async function updateUserName(username, name) {
    try {
        const resp = await fetch(api('/api/admin/users/update-name'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username, name }) });
        if (resp.ok) { showToast(t('nameUpdated')); loadUsersList(); }
        else { const d = await resp.json(); showToast(d.error || 'Failed'); }
    } catch (e) { showToast('Failed'); }
}

// ============================================================
// Avatar picker
// ============================================================

async function showAvatarPicker() {
    if (isAdmin()) { showToast(t('adminAvatarLocked')); return; }
    document.getElementById('avatar-modal').style.display = 'flex';
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';
    try {
        const resp = await fetch(api('/api/avatars'));
        const data = await resp.json();
        data.defaults.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'avatar-option' + (url === loggedInAvatar ? ' active' : '');
            img.onclick = () => selectAvatar(url);
            grid.appendChild(img);
        });
    } catch (e) {}
}

function hideAvatarPicker() { document.getElementById('avatar-modal').style.display = 'none'; }

async function selectAvatar(url) {
    try {
        const resp = await fetch(api('/api/avatar/set'), {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ avatar: url })
        });
        if (resp.ok) {
            loggedInAvatar = url;
            document.getElementById('avatar-btn').src = url;
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.toggle('active', el.src.endsWith(url)));
            showToast(t('avatarChanged'));
        }
    } catch (e) {}
}

async function uploadAvatar(input) {
    if (!input.files || !input.files[0]) return;
    if (isAdmin()) { showToast(t('adminAvatarLocked')); return; }
    const form = new FormData();
    form.append('file', input.files[0]);
    try {
        const resp = await fetch(api('/api/avatar/upload'), {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + authSession },
            body: form
        });
        if (resp.ok) {
            const data = await resp.json();
            loggedInAvatar = data.avatar;
            document.getElementById('avatar-btn').src = data.avatar;
            showToast(t('avatarChanged'));
            hideAvatarPicker();
        }
    } catch (e) {}
    input.value = '';
}

// ============================================================
// State
// ============================================================
const geoCache = {};
let chart = null, currentProvince = null, currentCity = null, currentZoom = 1.2;
let provinceCenters = {}, loadedCityCenters = {};
let allPhotos = [], provincePhotoURLs = {}, cityPhotoURLs = {}, provincePhotoCounts = {}, cityPhotoCounts = {};
const CITY_ZOOM_THRESHOLD = 3.2;
let overlayRAF = null, wasShowingCities = false;
let currentPreviewPhoto = null, panelPhotos = [], currentPreviewIndex = -1;
let viewerZoom = 1, viewerRotation = 0, viewerFullscreen = false;

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.setAttribute('data-theme', currentThemeName); updateThemeDots();
    chart = echarts.init(document.getElementById('map'));
    window.addEventListener('resize', () => { chart.resize(); scheduleOverlay(); });
    // Keyboard navigation
    document.addEventListener('keydown', onKeyDown);
    await loadConfig(); await checkAuth();
    await loadChinaMap(); await loadAllPhotos();
    initUploadForm(); scheduleOverlay(); loadPhotosPanel(); updateAllText();
    preloadAllCityCenters();
});

function onKeyDown(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('preview-modal').style.display === 'flex') { hidePreviewModal(); e.preventDefault(); return; }
        if (document.getElementById('upload-modal').style.display === 'flex') { hideUploadModal(); e.preventDefault(); return; }
        if (document.getElementById('users-modal') && document.getElementById('users-modal').style.display === 'flex') { hideUsersModal(); e.preventDefault(); return; }
        if (document.getElementById('login-modal').style.display === 'flex') { hideLoginModal(); e.preventDefault(); return; }
    }
    // Photo navigation only in preview modal, not when typing
    const preview = document.getElementById('preview-modal');
    if (preview.style.display !== 'flex') return;
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft') { navigatePhoto(-1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { navigatePhoto(1); e.preventDefault(); }
}

// ============================================================
// GeoJSON
// ============================================================
async function fetchGeoJSON(url) { if(geoCache[url]) return geoCache[url]; const r=await fetch(url); if(!r.ok) throw new Error('fail'); const d=await r.json(); geoCache[url]=d; return d; }
function extractCenters(geoData) { const c={}; for(const f of geoData.features){const n=f.properties.name,pt=f.properties.center||f.properties.cp||f.properties.centroid; if(n&&pt) c[n]=pt;} return c; }

async function preloadAllCityCenters() {
    const entries = Object.entries(PROVINCE_ADCODE).filter(([n])=>n.length>2);
    for (let i=0;i<entries.length;i+=4) {
        const batch=entries.slice(i,i+4);
        await Promise.all(batch.map(async([name,adcode])=>{ if(loadedCityCenters[name]) return; try{ const geo=await fetchGeoJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`); loadedCityCenters[name]=extractCenters(geo); }catch(e){} }));
        if(i+4<entries.length) await new Promise(r=>setTimeout(r,80));
    }
    scheduleOverlay();
}

// ============================================================
// Photo data & fuzzy matching
// ============================================================
async function loadAllPhotos() { try{ const r=await fetch(api('/api/photos')); allPhotos=await r.json(); }catch(e){allPhotos=[];} rebuildPhotoIndex(); }

function rebuildPhotoIndex() {
    provincePhotoURLs={}; cityPhotoURLs={}; provincePhotoCounts={}; cityPhotoCounts={};
    for(const p of allPhotos) {
        if(!provincePhotoURLs[p.province]) provincePhotoURLs[p.province]=[];
        if(provincePhotoURLs[p.province].length<5) provincePhotoURLs[p.province].push(p.url);
        provincePhotoCounts[p.province]=(provincePhotoCounts[p.province]||0)+1;
        if(p.city){ const k=p.province+'/'+p.city; if(!cityPhotoURLs[k]) cityPhotoURLs[k]=[]; if(cityPhotoURLs[k].length<5) cityPhotoURLs[k].push(p.url); cityPhotoCounts[k]=(cityPhotoCounts[k]||0)+1; }
    }
}

function lookupCityPhotos(province, cityName) {
    const k1=province+'/'+cityName;
    if(cityPhotoURLs[k1]) return {urls:cityPhotoURLs[k1],count:cityPhotoCounts[k1]||0};
    const k2=province+'/'+cityName+'市';
    if(cityPhotoURLs[k2]) return {urls:cityPhotoURLs[k2],count:cityPhotoCounts[k2]||0};
    if(cityName.endsWith('市')){const k3=province+'/'+cityName.slice(0,-1); if(cityPhotoURLs[k3]) return {urls:cityPhotoURLs[k3],count:cityPhotoCounts[k3]||0};}
    return {urls:[],count:0};
}

function resolveCapitalGeoName(province) {
    const capital=PROVINCE_CAPITAL[province]; if(!capital) return '';
    const cities=loadedCityCenters[province]; if(!cities) return capital;
    if(cities[capital]) return capital;
    const base=capital.replace(/[市区]$/,'');
    for(const g of Object.keys(cities)) if(g.replace(/[市区]$/,'')=== base) return g;
    return capital;
}

function matchProvinceName(full, short) { if(full===short) return true; const bare=full.replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区/g,''); return bare===short||short.startsWith(bare)||full.startsWith(short); }
function findProvinceFullName(name) { const a=PROVINCE_ADCODE[name]; if(a&&ADCODE_TO_PROVINCE[a]) return ADCODE_TO_PROVINCE[a]; for(const p of Object.keys(provincePhotoCounts)) if(matchProvinceName(p,name)) return p; for(const p of PROVINCE_LIST) if(matchProvinceName(p,name)) return p; return name; }

// ============================================================
// China map
// ============================================================
async function loadChinaMap() {
    const geoData = await fetchGeoJSON('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    echarts.registerMap('china', geoData); provinceCenters = extractCenters(geoData);
    currentProvince=null; currentCity=null; currentZoom=1.2; updateBreadcrumb(); updateZoomHint();
    const cs = getComputedStyle(document.documentElement);
    chart.setOption({
        tooltip: { trigger:'item', backgroundColor:'rgba(34,39,56,0.95)', borderColor:'#3a4160', textStyle:{color:'#eaecf0',fontSize:12},
            formatter: p => { const fn=findProvinceFullName(p.name),c=provincePhotoCounts[fn]||0,dn=currentLang==='en'?(PROVINCE_EN[p.name]||p.name):p.name; return `<b>${dn}</b><br/>${c} ${t('photo_s')}`; }
        },
        series: [{ type:'map', map:'china', roam:true, zoom:1.2, scaleLimit:{min:0.8,max:80}, selectedMode:false,
            label: { show:true, fontSize:10, color:cs.getPropertyValue('--map-label').trim(), formatter:p=>currentLang==='en'?(PROVINCE_EN[p.name]||p.name):p.name },
            itemStyle: { areaColor:cs.getPropertyValue('--map-area').trim(), borderColor:cs.getPropertyValue('--map-border').trim(), borderWidth:0.8 },
            emphasis: { label:{color:'#eaecf0',fontSize:12,fontWeight:600}, itemStyle:{areaColor:cs.getPropertyValue('--map-hover').trim()} },
            data: buildProvinceMapData()
        }]
    }, true);
    chart.off('georoam'); chart.on('georoam', onGeoRoam);
    chart.off('click'); chart.on('click', params => {
        if (params.seriesType==='map') {
            const fn=findProvinceFullName(params.name);
            currentProvince=fn; currentCity=null;
            updateBreadcrumb(); loadPhotosPanel(fn);
            // Open upload modal for logged-in users
            if (isLoggedIn) showUploadModal();
        }
    });
}

function buildProvinceMapData() {
    const cs=getComputedStyle(document.documentElement), baseColor=cs.getPropertyValue('--map-area').trim(), data=[], added=new Set();
    for(const prov of Object.keys(provincePhotoCounts)) {
        const count=provincePhotoCounts[prov], color=getHeatColor(count,baseColor), entry={value:count,itemStyle:{areaColor:color}};
        if(!added.has(prov)){data.push({...entry,name:prov});added.add(prov);}
        const bare=prov.replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区/g,'');
        if(bare&&bare!==prov&&!added.has(bare)){data.push({...entry,name:bare});added.add(bare);}
    }
    return data;
}
function getHeatColor(count,base){if(count<=0)return base||'#e8ecf2';return adjustBrightness(base,count<=3?0.06:count<=10?0.12:count<=30?0.18:0.25);}
function adjustBrightness(hex,amount){if(!hex||hex.length<4)return hex;hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];const r=Math.min(255,parseInt(hex.substr(0,2),16)+Math.round(amount*255)),g=Math.min(255,parseInt(hex.substr(2,2),16)+Math.round(amount*255)),b=Math.min(255,parseInt(hex.substr(4,2),16)+Math.round(amount*255));return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}

// ============================================================
// Zoom & overlay
// ============================================================
function onGeoRoam(params){if(params.zoom)currentZoom*=params.zoom;updateZoomHint();scheduleOverlay();}
function updateZoomHint(){const h=document.getElementById('zoom-hint');if(h)h.style.opacity=currentZoom>CITY_ZOOM_THRESHOLD?'0':'1';}
function getVisibleProvinces(){const m=document.getElementById('map'),w=m.clientWidth,h=m.clientHeight,v=[];for(const[n,c]of Object.entries(provinceCenters)){const px=safeConvertToPixel(c);if(px&&px[0]>=-200&&px[0]<=w+200&&px[1]>=-200&&px[1]<=h+200)v.push(n);}return v;}
function scheduleOverlay(){if(overlayRAF)cancelAnimationFrame(overlayRAF);overlayRAF=requestAnimationFrame(updateOverlay);}

function updateOverlay() {
    const overlay=document.getElementById('photo-overlay'); if(!overlay||!chart) return;
    const showCities=currentZoom>CITY_ZOOM_THRESHOLD;
    if(showCities&&!wasShowingCities){overlay.classList.add('city-fade-in');setTimeout(()=>overlay.classList.remove('city-fade-in'),500);}
    wasShowingCities=showCities;
    const parts=[];
    if(showCities){
        const visibleProvs=getVisibleProvinces(), rendered=[], MIN_DIST=Math.max(30,120/Math.sqrt(currentZoom));
        for(const provName of visibleProvs){
            const fullName=findProvinceFullName(provName), cities=loadedCityCenters[fullName]; if(!cities)continue;
            const names=new Set();
            const capitalName=PROVINCE_CAPITAL[fullName]||'';
            const capitalBase=capitalName.replace(/[市区]$/,'');
            let capitalMatched=false; // track if capital photos were shown via a GeoJSON city
            for(const[cityName,center]of Object.entries(cities)){
                if(names.has(cityName))continue; names.add(cityName);
                const px=safeConvertToPixel(center); if(!px)continue;
                const{urls,count}=lookupCityPhotos(fullName,cityName);
                const isCapital=cityName===capitalName||cityName.replace(/[市区]$/,'')===capitalBase;
                if(urls.length>0){
                    if(isCapital) capitalMatched=true;
                    rendered.push({x:px[0],y:px[1]});
                    parts.push(buildClusterHTML(px,urls,cityName,count,fullName,cityName));
                } else {
                    if(isCapital) continue;
                    let skip=false; for(const r of rendered){const dx=px[0]-r.x,dy=px[1]-r.y;if(dx*dx+dy*dy<MIN_DIST*MIN_DIST){skip=true;break;}}
                    if(!skip){rendered.push({x:px[0],y:px[1]});parts.push(buildCityMarkerHTML(px,cityName,fullName));}
                }
            }
            // For municipalities or when capital photos weren't matched by any GeoJSON city name,
            // show them at the province center (e.g. 北京市 photos stored as city="北京市" but GeoJSON only has districts)
            if(!capitalMatched && capitalName){
                const capData=lookupCityPhotos(fullName,capitalName);
                if(capData.urls.length>0){
                    const provCenter=provinceCenters[provName];
                    if(provCenter){const px=safeConvertToPixel(provCenter);if(px){rendered.push({x:px[0],y:px[1]});parts.push(buildClusterHTML(px,capData.urls,capitalName,capData.count,fullName,capitalName));}}
                }
            }
        }
    } else {
        for(const[provName,center]of Object.entries(provinceCenters)){
            const fullName=findProvinceFullName(provName),urls=provincePhotoURLs[fullName]; if(!urls||urls.length===0)continue;
            const px=safeConvertToPixel(center); if(!px)continue;
            parts.push(buildClusterHTML(px,urls,provName,provincePhotoCounts[fullName]||0,fullName,''));
        }
    }
    overlay.innerHTML=parts.join('');
}

function safeConvertToPixel(coord){try{const px=chart.convertToPixel({seriesIndex:0},coord);if(!px||isNaN(px[0])||isNaN(px[1]))return null;const el=document.getElementById('map');if(px[0]<-80||px[0]>el.clientWidth+80||px[1]<-80||px[1]>el.clientHeight+80)return null;return px;}catch(e){return null;}}

function buildClusterHTML(pixel, urls, label, totalCount, province, city) {
    const imgs=urls.map(u=>`<img src="${u}" loading="lazy">`).join('');
    const badge=totalCount>urls.length?`<span class="cluster-badge">+${totalCount-urls.length}</span>`:'';
    const prov=province.replace(/'/g,"\\'"), ct=(city||'').replace(/'/g,"\\'");
    const addBtn=isLoggedIn?`<button class="cluster-add-btn" onclick="event.stopPropagation();onUploadClick('${prov}','${ct}')" title="${t('upload')}">+</button>`:'';
    return `<div class="map-photo-cluster" style="left:${pixel[0]}px;top:${pixel[1]}px">
        <div class="cluster-photos" onclick="onClusterPhotoClick('${prov}','${ct}')">${imgs}</div>
        ${addBtn}
        <div class="cluster-label" onclick="onClusterClick('${prov}','${ct}')">${label}${badge}</div>
    </div>`;
}

function buildCityMarkerHTML(pixel, cityName, province) {
    const prov=province.replace(/'/g,"\\'"), ct=cityName.replace(/'/g,"\\'");
    return `<div class="city-marker" style="left:${pixel[0]}px;top:${pixel[1]}px" onclick="onUploadClick('${prov}','${ct}')">
        <div class="city-marker-dot"></div>
        <div class="city-marker-name">${cityName}</div>
    </div>`;
}

function onClusterPhotoClick(province, city) {
    currentProvince=province||null; currentCity=city||null;
    updateBreadcrumb();
    loadPhotosPanel(province||undefined, city||undefined).then(()=>{
        if(panelPhotos.length>0) previewPhoto(panelPhotos[0]);
    });
}

function onClusterClick(province, city) {
    currentProvince=province||null; currentCity=city||null;
    updateBreadcrumb(); loadPhotosPanel(province||undefined, city||undefined);
}

function onUploadClick(province, city) {
    if (!isLoggedIn) {
        showToast(t('pleaseLogin'));
        return;
    }
    currentProvince=province||null; currentCity=city||null;
    showUploadModal();
}

// ============================================================
// Navigation
// ============================================================
function goHome(){currentProvince=null;currentCity=null;currentZoom=1.2;updateBreadcrumb();chart.setOption({series:[{zoom:1.2,center:undefined}]});scheduleOverlay();loadPhotosPanel();}

function updateBreadcrumb() {
    const navProv=document.getElementById('nav-province'),navCity=document.getElementById('nav-city'),navHome=document.getElementById('nav-home');
    navHome.textContent=t('all'); navHome.className='nav-link'+(!currentProvince?' active':'');
    if(currentProvince){navProv.style.display='inline';navProv.textContent=currentProvince;navProv.className='nav-link'+(!currentCity?' active':'');navProv.onclick=()=>{currentCity=null;updateBreadcrumb();loadPhotosPanel(currentProvince);};}else{navProv.style.display='none';}
    if(currentCity){navCity.style.display='inline';navCity.textContent=currentCity;navCity.className='nav-link active';}else{navCity.style.display='none';}
    const title=document.getElementById('photo-title');
    if(currentCity)title.textContent=currentCity; else if(currentProvince)title.textContent=currentProvince; else title.textContent=t('photos');
}

// ============================================================
// Right panel
// ============================================================
async function loadPhotosPanel(province, city) {
    const grid=document.getElementById('photo-grid'),empty=document.getElementById('photo-empty');
    let url=api('/api/photos'); const params=[];
    if(province)params.push('province='+encodeURIComponent(province));
    if(city)params.push('city='+encodeURIComponent(city));
    if(params.length)url+='?'+params.join('&');
    try{
        const resp=await fetch(url); const photos=await resp.json();
        panelPhotos=photos; // store for navigation
        if(photos.length===0){grid.style.display='none';empty.style.display='flex';return;}
        grid.style.display='grid'; empty.style.display='none';
        // Determine whether to show location on cards
        const showLoc = !province; // only show location when viewing all photos
        if(province&&!city){
            const groups={};
            for(const p of photos){const k=p.city||'_prov';if(!groups[k])groups[k]=[];groups[k].push(p);}
            let html='';
            if(groups['_prov']){html+=`<div class="city-group">${t('uncategorized')} (${groups['_prov'].length})</div>`;for(const p of groups['_prov'])html+=photoCardHTML(p,showLoc);}
            for(const[cn,cp]of Object.entries(groups)){if(cn==='_prov')continue;html+=`<div class="city-group">${cn} (${cp.length})</div>`;for(const p of cp)html+=photoCardHTML(p,showLoc);}
            grid.innerHTML=html;
        } else {
            grid.innerHTML=photos.map(p=>photoCardHTML(p,showLoc)).join('');
        }
    }catch(e){grid.style.display='none';empty.style.display='flex';}
}

function photoCardHTML(photo, showLocation) {
    const loc=photo.city||photo.province||'';
    const desc=photo.description||'';
    const uploader=photo.uploadedBy||'';
    const dataStr=encodeURIComponent(JSON.stringify(photo));
    let ov=''; if(desc) ov=`<div class="photo-desc">${escapeHTML(desc)}</div>`;
    const locHtml = showLocation ? `<div class="photo-location">${escapeHTML(loc)}</div>` : '';
    const uploaderHtml = uploader ? `<div class="photo-uploader">${escapeHTML(uploader)}</div>` : '';
    const takenHtml = photo.takenAt ? `<div class="photo-taken">${escapeHTML(photo.takenAt.substring(0,10))}</div>` : '';
    const editBtn = isLoggedIn ? `<button class="photo-edit-btn" onclick="event.stopPropagation(); previewPhotoFromAttr(this.parentElement)">${t('editDesc')}</button>` : '';
    return `<div class="photo-card" onclick="previewPhotoFromAttr(this)" data-photo="${dataStr}">
        <img src="${photo.url}" loading="lazy" alt="${escapeHTML(loc)}">
        ${locHtml}
        ${takenHtml}
        ${uploaderHtml}
        ${editBtn}
        ${ov}
    </div>`;
}

function previewPhotoFromAttr(el){previewPhoto(JSON.parse(decodeURIComponent(el.getAttribute('data-photo'))));}

// ============================================================
// Toast
// ============================================================
function showToast(msg,duration){duration=duration||2500;const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),duration);}
function escapeHTML(str){return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

function formatFileSize(bytes){
    if(bytes<1024) return bytes+' B';
    if(bytes<1048576) return (bytes/1024).toFixed(1)+' KB';
    return (bytes/1048576).toFixed(1)+' MB';
}

// ============================================================
// Preview, navigation, edit, delete
// ============================================================
function previewPhoto(photo) {
    currentPreviewPhoto=photo;
    currentPreviewIndex=panelPhotos.findIndex(p=>p.url===photo.url&&p.filename===photo.filename);
    // Reset viewer transforms
    viewerZoom=1; viewerRotation=0; applyViewerTransform();
    document.getElementById('preview-img').src=photo.url;
    const locParts=[photo.province,photo.city].filter(Boolean).join(' / ');
    const uploaderTag=photo.uploadedBy?` \u00b7 ${photo.uploadedBy}`:'';
    document.getElementById('preview-location').textContent=locParts+uploaderTag;
    // Photo metadata
    const metaParts=[];
    if(photo.takenAt) metaParts.push(photo.takenAt);
    if(photo.camera) metaParts.push(photo.camera);
    if(photo.width&&photo.height) metaParts.push(photo.width+'x'+photo.height);
    if(photo.fileSize) metaParts.push(formatFileSize(photo.fileSize));
    document.getElementById('preview-meta').textContent=metaParts.join('  |  ');
    document.getElementById('preview-desc').value=photo.description||'';
    document.getElementById('preview-save-btn').textContent=t('save');
    document.getElementById('preview-save-btn').disabled=false;
    document.getElementById('preview-delete-btn').textContent=t('deleteBtn');
    document.getElementById('preview-delete-btn').disabled=false;
    // Show/hide edit controls based on login; info panel always visible (for comments)
    document.getElementById('preview-edit-area').style.display=isLoggedIn?'':'none';
    document.querySelectorAll('.admin-edit-only').forEach(el=>el.style.display=isLoggedIn?'':'none');
    document.getElementById('comment-input-area').style.display=isLoggedIn?'':'none';
    // Load comments
    loadComments(photo.url);
    document.getElementById('preview-prev').style.display=panelPhotos.length>1?'flex':'none';
    document.getElementById('preview-next').style.display=panelPhotos.length>1?'flex':'none';
    // City selector
    const sel=document.getElementById('preview-city');
    sel.innerHTML=`<option value="">${t('loading')}</option>`; sel.value='';
    document.getElementById('preview-modal').style.display='flex';
    const adcode=PROVINCE_ADCODE[photo.province];
    if(adcode){
        fetchGeoJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`).then(geo=>{
            sel.innerHTML='';
            const cities=geo.features.map(f=>f.properties.name).sort();
            for(const c of cities){const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);}
            if(photo.city){sel.value=photo.city;if(!sel.value){const base=photo.city.replace(/市$/,'');for(const o of sel.options)if(o.value.replace(/市$/,'')=== base){sel.value=o.value;break;}}}
        }).catch(()=>{sel.innerHTML=`<option value="${escapeHTML(photo.city||'')}">${photo.city||''}</option>`;});
    }
}

function hidePreviewModal(){
    document.getElementById('preview-modal').style.display='none';
    currentPreviewPhoto=null; currentPreviewIndex=-1;
    if(viewerFullscreen) toggleFullscreen();
}

function navigatePhoto(dir) {
    if(panelPhotos.length<=1) return;
    currentPreviewIndex=(currentPreviewIndex+dir+panelPhotos.length)%panelPhotos.length;
    previewPhoto(panelPhotos[currentPreviewIndex]);
}

// ---- Viewer controls: zoom, rotate, fullscreen ----
function applyViewerTransform(){
    const img=document.getElementById('preview-img');
    img.style.transform=`scale(${viewerZoom}) rotate(${viewerRotation}deg)`;
}

function viewerZoomIn(){ viewerZoom=Math.min(viewerZoom*1.3, 5); applyViewerTransform(); }
function viewerZoomOut(){ viewerZoom=Math.max(viewerZoom/1.3, 0.3); applyViewerTransform(); }
function viewerRotate(){ viewerRotation+=90; applyViewerTransform(); }
function viewerReset(){ viewerZoom=1; viewerRotation=0; applyViewerTransform(); }

function toggleFullscreen(){
    viewerFullscreen=!viewerFullscreen;
    document.querySelector('.preview-content').classList.toggle('fullscreen', viewerFullscreen);
    document.getElementById('preview-fullscreen-btn').textContent=viewerFullscreen?'\u2716':'\u26F6';
}

// Mouse wheel zoom on image area
document.addEventListener('DOMContentLoaded', ()=>{
    const wrap=document.querySelector('.preview-img-wrap');
    if(wrap) wrap.addEventListener('wheel', e=>{
        if(document.getElementById('preview-modal').style.display!=='flex') return;
        e.preventDefault();
        if(e.deltaY<0) viewerZoomIn(); else viewerZoomOut();
    }, {passive:false});
});

// ============================================================
// Comments
// ============================================================
const EMOJI_LIST = [
    // Smileys
    '😀','😃','😄','😁','😆','😂','🤣','😊','😇','🙂',
    '😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛',
    '😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨',
    '😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪',
    '🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴',
    '😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟',
    '🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰',
    '😥','😢','😭','😱','😖','😣','😞','😓','😩','😫',
    '🥱','😤','😡','😠','🤬','💀','☠️','💩','🤡','👹',
    // Gestures & People
    '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞',
    '🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎',
    '✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏',
    '💪','🦾','🫶','❤️','🧡','💛','💚','💙','💜','🖤',
    '🤍','🩷','💔','❣️','💕','💞','💓','💗','💖','💘',
    // Nature & Travel
    '🌸','🌺','🌻','🌹','🌷','🌼','🍀','🌿','🌱','🌳',
    '🌴','🌵','🍁','🍂','🍃','🌾','🌊','🌅','🌄','🌇',
    '🌆','🏙️','🌃','🌉','🌌','🌠','🌈','☀️','🌤️','⛅',
    '🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🔥','💧',
    // Food
    '🍎','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍑','🍒',
    '🥝','🍍','🥭','🥥','🍔','🍟','🍕','🌮','🍜','🍣',
    '🍱','🥟','🍰','🎂','🍪','🍩','🍫','☕','🍵','🧋',
    // Activities & Objects
    '⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🥊',
    '📷','📸','🎥','🎬','🎵','🎶','🎤','🎧','🎸','🎹',
    '🎮','🕹️','🎯','🎲','🧩','🎭','🎨','🎪','🎡','🎢',
    '✈️','🚗','🚕','🚌','🚀','🛸','⛵','🚢','🏖️','🏔️',
    // Symbols
    '💯','✨','⭐','🌟','💫','🎉','🎊','🎈','🎁','🏆',
    '🥇','🥈','🥉','🏅','✅','❌','⭕','💢','💥','💫',
    '❗','❓','‼️','⁉️','💤','💬','🔔','🔕','📢','📌',
];

let replyToCommentId = 0;

function removeInlineReplyBox() {
    const old = document.querySelector('.inline-reply-box');
    if (old) old.remove();
    replyToCommentId = 0;
    document.getElementById('comment-input-area').style.display = isLoggedIn ? '' : 'none';
}

function showInlineReply(commentId, username) {
    removeInlineReplyBox();
    replyToCommentId = commentId;
    // Hide bottom input when inline reply is active
    document.getElementById('comment-input-area').style.display = 'none';
    const commentEl = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (!commentEl) return;
    const placeholder = t('replyTo') + username + '...';
    const box = document.createElement('div');
    box.className = 'inline-reply-box';
    box.innerHTML = `
        <div class="inline-reply-header">
            <span>${t('replyingTo')} <b>${escapeHTML(username)}</b></span>
            <button class="inline-reply-close" onclick="removeInlineReplyBox()" title="${t('cancel')}">&times;</button>
        </div>
        <div class="inline-reply-row">
            <input type="text" class="inline-reply-input" placeholder="${escapeHTML(placeholder)}" maxlength="500" autocomplete="off">
            <button class="emoji-toggle-btn" onclick="toggleInlineEmoji(this)" title="Emoji">&#128578;</button>
            <button class="btn-submit comment-send-btn" onclick="submitInlineReply(this)">&#10148;</button>
        </div>
        <div class="inline-emoji-picker" style="display:none"></div>`;
    commentEl.appendChild(box);
    const input = box.querySelector('.inline-reply-input');
    input.focus();
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInlineReply(input); }
        if (e.key === 'Escape') { removeInlineReplyBox(); }
    });
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleInlineEmoji(btn) {
    const picker = btn.closest('.inline-reply-box').querySelector('.inline-emoji-picker');
    if (picker.style.display === 'none') {
        if (!picker.hasChildNodes()) {
            picker.innerHTML = EMOJI_LIST.map(e => `<span class="emoji-item" onclick="insertInlineEmoji(this,'${e}')">${e}</span>`).join('');
        }
        picker.style.display = 'flex';
        picker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        picker.style.display = 'none';
    }
}

function insertInlineEmoji(el, emoji) {
    const input = el.closest('.inline-reply-box').querySelector('.inline-reply-input');
    const pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
    input.focus();
    input.selectionStart = input.selectionEnd = pos + emoji.length;
}

async function submitInlineReply(el) {
    if (!currentPreviewPhoto || !replyToCommentId) return;
    const box = el.closest('.inline-reply-box');
    const input = box.querySelector('.inline-reply-input');
    const content = input.value.trim();
    if (!content) return;
    const sendBtn = box.querySelector('.comment-send-btn');
    sendBtn.disabled = true;
    try {
        const resp = await fetch(api('/api/comments/add'), {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ photoUrl: currentPreviewPhoto.url, content, parentId: replyToCommentId })
        });
        if (resp.ok) {
            const data = await resp.json();
            const newId = data.id;
            removeInlineReplyBox();
            loadComments(currentPreviewPhoto.url, newId);
        } else { sendBtn.disabled = false; }
    } catch (e) { sendBtn.disabled = false; }
}

function buildRootCommentHTML(c) {
    const delBtn = isAdmin() ? `<button class="comment-del" onclick="deleteComment(${c.id})" title="Delete">&times;</button>` : '';
    const showName = escapeHTML(c.displayName || c.username);
    const safeName = escapeHTML(c.displayName || c.username).replace(/'/g, "\\'");
    const isSelf = loggedInUsername && c.username === loggedInUsername;
    const replyBtn = (isLoggedIn && !isSelf) ? `<button class="comment-reply-btn" onclick="showInlineReply(${c.id},'${safeName}')">${t('reply')}</button>` : '';
    const avatarUrl = c.avatar || '/static/avatars/default-1.svg';
    let html = `<div class="comment-item comment-root" data-comment-id="${c.id}">
        <img class="comment-avatar" src="${avatarUrl}" alt="">
        <div class="comment-main">
        <div class="comment-top"><span class="comment-user">${showName}</span><span class="comment-time">${c.createdAt}</span>${replyBtn}${delBtn}</div>
        <div class="comment-body">${escapeHTML(c.content)}</div>`;
    if (c.children && c.children.length > 0) {
        const COLLAPSE_LIMIT = 5;
        const visible = c.children.slice(0, COLLAPSE_LIMIT);
        const hidden = c.children.slice(COLLAPSE_LIMIT);
        html += `<div class="comment-children">`;
        for (const child of visible) {
            html += buildReplyHTML(child, c.id);
        }
        if (hidden.length > 0) {
            html += `<div class="comment-collapse-toggle" onclick="expandReplies(this)">`;
            html += t('showMoreReplies', hidden.length);
            html += `</div>`;
            html += `<div class="comment-hidden-replies" style="display:none">`;
            for (const child of hidden) {
                html += buildReplyHTML(child, c.id);
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    html += `</div></div>`;
    return html;
}

function buildReplyHTML(c, rootId) {
    const delBtn = isAdmin() ? `<button class="comment-del" onclick="deleteComment(${c.id})" title="Delete">&times;</button>` : '';
    const showName = escapeHTML(c.displayName || c.username);
    const safeName = escapeHTML(c.displayName || c.username).replace(/'/g, "\\'");
    const isSelf = loggedInUsername && c.username === loggedInUsername;
    const replyBtn = (isLoggedIn && !isSelf) ? `<button class="comment-reply-btn" onclick="showInlineReply(${c.id},'${safeName}')">${t('reply')}</button>` : '';
    const replyTag = c.replyToName ? `<span class="comment-reply-tag">${t('replyVerb')} <b>${escapeHTML(c.replyToName)}</b></span>` : '';
    return `<div class="comment-item comment-reply" data-comment-id="${c.id}">
        <div class="comment-top"><span class="comment-user">${showName}</span>${replyTag}<span class="comment-time">${c.createdAt}</span>${replyBtn}${delBtn}</div>
        <div class="comment-body">${escapeHTML(c.content)}</div>
    </div>`;
}

function expandReplies(el) {
    const hidden = el.nextElementSibling;
    if (hidden) hidden.style.display = '';
    el.remove();
}

function scrollToComment(list, commentId) {
    let target = list.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (!target) return;
    // If target is inside a collapsed section, expand it
    const hiddenParent = target.closest('.comment-hidden-replies');
    if (hiddenParent && hiddenParent.style.display === 'none') {
        hiddenParent.style.display = '';
        const toggle = hiddenParent.previousElementSibling;
        if (toggle && toggle.classList.contains('comment-collapse-toggle')) toggle.remove();
    }
    // Highlight and scroll
    target.style.transition = 'background 0.3s';
    target.style.background = 'var(--accent-glow)';
    setTimeout(() => { target.style.background = ''; }, 2000);
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function loadComments(photoUrl, scrollToId) {
    const list = document.getElementById('comments-list');
    const header = document.getElementById('comments-header');
    list.innerHTML = '';
    removeInlineReplyBox();
    try {
        const resp = await fetch(api('/api/comments') + '?photo=' + encodeURIComponent(photoUrl));
        const comments = await resp.json();
        header.textContent = t('comments') + (comments.length > 0 ? ' (' + comments.length + ')' : '');
        if (comments.length === 0) {
            list.innerHTML = `<div class="comment-empty">${t('noComments')}</div>`;
            return;
        }
        // Build lookup
        const byId = {};
        for (const c of comments) { c.children = []; byId[c.id] = c; }
        // Find root ancestor of a comment
        function findRootId(id) {
            let cur = byId[id];
            while (cur && cur.parentId && byId[cur.parentId]) { cur = byId[cur.parentId]; }
            return cur ? cur.id : id;
        }
        // Resolve replyToName: the direct parent's display name (who they replied to)
        for (const c of comments) {
            if (c.parentId && byId[c.parentId]) {
                c.replyToName = byId[c.parentId].displayName || byId[c.parentId].username;
            }
        }
        // Build flat 2-level tree: all descendants go under their root ancestor
        const roots = [];
        for (const c of comments) {
            if (!c.parentId || !byId[c.parentId]) {
                roots.push(c);
            }
        }
        for (const c of comments) {
            if (c.parentId && byId[c.parentId]) {
                const rid = findRootId(c.id);
                if (byId[rid]) byId[rid].children.push(c);
            }
        }
        list.innerHTML = roots.map(c => buildRootCommentHTML(c)).join('');
        if (scrollToId) {
            scrollToComment(list, scrollToId);
        } else {
            list.scrollTop = 0;
        }
    } catch (e) { list.innerHTML = ''; }
}

async function postComment() {
    if (!currentPreviewPhoto) return;
    const input = document.getElementById('comment-text');
    const content = input.value.trim();
    if (!content) return;
    try {
        const resp = await fetch(api('/api/comments/add'), {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ photoUrl: currentPreviewPhoto.url, content })
        });
        if (resp.ok) {
            const data = await resp.json();
            input.value = '';
            document.getElementById('emoji-picker').style.display = 'none';
            loadComments(currentPreviewPhoto.url, data.id);
        }
    } catch (e) {}
}

async function deleteComment(id) {
    if (!confirm(t('deleteCommentConfirm'))) return;
    try {
        await fetch(api('/api/comments/delete'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id }) });
        if (currentPreviewPhoto) loadComments(currentPreviewPhoto.url);
    } catch (e) {}
}

function toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker.style.display === 'none') {
        if (!picker.hasChildNodes()) {
            picker.innerHTML = EMOJI_LIST.map(e => `<span class="emoji-item" onclick="insertEmoji('${e}')">${e}</span>`).join('');
        }
        picker.style.display = 'flex';
    } else {
        picker.style.display = 'none';
    }
}

function insertEmoji(emoji) {
    const input = document.getElementById('comment-text');
    const pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
    input.focus();
    input.selectionStart = input.selectionEnd = pos + emoji.length;
}

async function saveDescription() {
    if(!currentPreviewPhoto) return;
    const btn=document.getElementById('preview-save-btn');
    const desc=document.getElementById('preview-desc').value.trim();
    const newCity=document.getElementById('preview-city').value;
    const oldCity=currentPreviewPhoto.city||'';
    btn.textContent=t('saving'); btn.disabled=true;
    try{
        if(newCity&&newCity!==oldCity){
            const mr=await fetch(api('/api/move'),{method:'POST',headers:authHeaders(),body:JSON.stringify({province:currentPreviewPhoto.province,oldCity:oldCity,newCity:newCity,filename:currentPreviewPhoto.filename})});
            if(!mr.ok){btn.textContent=t('save');btn.disabled=false;return;}
            currentPreviewPhoto.city=newCity;
        }
        const resp=await fetch(api('/api/update-description'),{method:'POST',headers:authHeaders(),body:JSON.stringify({province:currentPreviewPhoto.province,city:currentPreviewPhoto.city||'',filename:currentPreviewPhoto.filename,description:desc})});
        if(resp.ok){
            currentPreviewPhoto.description=desc;
            hidePreviewModal();
            showToast(t('saved'));
            await loadAllPhotos(); chart.setOption({series:[{data:buildProvinceMapData()}]}); scheduleOverlay();
            loadPhotosPanel(currentProvince||undefined,currentCity||undefined);
        } else {btn.textContent=t('save');btn.disabled=false;}
    }catch(e){btn.textContent=t('save');btn.disabled=false;}
}

async function deletePhoto() {
    if(!currentPreviewPhoto) return;
    if(!confirm(t('deleteConfirm'))) return;
    const btn=document.getElementById('preview-delete-btn'); btn.disabled=true;
    try{
        const resp=await fetch(api('/api/delete'),{method:'POST',headers:authHeaders(),body:JSON.stringify({province:currentPreviewPhoto.province,city:currentPreviewPhoto.city,filename:currentPreviewPhoto.filename})});
        if(resp.ok){
            hidePreviewModal();
            showToast(t('deleted'));
            await loadAllPhotos(); chart.setOption({series:[{data:buildProvinceMapData()}]}); scheduleOverlay();
            loadPhotosPanel(currentProvince||undefined,currentCity||undefined);
        } else {btn.disabled=false;}
    }catch(e){btn.disabled=false;}
}

// ============================================================
// Upload
// ============================================================
function initUploadForm(){
    const sel=document.getElementById('upload-province');
    for(const prov of PROVINCE_LIST){const o=document.createElement('option');o.value=prov;o.textContent=prov;sel.appendChild(o);}
    document.getElementById('upload-file').addEventListener('change',e=>{const p=document.getElementById('upload-preview');p.innerHTML='';for(const f of e.target.files){const img=document.createElement('img');img.src=URL.createObjectURL(f);p.appendChild(img);}});
}

function onProvinceSelect(){
    const province=document.getElementById('upload-province').value, selCity=document.getElementById('upload-city');
    if(!province){selCity.innerHTML=`<option value="">${t('selectProvinceFirst')}</option>`;return;}
    const adcode=PROVINCE_ADCODE[province]; if(!adcode)return;
    selCity.innerHTML=`<option value="">${t('loading')}</option>`;
    fetchGeoJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`).then(geo=>{
        selCity.innerHTML=`<option value="">${t('defaultCapital')}</option>`;
        const cities=geo.features.map(f=>f.properties.name).sort();
        for(const c of cities){const o=document.createElement('option');o.value=c;o.textContent=c;selCity.appendChild(o);}
        // Auto-select capital city
        const capital=resolveCapitalGeoName(province);
        if(capital){selCity.value=capital;}
    }).catch(()=>{selCity.innerHTML=`<option value="">${t('loadFailed')}</option>`;});
}

function showUploadModal(){
    document.getElementById('upload-modal').style.display='flex';
    if(currentProvince){
        document.getElementById('upload-province').value=currentProvince;
        onProvinceSelect();
        if(currentCity){
            // Fuzzy pre-select city after dropdown loads
            setTimeout(()=>{
                const sel=document.getElementById('upload-city');
                sel.value=currentCity;
                if(!sel.value){
                    const base=currentCity.replace(/市$/,'');
                    for(const o of sel.options) if(o.value.replace(/市$/,'')=== base){sel.value=o.value;break;}
                }
            },600);
        }
    }
}

function hideUploadModal(){document.getElementById('upload-modal').style.display='none';document.getElementById('upload-preview').innerHTML='';document.getElementById('upload-file').value='';document.getElementById('upload-desc').value='';}

async function doUpload(){
    const province=document.getElementById('upload-province').value;
    let city=document.getElementById('upload-city').value;
    const desc=document.getElementById('upload-desc').value.trim(), files=document.getElementById('upload-file').files;
    if(!province){showToast(t('selectProvinceAlert'));return;}
    if(files.length===0){showToast(t('selectImagesAlert'));return;}
    if(!city) city=resolveCapitalGeoName(province);
    const btn=document.querySelector('.btn-submit'); btn.textContent=t('uploading'); btn.disabled=true;
    let success=0;
    for(const file of files){const fd=new FormData();fd.append('province',province);fd.append('city',city);fd.append('description',desc);fd.append('file',file);try{const r=await fetch(api('/api/upload'),{method:'POST',headers:authUploadHeaders(),body:fd});if(r.ok)success++;}catch(e){}}
    btn.textContent=t('uploadBtn'); btn.disabled=false;
    if(success>0){hideUploadModal();showToast(success+' '+t('uploadSuccessN'));await loadAllPhotos();chart.setOption({series:[{data:buildProvinceMapData()}]});scheduleOverlay();loadPhotosPanel(currentProvince||undefined,currentCity||undefined);}
    else showToast(t('uploadFailed'));
}
