const root = document.getElementById('root');
const btnClose = document.getElementById('btnClose');
const toast = document.getElementById('toast');


// UI-ljud (CEF-kompatibelt) + volym (sparas lokalt)
const sndTap = document.getElementById('sndTap');
const sndConfirm = document.getElementById('sndConfirm');
const sndWarn = document.getElementById('sndWarn');

function clamp(n, a, b){ n = Number(n); if(isNaN(n)) n = a; return Math.max(a, Math.min(b, n)); }

let uiVolume = clamp((localStorage.getItem('mdt_volume') || 70), 0, 100);

function applyAudioVolume(){
  const v = uiVolume / 100;
  [sndTap, sndConfirm, sndWarn].forEach(function(a){
    if(!a) return;
    try{ a.volume = v; }catch(e){}
  });
  const slider = document.getElementById('optVolume');
  const label = document.getElementById('optVolumeLabel');
  if(slider) slider.value = String(uiVolume);
  if(label) label.textContent = String(uiVolume) + '%';
}

function setUiVolume(v){
  uiVolume = clamp(v, 0, 100);
  localStorage.setItem('mdt_volume', String(uiVolume));
  applyAudioVolume();
}

function playSound(a){
  if(!a) return;
  try{
    a.currentTime = 0;
    const p = a.play();
    if(p && typeof p.catch === 'function') p.catch(function(){});
  }catch(e){}
}
function playTap(){ playSound(sndTap); }
function playConfirm(){ playSound(sndConfirm || sndTap); }
function playWarn(){ playSound(sndWarn || sndTap); }

applyAudioVolume();

// Spela klickljud på knappar/meny (men inte i inputfält)

document.addEventListener('click', function(ev){
  var t = ev.target;
  if(!t) return;
  // Ignorera klick i inputs
  var tag = (t.tagName || '').toLowerCase();
  if(tag === 'input' || tag === 'textarea' || tag === 'select') return;
  // Spela på knappar, länkar, nav, rader
  if(t.closest && t.closest('button, .nav-item, .card, .list-row, .table-row, a')){
    /*sound*/
  var b = (t && t.closest) ? t.closest('button') : null;
  if(b){
    if(b.classList && b.classList.contains('btn-danger')) playWarn();
    else if(b.classList && b.classList.contains('btn') && !b.classList.contains('btn-ghost')) playConfirm();
    else playTap();
  }else{
    playTap();
  }

  }
});

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

const viewTitle = document.getElementById('viewTitle');

const views = {
  dashboard: document.getElementById('view-dashboard'),
  citizens: document.getElementById('view-citizens'),
  vehicles: document.getElementById('view-vehicles'),
  reports: document.getElementById('view-reports'),
  warrants: document.getElementById('view-warrants'),
  bolos: document.getElementById('view-bolos'),
  settings: document.getElementById('view-settings'),
};

const TAB_TITLES = {
  dashboard: 'tab_dashboard',
  citizens: 'tab_citizens',
  vehicles: 'tab_vehicles',
  reports: 'tab_reports',
  warrants: 'tab_warrants',
  bolos: 'tab_bolos',
  settings: 'tab_settings'
};

const I18N = {
  sv: {
    app_title: 'Polismyndigheten - MDT',
    brand_title: 'Polismyndigheten',
    brand_sub: 'Mobilt dataterminalsystem • Polis',
    splash_title: 'Polismyndigheten MDT',
    splash_init: 'Initierar säker anslutning…',
    splash_hint: 'Verifierar certifikat • Synkar data • Startar gränssnitt',
    splash_step_1: 'Verifierar behörigheter…',
    splash_step_2: 'Laddar register och rapporter…',
    close: 'Stäng',
    close_mdt: 'Stäng MDT',
    logged_in: 'INLOGGAD',
    refresh: 'Uppdatera',
    refresh_mdt: 'Uppdatera MDT',
    tab_dashboard: 'Översikt',
    tab_citizens: 'Personer',
    tab_vehicles: 'Fordon',
    tab_reports: 'Rapporter',
    tab_warrants: 'Efterlysningar',
    tab_bolos: 'BOLO',
    tab_settings: 'Inställningar',
    settings_saved: 'Inställningar sparade',
    settings_reset: 'Återställt till standard',
    cleared: 'Rensat',
    no_activity: 'Ingen aktivitet',
    language: 'Språk',
    theme: 'Tema',
    light: 'Ljust',
    dark: 'Mörkt',
    sound: 'Ljud',
    view: 'Visning',
    modules: 'Moduler',
    compact_mode: 'Kompakt läge',
    show_quick: 'Visa snabbåtgärder på översikten',
    save: 'Spara',
    reset_default: 'Återställ standard',
    settings_title: 'Inställningar',
    settings_sub: 'Personliga val sparas lokalt (klient).',
    settings_footer: 'Säkert gränssnitt • Lokal klientprofil'
  },
  en: {
    app_title: 'Police Authority - MDT',
    brand_title: 'Police Authority',
    brand_sub: 'Mobile data terminal system • Police',
    splash_title: 'Police Authority MDT',
    splash_init: 'Initializing secure connection…',
    splash_hint: 'Verifying certificates • Syncing data • Starting interface',
    splash_step_1: 'Verifying permissions…',
    splash_step_2: 'Loading records and reports…',
    close: 'Close',
    close_mdt: 'Close MDT',
    logged_in: 'LOGGED IN',
    refresh: 'Refresh',
    refresh_mdt: 'Refresh MDT',
    tab_dashboard: 'Overview',
    tab_citizens: 'People',
    tab_vehicles: 'Vehicles',
    tab_reports: 'Reports',
    tab_warrants: 'Warrants',
    tab_bolos: 'BOLO',
    tab_settings: 'Settings',
    settings_saved: 'Settings saved',
    settings_reset: 'Restored defaults',
    cleared: 'Cleared',
    no_activity: 'No activity',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    sound: 'Sound',
    view: 'View',
    modules: 'Modules',
    compact_mode: 'Compact mode',
    show_quick: 'Show quick actions on overview',
    save: 'Save',
    reset_default: 'Reset defaults',
    settings_title: 'Settings',
    settings_sub: 'Personal choices are saved locally (client).',
    settings_footer: 'Secure interface • Local client profile'
  },
  no: {
    app_title: 'Politimyndigheten - MDT',
    brand_title: 'Politimyndigheten',
    brand_sub: 'Mobilt dataterminalsystem • Politi',
    splash_title: 'Politimyndigheten MDT',
    splash_init: 'Initialiserer sikker tilkobling…',
    splash_hint: 'Verifiserer sertifikater • Synkroniserer data • Starter grensesnitt',
    splash_step_1: 'Verifiserer rettigheter…',
    splash_step_2: 'Laster registre og rapporter…',
    close: 'Lukk',
    close_mdt: 'Lukk MDT',
    logged_in: 'INNLOGGET',
    refresh: 'Oppdater',
    refresh_mdt: 'Oppdater MDT',
    tab_dashboard: 'Oversikt',
    tab_citizens: 'Personer',
    tab_vehicles: 'Kjøretøy',
    tab_reports: 'Rapporter',
    tab_warrants: 'Etterlysninger',
    tab_bolos: 'BOLO',
    tab_settings: 'Innstillinger',
    settings_saved: 'Innstillinger lagret',
    settings_reset: 'Standard gjenopprettet',
    cleared: 'Tømt',
    no_activity: 'Ingen aktivitet',
    language: 'Språk',
    theme: 'Tema',
    light: 'Lys',
    dark: 'Mørk',
    sound: 'Lyd',
    view: 'Visning',
    modules: 'Moduler',
    compact_mode: 'Kompakt modus',
    show_quick: 'Vis hurtighandlinger på oversikten',
    save: 'Lagre',
    reset_default: 'Tilbakestill standard',
    settings_title: 'Innstillinger',
    settings_sub: 'Personlige valg lagres lokalt (klient).',
    settings_footer: 'Sikkert grensesnitt • Lokal klientprofil'
  }
};

function t(key){
  var lang = (settings && settings.language) || 'en';
  var pack = I18N[lang] || I18N.sv;
  return pack[key] || I18N.en[key] || I18N.sv[key] || key;
}

function applyTranslations(){
  try{
    document.documentElement.lang = (settings && settings.language) || 'en';
    document.title = t('app_title');
    var splashTitle = document.getElementById('splashTitle'); if(splashTitle) splashTitle.textContent = t('splash_title');
    var splashSub = document.getElementById('splashSub'); if(splashSub) splashSub.textContent = t('splash_init');
    var splashHint = document.getElementById('splashHint'); if(splashHint) splashHint.textContent = t('splash_hint');
    var brandTitle = document.querySelector('.brand-title'); if(brandTitle) brandTitle.textContent = t('brand_title');
    var brandSub = document.querySelector('.brand-sub'); if(brandSub) brandSub.textContent = t('brand_sub');
    var escText = document.querySelector('.sidebar-footer .hint div:last-child'); if(escText) escText.textContent = t('close');
    var btnCloseEl = document.getElementById('btnClose'); if(btnCloseEl) btnCloseEl.textContent = t('close_mdt');
    var pillStatus = document.getElementById('pillStatus'); if(pillStatus) pillStatus.textContent = t('logged_in');
    var btnGlobalRefresh = document.getElementById('btnGlobalRefresh');
    if(btnGlobalRefresh){ btnGlobalRefresh.title = t('refresh_mdt'); btnGlobalRefresh.setAttribute('aria-label', t('refresh')); }

    var navMap = ['dashboard','citizens','vehicles','reports','warrants','bolos','settings'];
    for(var i=0;i<navMap.length;i++){
      var btn = document.querySelector('.nav-item[data-tab="' + navMap[i] + '"]');
      if(btn){
        var dot = '<span class="nav-dot"></span> ';
        btn.innerHTML = dot + t(TAB_TITLES[navMap[i]]);
      }
    }

    var viewTitleEl = document.getElementById('viewTitle');
    if(viewTitleEl){
      var activeTab = getActiveTab() || 'dashboard';
      viewTitleEl.textContent = t(TAB_TITLES[activeTab] || activeTab);
    }

    var labelTheme = document.getElementById('labelTheme'); if(labelTheme) labelTheme.textContent = t('theme');
    var labelLanguage = document.getElementById('labelLanguage'); if(labelLanguage) labelLanguage.textContent = t('language');
    var labelSound = document.getElementById('labelSound'); if(labelSound) labelSound.textContent = t('sound');
    var themeLight = document.getElementById('themeLight'); if(themeLight) themeLight.textContent = t('light');
    var themeDark = document.getElementById('themeDark'); if(themeDark) themeDark.textContent = t('dark');

    var settingsHeader = document.querySelector('#view-settings > .grid-2 > .card:first-child .card-title');
    if(settingsHeader) settingsHeader.textContent = t('settings_title');
    var settingsSub = document.querySelector('#view-settings > .grid-2 > .card:first-child .muted');
    if(settingsSub) settingsSub.textContent = t('settings_sub');

    var settingsLabels = document.querySelectorAll('#view-settings .form > label');
    if(settingsLabels && settingsLabels.length >= 5){
      settingsLabels[0].textContent = t('theme');
      settingsLabels[1].textContent = t('language');
      settingsLabels[2].textContent = t('sound');
      settingsLabels[3].textContent = t('view');
      settingsLabels[4].textContent = t('modules');
    }

    var checks = document.querySelectorAll('#view-settings .checks .check');
    if(checks && checks.length >= 2){
      checks[0].lastChild.textContent = ' ' + t('compact_mode');
      checks[1].lastChild.textContent = ' ' + t('show_quick');
    }

    var btnSave = document.getElementById('btnSaveSettings'); if(btnSave) btnSave.textContent = t('save');
    var btnReset = document.getElementById('btnResetSettings'); if(btnReset) btnReset.textContent = t('reset_default');
    var footerNote = document.getElementById('settingsFooterNote'); if(footerNote) footerNote.textContent = t('settings_footer');
    var btnCitizenSearch = document.getElementById('btnCitizenSearch'); if(btnCitizenSearch) btnCitizenSearch.textContent = (settings.language==='en'?'Search':settings.language==='no'?'Søk':'Sök');
    var btnVehicleSearch = document.getElementById('btnVehicleSearch'); if(btnVehicleSearch) btnVehicleSearch.textContent = (settings.language==='en'?'Search':settings.language==='no'?'Søk':'Sök');
    var btnReportSave = document.getElementById('btnReportSave'); if(btnReportSave) btnReportSave.textContent = (settings.language==='en'?'Submit report':settings.language==='no'?'Send rapport':'Skicka rapport');
    var btnWarrantSave = document.getElementById('btnWarrantSave'); if(btnWarrantSave) btnWarrantSave.textContent = (settings.language==='en'?'Create warrant':settings.language==='no'?'Opprett etterlysning':'Lägg efterlysning');
    var btnBoloSave = document.getElementById('btnBoloSave'); if(btnBoloSave) btnBoloSave.textContent = (settings.language==='en'?'Create BOLO':settings.language==='no'?'Opprett BOLO':'Skapa BOLO');
    var citizenQuery = document.getElementById('citizenQuery'); if(citizenQuery) citizenQuery.placeholder = (settings.language==='en'?'e.g. Alex, Johnson, ABC12345':settings.language==='no'?'f.eks. Ola, Hansen, ABC12345':'t.ex. Erik, Andersson, ABC12345');
    var vehicleQuery = document.getElementById('vehicleQuery'); if(vehicleQuery) vehicleQuery.placeholder = (settings.language==='en'?'e.g. ABC123':settings.language==='no'?'f.eks. ABC123':'t.ex. ABC123');
    var reportTitle = document.getElementById('reportTitle'); if(reportTitle) reportTitle.placeholder = (settings.language==='en'?'Short headline':settings.language==='no'?'Kort overskrift':'Kort rubrik');
    var reportContent = document.getElementById('reportContent'); if(reportContent) reportContent.placeholder = (settings.language==='en'?'Write the report...':settings.language==='no'?'Skriv rapporten...':'Skriv rapporten...');
    var warrantReason = document.getElementById('warrantReason'); if(warrantReason) warrantReason.placeholder = (settings.language==='en'?'Short reason':settings.language==='no'?'Kort grunn':'Kort anledning');
    var boloDescription = document.getElementById('boloDescription'); if(boloDescription) boloDescription.placeholder = (settings.language==='en'?'Wanted person/vehicle (short description)':settings.language==='no'?'Etterlyst person/kjøretøy (kort beskrivelse)':'Efterlyst person/fordon (kort beskrivning)');
  }catch(e){}
}

let presets = [];
let categories = [];

// Aktivt uppslagen person
let currentCitizenId = null;
let currentVehiclePlate = null;
let currentCitizenReports = [];
let recSearchTimer = null;
let licSearchTimer = null;
let repSearchTimer = null;
let openCitizenJump = null;

let lastSplashCfg = { Enabled: true, Title: 'Police Authority MDT', DelayMs: 3000 };

function recordTypeLabel(t){
  t = String(t || '').toUpperCase();
  var lang = (settings && settings.language) || 'en';
  if(lang === 'en'){
    if(t === 'MISSTANKE') return 'Suspicion';
    if(t === 'DOM') return 'Conviction';
    if(t === 'ANMARKNING') return 'Annotation';
    if(t === 'RAPPORT') return 'Report';
    return 'Case';
  }
  if(lang === 'no'){
    if(t === 'MISSTANKE') return 'Mistanke';
    if(t === 'DOM') return 'Dom';
    if(t === 'ANMARKNING') return 'Merknad';
    if(t === 'RAPPORT') return 'Rapport';
    return 'Sak';
  }
  if(t === 'MISSTANKE') return 'Misstanke';
  if(t === 'DOM') return 'Dom';
  if(t === 'ANMARKNING') return 'Anmärkning';
  if(t === 'RAPPORT') return 'Rapport';
  return 'Ärende';
}


function showModal(title, sub, bodyHtml){
  if(modalTitle) modalTitle.textContent = title || ((settings.language==='en') ? 'Details' : 'Detaljer');
  if(modalSub) modalSub.textContent = sub || '';
  if(modalBody) modalBody.innerHTML = bodyHtml || '';
  if(modal){
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function hideModal(){
  if(modal){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  if(modalBody) modalBody.innerHTML = '';
}

// ES2020-saker (optional chaining / ??) kan orsaka vit skarm i vissa FiveM-CEF-versioner.
// Hjalpfunktioner nedan gor koden kompatibel utan dessa syntaxer.
function getActiveTab(){
  var el = document.querySelector('.nav-item.active');
  return (el && el.dataset) ? el.dataset.tab : null;
}
function isChecked(id){
  var el = document.getElementById(id);
  return !!(el && el.checked);
}
function getValue(el){
  return el ? (el.value || '') : '';
}
function coalesce(v, fallback){
  return (v === undefined || v === null) ? fallback : v;
}


function escapeHtml(str){
  str = String(str === undefined || str === null ? '' : str);
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}



// ----------------------------
// Boot / Splash-sekvens (används både vid open och refresh)
// ----------------------------
function showSplash(cfg){
  var splash = document.getElementById('splash');
  var splashTitle = document.getElementById('splashTitle');
  var splashSub = document.getElementById('splashSub');
  var splashHint = document.getElementById('splashHint');
  var splashBar = document.getElementById('splashBar');
  var useSplash = !!(cfg && cfg.Enabled);
  if(!splash) return { useSplash: false, delay: 0, splash: null, splashSub: null, splashBar: null };

  if(useSplash){
    if(splashTitle) splashTitle.textContent = cfg.Title || t('splash_title');
    if(splashSub) splashSub.textContent = t('splash_init');
    if(splashHint) splashHint.textContent = t('splash_hint');
    if(splashBar){
      splashBar.style.animation = 'none';
      splashBar.style.width = '0%';
      void splashBar.offsetWidth;
      var d = Number(cfg.DelayMs || 0);
      if(d > 0) splashBar.style.animation = 'splashFill ' + d + 'ms linear forwards';
    }
    splash.classList.remove('hidden');
    splash.setAttribute('aria-hidden','false');
  }else{
    splash.classList.add('hidden');
    splash.setAttribute('aria-hidden','true');
  }
  return { useSplash: useSplash, delay: Number((cfg && cfg.DelayMs) || 0), splash: splash, splashSub: splashSub, splashBar: splashBar };
}

async function runBootSequence(cfg){
  cfg = cfg || lastSplashCfg || {};
  lastSplashCfg = cfg;

  // Reset state som vid "ny start"
  currentCitizenId = null;
  currentVehiclePlate = null;
  hideModal();

  var splashState = showSplash(cfg);
  var delay = splashState.delay || 0;

  // Små statussteg
  if(splashState.useSplash && splashState.splashSub && delay > 0){
    setTimeout(function(){ splashState.splashSub.textContent = t('splash_step_1'); }, Math.min(700, delay));
    setTimeout(function(){ splashState.splashSub.textContent = t('splash_step_2'); }, Math.min(1600, delay));
  }

  // Starta alltid från Översikt vid refresh
  setTab('dashboard');

  await new Promise(function(res){ setTimeout(res, Math.max(0, delay)); });

  if(splashState.useSplash && splashState.splash){
    splashState.splash.classList.add('hidden');
    splashState.splash.setAttribute('aria-hidden','true');
  }

  // Ladda basdata (samma som vid open)
  await loadDashboard();
  if(settings && settings.modules && settings.modules.reports) await loadReports();
  if(settings && settings.modules && settings.modules.warrants) await loadWarrants();
  if(settings && settings.modules && settings.modules.bolos) await loadBolos();
}
// ----------------------------
// Inställningar (klient)
// ----------------------------
const SETTINGS_KEY = 'mbdev_police_mdt_settings_v2';
const RECENT_KEY = 'mbdev_police_mdt_recent_v2';
const ACTIVITY_KEY = 'mbdev_police_mdt_activity_v2';
const CACHE_VERSION_KEY = 'mbdev_police_mdt_cache_version';
const CACHE_VERSION = '2026-03-clean';

(function migrateLegacyLocalCache(){
  try{
    const current = localStorage.getItem(CACHE_VERSION_KEY);
    if(current === CACHE_VERSION) return;
    [
      'qb_police_mdt_settings_v1',
      'qb_police_mdt_recent_v1',
      'qb_police_mdt_activity_v1'
    ].forEach(function(key){
      localStorage.removeItem(key);
    });
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
  }catch(e){}
})();

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  compact: false,
  showDashboardQuick: true,
  modules: { citizens: true, vehicles: true, reports: true, warrants: true, bolos: true }
};

let settings = loadSettings();
let _settingsBound = false;

function safeJSONParse(str, fallback){
  try{ return JSON.parse(str); }catch{ return fallback; }
}

function loadSettings(){
  const raw = localStorage.getItem(SETTINGS_KEY);
  const s = raw ? safeJSONParse(raw, {}) : {};
  const merged = Object.assign({}, DEFAULT_SETTINGS, s);
  merged.modules = Object.assign({}, DEFAULT_SETTINGS.modules, (s.modules || {}));
  return merged;
}

function saveSettings(){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings(){
  document.documentElement.dataset.theme = settings.theme === 'dark' ? 'dark' : 'light';
  applyTranslations();
  document.documentElement.classList.toggle('compact', !!settings.compact);


// Dashboard quick actions
  const quickCard = document.getElementById('dashboardQuickCard');
  if(quickCard){
    quickCard.classList.toggle('hidden', !settings.showDashboardQuick);
  }

  // Module visibility (nav + views)
  const moduleTabs = ['citizens','vehicles','reports','warrants','bolos'];
  for(var i=0;i<moduleTabs.length;i++){
    var tab = moduleTabs[i];
    var enabled = !!(settings.modules && settings.modules[tab]);
    var btns = document.querySelectorAll('.nav-item[data-tab="' + tab + '"]');
    for(var j=0;j<btns.length;j++){
      btns[j].classList.toggle('hidden', !enabled);
    }
  }

  // Quick buttons should respect module settings
  var quickBtns = document.querySelectorAll('[data-quick]');
  for(var q=0;q<quickBtns.length;q++){
    var btn = quickBtns[q];
    var t = btn.dataset.quick;
    if(['citizens','vehicles','reports','warrants','bolos'].indexOf(t) !== -1){
      btn.classList.toggle('hidden', !settings.modules[t]);
    }
  }

  // If current tab became hidden, bounce to dashboard
  const activeTab = getActiveTab() || 'dashboard';
  if(activeTab !== 'dashboard' && activeTab !== 'settings' && settings.modules && settings.modules[activeTab] === false){
    setTab('dashboard');
  }
}

function hydrateSettingsUI(){
  const btnLight = document.getElementById('themeLight');
  const btnDark = document.getElementById('themeDark');
  const optCompact = document.getElementById('optCompact');
  const optLanguage = document.getElementById('optLanguage');
  const optShowDashboardQuick = document.getElementById('optShowDashboardQuick');

  const modCitizens = document.getElementById('modCitizens');
  const modVehicles = document.getElementById('modVehicles');
  const modReports = document.getElementById('modReports');
  const modWarrants = document.getElementById('modWarrants');
  const modBolos = document.getElementById('modBolos');

  if(btnLight && btnDark){
    btnLight.classList.toggle('active', settings.theme !== 'dark');
    btnDark.classList.toggle('active', settings.theme === 'dark');
  }
  if(optCompact) optCompact.checked = !!settings.compact;
  if(optLanguage) optLanguage.value = settings.language || 'en';
  if(optShowDashboardQuick) optShowDashboardQuick.checked = !!settings.showDashboardQuick;

  if(modCitizens) modCitizens.checked = !!settings.modules.citizens;
  if(modVehicles) modVehicles.checked = !!settings.modules.vehicles;
  if(modReports) modReports.checked = !!settings.modules.reports;
  if(modWarrants) modWarrants.checked = !!settings.modules.warrants;
  if(modBolos) modBolos.checked = !!settings.modules.bolos;
  // Ljudvolym (sparas separat)
  applyAudioVolume();
  applyTranslations();
}

function bindSettingsUI(){
  if(_settingsBound) return;
  _settingsBound = true;
  const btnLight = document.getElementById('themeLight');
  const btnDark = document.getElementById('themeDark');
  const btnSave = document.getElementById('btnSaveSettings');
  const btnReset = document.getElementById('btnResetSettings');
  const optVolume = document.getElementById('optVolume');
  const optLanguage = document.getElementById('optLanguage');

  if(optVolume){
    optVolume.addEventListener('input', function(){
      setUiVolume(optVolume.value);
    });
  }

  if(btnLight) btnLight.addEventListener('click', () => {
    settings.theme = 'light';
    hydrateSettingsUI();
    applySettings();
  });
  if(btnDark) btnDark.addEventListener('click', () => {
    settings.theme = 'dark';
    hydrateSettingsUI();
    applySettings();
  });
  if(optLanguage) optLanguage.addEventListener('change', function(){
    settings.language = optLanguage.value || 'en';
    hydrateSettingsUI();
    applySettings();
    saveSettings();
  });

  if(btnSave) btnSave.addEventListener('click', () => {
    settings.compact = isChecked('optCompact');
    settings.language = (document.getElementById('optLanguage') && document.getElementById('optLanguage').value) || 'en';
    settings.showDashboardQuick = isChecked('optShowDashboardQuick');
    settings.modules = {
      citizens: isChecked('modCitizens'),
      vehicles: isChecked('modVehicles'),
      reports: isChecked('modReports'),
      warrants: isChecked('modWarrants'),
      bolos: isChecked('modBolos'),
    };
    saveSettings();
    hydrateSettingsUI();
    applySettings();
    showToast(t('settings_saved'));
  });

  if(btnReset) btnReset.addEventListener('click', () => {
    settings = Object.assign({}, DEFAULT_SETTINGS); settings.modules = Object.assign({}, DEFAULT_SETTINGS.modules);
    saveSettings();
    hydrateSettingsUI();
    applySettings();
    showToast(t('settings_reset'));
  });

  var _btnClearRecent = document.getElementById('btnClearRecent');
  if(_btnClearRecent) _btnClearRecent.addEventListener('click', () => {
    localStorage.removeItem(RECENT_KEY);
    renderRecent();
    showToast(t('cleared'));
  });
  var _btnClearActivity = document.getElementById('btnClearActivity');
  if(_btnClearActivity) _btnClearActivity.addEventListener('click', () => {
    localStorage.removeItem(ACTIVITY_KEY);
    renderActivity();
    showToast(t('cleared'));
  });
}

function getRecent(){
  return safeJSONParse(localStorage.getItem(RECENT_KEY) || '', { citizens: [], vehicles: [] });
}

function setRecent(data){
  localStorage.setItem(RECENT_KEY, JSON.stringify(data));
}

function pushUnique(arr, item, key){
  const filtered = (arr || []).filter(x => x && x[key] !== item[key]);
  filtered.unshift(item);
  return filtered.slice(0, 8);
}

function addRecentCitizen(c){
  const r = getRecent();
  r.citizens = pushUnique(r.citizens, { citizenid: c.citizenid, name: c.name }, 'citizenid');
  setRecent(r);
  renderRecent();
}

function addRecentVehicle(v){
  const r = getRecent();
  r.vehicles = pushUnique(r.vehicles, { plate: v.plate, vehicle: v.vehicle }, 'plate');
  setRecent(r);
  renderRecent();
}

function getActivity(){
  return safeJSONParse(localStorage.getItem(ACTIVITY_KEY) || '', []);
}

function setActivity(a){
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(a));
}

function addActivity(text){
  const a = getActivity();
  a.unshift({ ts: new Date().toISOString(), text });
  setActivity(a.slice(0, 20));
  renderActivity();
}

function renderRecent(){
  const r = getRecent();

  const cHolder = document.getElementById('recentCitizens');
  const vHolder = document.getElementById('recentVehicles');

  if(cHolder){
    cHolder.innerHTML = '';
    if(!r.citizens || r.citizens.length === 0){
      const d = document.createElement('div'); d.className='muted'; d.textContent=(settings.language==='en'?'No recent lookups':'Inga senaste uppslag');
      cHolder.appendChild(d);
    }else{
      r.citizens.forEach(c => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `<div class="main"><div class="h">${c.name}</div><div class="s">CID: ${c.citizenid}</div></div><div class="tag">${(settings.language==='en') ? 'OPEN' : 'ÖPPNA'}</div>`;
        item.addEventListener('click', () => { setTab('citizens'); openCitizen(c.citizenid); });
        cHolder.appendChild(item);
      });
    }
  }

  if(vHolder){
    vHolder.innerHTML = '';
    if(!r.vehicles || r.vehicles.length === 0){
      const d = document.createElement('div'); d.className='muted'; d.textContent=(settings.language==='en'?'No recent lookups':'Inga senaste uppslag');
      vHolder.appendChild(d);
    }else{
      r.vehicles.forEach(v => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `<div class="main"><div class="h">${v.plate}</div><div class="s">${v.vehicle || ((settings.language==='en') ? 'Vehicle' : 'Fordon')}</div></div><div class="tag">${(settings.language==='en') ? 'OPEN' : 'ÖPPNA'}</div>`;
        item.addEventListener('click', () => { setTab('vehicles'); openVehicle(v.plate); });
        vHolder.appendChild(item);
      });
    }
  }
}

function renderActivity(){
  const a = getActivity();
  const holder = document.getElementById('activityLog');
  if(!holder) return;
  holder.innerHTML = '';
  if(!a || a.length === 0){
    const d = document.createElement('div'); d.className='muted'; d.textContent=t('no_activity');
    holder.appendChild(d);
    return;
  }
  a.forEach(e => {
    const item = document.createElement('div');
    item.className='item';
    item.innerHTML = `<div class="main"><div class="h">${e.text}</div><div class="s">${formatDate(e.ts)}</div></div><div class="tag">LOGG</div>`;
    holder.appendChild(item);
  });
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('hidden'), 2300);
}

function postNUI(name, data = {}){
  return fetch(`https://${GetParentResourceName()}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data)
  }).then(r => r.json()).catch(() => ({}));
}

function setTab(tab){
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  Object.keys(views).forEach(k => {
    views[k].classList.toggle('hidden', k !== tab);
  });
  viewTitle.textContent = t(TAB_TITLES[tab] || tab);
}

function formatDate(ts){
  if(!ts) return '';
  return String(ts).replace('T',' ').replace('.000Z','');
}

function esc(s){
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function openReport(id){
  var rid = Number(id);
  if(!rid){ showToast('Ogiltigt rapport-ID'); return; }
  var data = await postNUI('getReport', { id: rid });
  if(!data || !data.ok){ showToast('Rapport hittades inte'); return; }

  var title = `#${data.id} • ${data.title}`;
  var sub = `${data.category} • ${data.author_name} • ${formatDate(data.created_at)}`;
  var body = '';

  body += `<div class="field full"><div class="k">${(settings.language==='en') ? 'CONTENT' : 'INNEHÅLL'}</div><div class="v" style="white-space:pre-wrap;font-weight:700">${esc(data.content)}</div></div>`;

  var cids = data.involved_cids || [];
  var peopleDisp = data.involved_people_display || null;
  var plates = data.involved_plates || [];
  if(cids.length || plates.length){
    body += `<div style="height:10px"></div>`;
  }
  if((peopleDisp && peopleDisp.length) || cids.length){
    var txt = (peopleDisp && peopleDisp.length) ? peopleDisp.join(', ') : cids.join(', ');
    body += `<div class="field full"><div class="k">INBLANDADE PERSONER</div><div class="v" style="white-space:pre-wrap;font-weight:800">${esc(txt)}</div></div>`;
  }
  if(plates.length){
    body += `<div class="field full"><div class="k">INBLANDADE FORDON (REGNR)</div><div class="v" style="white-space:pre-wrap;font-weight:800">${esc(plates.join(', '))}</div></div>`;
  }

  showModal(title, sub, body);
  addActivity(`Visade rapport: #${data.id} • ${data.title}`);
}

function buildFields(obj){
  const container = document.createElement('div');
  container.className = 'profile';
  for(const [k,v] of Object.entries(obj)){
    const field = document.createElement('div');
    field.className = 'field';
    const kk = document.createElement('div');
    kk.className = 'k';
    kk.textContent = k.toUpperCase();
    const vv = document.createElement('div');
    vv.className = 'v';
    vv.textContent = (v === null || v === undefined || v === '') ? '—' : String(v);
    field.appendChild(kk);
    field.appendChild(vv);
    container.appendChild(field);
  }
  return container;
}

function renderList(container, rows, emptyText){
  container.innerHTML = '';
  if(!rows || rows.length === 0){
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = emptyText || ((settings.language==='en') ? 'No results' : 'Inga träffar');
    container.appendChild(div);
    return;
  }
  rows.forEach(r => container.appendChild(r));
}


async function refreshCurrent(){
  var tab = getActiveTab();
  if(tab === 'dashboard'){ await loadDashboard(); return; }
  if(tab === 'citizens'){
    if(currentCitizenId){ await openCitizen(currentCitizenId); return; }
    await searchCitizens(); return;
  }
  if(tab === 'vehicles'){
    if(currentVehiclePlate){ await openVehicle(currentVehiclePlate); return; }
    await searchVehicles(); return;
  }
  if(tab === 'reports'){ initReportPeopleAutocomplete(); await loadReports(); return; }
  if(tab === 'warrants'){ await loadWarrants(); return; }
  if(tab === 'bolos'){ await loadBolos(); return; }
  if(tab === 'settings'){ renderRecent(); renderActivity(); return; }
}

// Dashboard
async function loadDashboard(){
  const data = await postNUI('getDashboard', {});
  if(!data || data.ok === false){
    showToast((settings.language==='en'?'Could not load overview':'Kunde inte ladda översikt'));
    return;
  }
  document.getElementById('statReports').textContent = coalesce(data.reports , 0);
  document.getElementById('statWarrants').textContent = coalesce(data.warrants , 0);
  document.getElementById('statBolos').textContent = coalesce(data.bolos , 0);
  document.getElementById('statWantedVehicles').textContent = coalesce(data.wantedVehicles , 0);

  const list = document.getElementById('dashboardReports');
  list.innerHTML = '';
  (data.latestReports || []).forEach(r => {
    const item = document.createElement('div');
    item.className = 'item';
    item.style.cursor = 'pointer';
    const main = document.createElement('div');
    main.className = 'main';
    main.innerHTML = `<div class="h">#${r.id} • ${r.title}</div><div class="s">${r.category} • ${r.author_name} • ${formatDate(r.created_at)}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class=\"tag\">${(settings.language==='en') ? 'OPEN' : 'ÖPPNA'}</div>`;
    item.appendChild(main);
    item.appendChild(right);
    item.addEventListener('click', () => openReport(r.id));
    list.appendChild(item);
  });

  if((data.latestReports || []).length === 0){
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = (settings.language==='en' ? 'No reports' : 'Inga rapporter');
    list.appendChild(div);
  }

  // Efterlysta fordon (klickbara)
  var wl = document.getElementById('dashboardWantedVehicles');
  if(wl){
    wl.innerHTML = '';
    var wanted = data.latestWantedVehicles || [];
    if(!wanted.length){
      var d1 = document.createElement('div');
      d1.className = 'muted';
      d1.textContent = (settings.language==='en' ? 'No wanted vehicles' : 'Inga efterlysta fordon');
      wl.appendChild(d1);
    }else{
      wanted.forEach(function(v){
        var item = document.createElement('div');
        item.className = 'item';
        item.style.cursor = 'pointer';
        var main = document.createElement('div');
        main.className = 'main';
        var sub = [];
        if(v.vehicle && v.vehicle !== '') sub.push(v.vehicle);
        if(v.reason && v.reason !== '') sub.push((settings.language==='en' ? 'Reason: ' : 'Skäl: ') + v.reason);
        if(v.created_by_name && v.created_by_name !== '') sub.push(v.created_by_name);
        sub.push(formatDate(v.created_at));
        main.innerHTML = '<div class="h">' + esc(v.plate) + ' • EFTERLYST</div><div class="s">' + esc(sub.join(' • ')) + '</div>';
        var right = document.createElement('div');
        right.innerHTML = '<div class="tag tag-danger">' + ((settings.language==='en') ? 'OPEN' : 'ÖPPNA') + '</div>';
        item.appendChild(main);
        item.appendChild(right);
        item.addEventListener('click', function(){ setTab('vehicles'); openVehicle(v.plate); });
        wl.appendChild(item);
      });
    }
  }

  // Aktiva efterlysningar (klickbara)
  var wa = document.getElementById('dashboardWarrants');
  if(wa){
    wa.innerHTML = '';
    var warrants = data.latestWarrants || [];
    if(!warrants.length){
      var d2 = document.createElement('div');
      d2.className = 'muted';
      d2.textContent = (settings.language==='en' ? 'No active warrants' : 'Inga aktiva efterlysningar');
      wa.appendChild(d2);
    }else{
      warrants.forEach(function(w){
        var item2 = document.createElement('div');
        item2.className = 'item';
        item2.style.cursor = 'pointer';
        var main2 = document.createElement('div');
        main2.className = 'main';
        var sub2 = [];
        if(w.reason) sub2.push((settings.language==='en' ? 'Reason: ' : 'Skäl: ') + w.reason);
        if(w.issued_by_name) sub2.push(w.issued_by_name);
        sub2.push(formatDate(w.created_at));
        main2.innerHTML = '<div class="h">' + esc(w.target_name || (settings.language==='en' ? 'Unknown' : 'Okänd')) + '</div><div class="s">CID: ' + esc(w.target_cid || '') + ' • ' + esc(sub2.join(' • ')) + '</div>';
        var right2 = document.createElement('div');
        right2.innerHTML = '<div class="tag">' + ((settings.language==='en') ? 'OPEN' : 'ÖPPNA') + '</div>';
        item2.appendChild(main2);
        item2.appendChild(right2);
        item2.addEventListener('click', function(){ setTab('citizens'); openCitizen(w.target_cid); });
        wa.appendChild(item2);
      });
    }
  }
}

// Personsök
async function searchCitizens(){
  const q = document.getElementById('citizenQuery').value.trim();
  const res = await postNUI('searchCitizens', { query: q });
  const list = document.getElementById('citizenResults');
  list.innerHTML = '';
  document.getElementById('citizenProfileCard').classList.add('hidden');
  var lc = document.getElementById('citizenLicenseLogsCard');
  if(lc) lc.classList.add('hidden');

  if(!res.ok){ showToast((settings.language==='en'?'No access or an error occurred':'Ingen behörighet eller fel')); return; }
  if(!res.results || res.results.length === 0){ showToast((settings.language==='en'?'No results':'Inga träffar')); return; }

  res.results.forEach(r => {
    const item = document.createElement('div');
    item.className = 'item';
    item.style.cursor = 'pointer';
    item.style.cursor = 'pointer';
    const main = document.createElement('div');
    main.className = 'main';
    const sub = [
      `CID: ${r.citizenid}`,
      r.dob ? `${(settings.language==='en') ? 'DOB' : 'Född'}: ${r.dob}` : null,
      r.gender ? `${(settings.language==='en') ? 'Gender' : 'Kön'}: ${r.gender}` : null
    ].filter(Boolean).join(' • ');
    main.innerHTML = `<div class="h">${r.name}</div><div class="s">${sub}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="tag" data-act="profile">PROFIL</div><div class="tag tag-ghost" data-act="records">REGISTER</div><div class="tag tag-ghost" data-act="logs">LOGG</div>`;
    item.appendChild(main);
    item.appendChild(right);
    right.querySelectorAll('.tag').forEach(function(t){
      t.addEventListener('click', function(e){
        e.stopPropagation();
        var act = t.getAttribute('data-act');
        if(act === 'records') openCitizenAndJump(r.citizenid, 'records');
        else if(act === 'logs') openCitizenAndJump(r.citizenid, 'logs');
        else openCitizenAndJump(r.citizenid, null);
      });
    });
    item.addEventListener('click', () => openCitizen(r.citizenid));
    list.appendChild(item);
  });
}

function openCitizenAndJump(cid, section){
  openCitizenJump = section || null;
  openCitizen(cid);
}

async function openCitizen(cid){
  const data = await postNUI('getCitizen', { citizenid: cid });
  if(!data.ok){ showToast('Profil hittades inte'); return; }

  currentCitizenId = data.citizenid;

  // Behörighetslogg
  var licLogRes = await postNUI('getLicenseLogs', { citizenid: data.citizenid });
  currentLicenseLogs = (licLogRes && licLogRes.ok && licLogRes.logs) ? licLogRes.logs : [];

  addRecentCitizen({ citizenid: data.citizenid, name: data.name });
  addActivity((settings.language==='en' ? `Opened person: ${data.name} (${data.citizenid})` : `Öppnade person: ${data.name} (${data.citizenid})`));

  const card = document.getElementById('citizenProfileCard');
  const holder = document.getElementById('citizenProfile');
  holder.innerHTML = '';

  const fields = {
    Namn: data.name,
    CitizenID: data.citizenid,
    Telefon: data.phone,
    [(settings.language==='en' ? 'Date of birth' : 'Födelsedatum')]: data.dob,
    [(settings.language==='en' ? 'Gender' : 'Kön')]: data.gender,
    Nationalitet: data.nationality,
    Yrke: ((data.job && (data.job.label || data.job.name)) || '—'),
    Anropssignal: data.callsign || '—'
  };
  holder.appendChild(buildFields(fields));

  const warrants = (data.warrants || []).map(w => `#${w.id} • ${w.reason} • ${w.issued_by_name}`).join('\n');
  const wField = document.createElement('div');
  wField.className = 'field full';
  wField.innerHTML = `<div class="k">AKTIVA EFTERLYSNINGAR</div><div class="v" style="white-space:pre-line">${warrants || '—'}</div>`;
  holder.appendChild(wField);

  // Behörigheter / licenser
  var licences = data.licenses || {};
  var driverOk = !!licences.driver;
  var weaponOk = !!licences.weapon;
  var licField = document.createElement('div');
  licField.className = 'field full';
  licField.innerHTML = `
    <div class="k">${(settings.language==='en') ? 'LICENSES' : 'BEHÖRIGHETER'}</div>
    <div class="lic-grid">
      <div class="lic-row">
        <div>
          <div class="lic-name">${(settings.language==='en') ? 'Driver license' : 'Körkort'}</div>
          <div class="muted">${driverOk ? 'Giltigt' : 'Indraget / saknas'}</div>
        </div>
        <div class="lic-actions">
          <div class="tag ${driverOk ? 'tag-ok' : 'tag-danger'}">${driverOk ? 'GILTIGT' : 'INDRAGET'}</div>
          <button class="btn btn-ghost" id="btnToggleDriver">${driverOk ? ((settings.language==='en') ? 'Revoke driver license' : 'Dra körkort') : ((settings.language==='en') ? 'Restore' : 'Återställ')}</button>
        </div>
      </div>

      <div class="lic-row">
        <div>
          <div class="lic-name">Vapenlicens</div>
          <div class="muted">${weaponOk ? 'Giltig' : 'Indragen / saknas'}</div>
        </div>
        <div class="lic-actions">
          <div class="tag ${weaponOk ? 'tag-ok' : 'tag-danger'}">${weaponOk ? 'GILTIG' : 'INDRAGEN'}</div>
          <button class="btn btn-ghost" id="btnToggleWeapon">${weaponOk ? ((settings.language==='en') ? 'Revoke license' : 'Dra licens') : ((settings.language==='en') ? 'Restore' : 'Återställ')}</button>
        </div>
      </div>
    </div>
  `;
  holder.appendChild(licField);

  // Bind actions (utan modern JS-syntax för CEF-kompat)
  setTimeout(function(){
    var b1 = document.getElementById('btnToggleDriver');
    if(b1){
      b1.addEventListener('click', async function(){
        if(!currentCitizenId) return;
        var newStatus = driverOk ? false : true;
        var actionText = driverOk ? 'dra körkort' : 'återställa körkort';
        var body = `<div class="muted" style="font-weight:800">Bekräfta att du vill ${actionText} för <b>${esc(data.name)}</b> (${esc(data.citizenid)}).</div>`
                 + `<div style="height:10px"></div>`
                 + `<div class="k" style="margin-bottom:6px">Anledning</div>`
                 + `<textarea class="textarea" id="licReason" placeholder="Skriv en kort anledning (valfritt)"></textarea>`
                 + `<div class="row" style="justify-content:flex-end;margin-top:12px">`
                 + `<button class="btn btn-ghost" id="cancelLic">Avbryt</button>`
                 + `<button class="btn" id="confirmLic">Bekräfta</button>`
                 + `</div>`;
        showModal((settings.language==='en' ? 'Action: Driver license' : 'Åtgärd: Körkort'), (settings.language==='en' ? 'License management' : 'Behörighetshantering'), body);
        setTimeout(function(){
          var cCancel = document.getElementById('cancelLic');
          if(cCancel){ cCancel.addEventListener('click', function(){ hideModal(); }); }
          var c = document.getElementById('confirmLic');
          if(!c) return;
          c.addEventListener('click', async function(){
            var reasonEl = document.getElementById('licReason');
            var reason = reasonEl ? reasonEl.value.trim() : '';
            var r = await postNUI('setLicenseStatus', { citizenid: currentCitizenId, license: 'driver', status: newStatus, reason: reason });
            hideModal();
            if(!r || r.ok === false){
              showToast((settings.language==='en' ? 'Could not update license status' : 'Kunde inte uppdatera behörighet'));
              return;
            }
            showToast('Uppdaterat');
            openCitizen(currentCitizenId);
            addActivity((newStatus ? 'Återställde' : 'Drog') + ' körkort: ' + data.name);
          });
        }, 0);
      });
    }

    var b2 = document.getElementById('btnToggleWeapon');
    if(b2){
      b2.addEventListener('click', async function(){
        if(!currentCitizenId) return;
        var newStatus = weaponOk ? false : true;
        var actionText = weaponOk ? 'dra vapenlicens' : 'återställa vapenlicens';
        var body = `<div class="muted" style="font-weight:800">Bekräfta att du vill ${actionText} för <b>${esc(data.name)}</b> (${esc(data.citizenid)}).</div>`
                 + `<div style="height:10px"></div>`
                 + `<div class="k" style="margin-bottom:6px">Anledning</div>`
                 + `<textarea class="textarea" id="wepReason" placeholder="Skriv en kort anledning (valfritt)"></textarea>`
                 + `<div class="row" style="justify-content:flex-end;margin-top:12px">`
                 + `<button class="btn btn-ghost" id="cancelWep">Avbryt</button>`
                 + `<button class="btn" id="confirmWep">Bekräfta</button>`
                 + `</div>`;
        showModal((settings.language==='en' ? 'Action: Weapon license' : 'Åtgärd: Vapenlicens'), (settings.language==='en' ? 'License management' : 'Behörighetshantering'), body);
        setTimeout(function(){
          var cCancel = document.getElementById('cancelWep');
          if(cCancel){ cCancel.addEventListener('click', function(){ hideModal(); }); }
          var c = document.getElementById('confirmWep');
          if(!c) return;
          c.addEventListener('click', async function(){
            var reasonEl = document.getElementById('wepReason');
            var reason = reasonEl ? reasonEl.value.trim() : '';
            var r2 = await postNUI('setLicenseStatus', { citizenid: currentCitizenId, license: 'weapon', status: newStatus, reason: reason });
            hideModal();
            if(!r2 || r2.ok === false){
              showToast((settings.language==='en' ? 'Could not update license status' : 'Kunde inte uppdatera behörighet'));
              return;
            }
            showToast('Uppdaterat');
            openCitizen(currentCitizenId);
            addActivity((newStatus ? 'Återställde' : 'Drog') + ' vapenlicens: ' + data.name);
          });
        }, 0);
      });
    }
  }, 0);

  // Register / Rapporter / Loggar
  var rs = document.getElementById('citizenRecordsSearch'); if(rs) rs.value = '';
  var ls = document.getElementById('licenseLogsSearch'); if(ls) ls.value = '';
  var ps = document.getElementById('citizenReportsSearch'); if(ps) ps.value = '';

  currentCitizenReports = data.reports || [];
  renderCitizenReports(currentCitizenReports || [], '');

  renderCitizenRecords(data.records || []);
  renderLicenseLogs(currentLicenseLogs || []);

  card.classList.remove('hidden');
  var lcard = document.getElementById('citizenLicenseLogsCard');
  if(lcard){ lcard.classList.remove('hidden'); }

  // Hoppa till vald sektion (Register/Logg) om användaren klickade direkt från sök
  setTimeout(function(){
    try{
      if(openCitizenJump === 'records'){
        var el = document.getElementById('citizenRecordsSearch') || document.getElementById('citizenRecords');
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }else if(openCitizenJump === 'logs'){
        var el2 = document.getElementById('licenseLogsSearch') || document.getElementById('citizenLicenseLogsCard');
        if(el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }catch(e){}
    openCitizenJump = null;
  }, 60);

}


function renderCitizenRecords(records){
  var list = document.getElementById('citizenRecords');
  if(!list) return;
  list.innerHTML = '';

  if(!records || records.length === 0){
    var div = document.createElement('div');
    div.className = 'muted';
    div.textContent = (settings.language==='en' ? 'No notes. This person is not registered as suspected/convicted in the MDT.' : 'Inga noteringar. Personen är inte registrerad som misstänkt/dömd i MDT.');
    list.appendChild(div);
    return;
  }

  records.forEach(r => {
    var item = document.createElement('div');
    item.className = 'item';
    item.style.cursor = 'pointer';
    var main = document.createElement('div');
    main.className = 'main';
    var sub = [recordTypeLabel(r.record_type), (r.officer_name ? r.officer_name : null), formatDate(r.created_at)].filter(Boolean).join(' • ');
    main.innerHTML = `<div class="h">${esc(r.title)}</div><div class="s">${esc(sub)}</div>`;
    var right = document.createElement('div');
    right.innerHTML = `<div class="tag" data-act="profile">PROFIL</div><div class="tag tag-ghost" data-act="records">REGISTER</div><div class="tag tag-ghost" data-act="logs">LOGG</div>`;
    item.appendChild(main);
    item.appendChild(right);
    item.addEventListener('click', () => {
      var t = `${recordTypeLabel(r.record_type)} • ${r.title}`;
      var ss = `${r.officer_name ? r.officer_name : (settings.language==='en' ? 'Unknown' : 'Okänd')} • ${formatDate(r.created_at)}`;
      var body = `<div class="field full"><div class="k">DETALJER</div><div class="v" style="white-space:pre-wrap;font-weight:700">${esc(r.details || '—')}</div></div>`;
      showModal(t, ss, body);
      addActivity(`Visade registerpost: ${recordTypeLabel(r.record_type)} • ${r.title}`);
    });
    list.appendChild(item);
  });
}


function renderLicenseLogs(logs){
  var card = document.getElementById('citizenLicenseLogsCard');
  var list = document.getElementById('licenseLogs');
  if(!card || !list) return;

  list.innerHTML = '';
  logs = logs || [];
  if(!logs.length){
    var div = document.createElement('div');
    div.className = 'empty';
    div.innerHTML = '<div class="muted">' + ((settings.language==='en') ? 'No license log exists for this person.' : 'Ingen behörighetslogg finns för denna person.') + '</div>';
    list.appendChild(div);
    return;
  }

  logs.forEach(function(l){
    var item = document.createElement('div');
    item.className = 'item';
    var when = l.created_at || '';
    var action = (l.action || '').toUpperCase();
    var lic = (l.license_key || '').toLowerCase();
    var licLabel = (lic === 'driver') ? ((settings.language==='en') ? 'Driver license' : 'Körkort') : (lic === 'weapon') ? ((settings.language==='en') ? 'Weapon license' : 'Vapenlicens') : lic;
    var tagClass = (action === 'REVOKE' || l.new_status === 0) ? 'tag-danger' : 'tag-ok';
    var tagText = (action === 'REVOKE' || l.new_status === 0) ? ((settings.language==='en') ? 'REVOKED' : 'INDRAGET') : ((settings.language==='en') ? 'RESTORED' : 'ÅTERSTÄLLT');
    var by = (l.officer_name || '—');
    if(l.officer_cid){ by = by + ' (' + esc(l.officer_cid) + ')'; }
    var reason = l.reason ? esc(l.reason) : '—';

    var main = document.createElement('div');
    main.className = 'main';
    main.innerHTML = '<div class="h">' + licLabel + ' • ' + tagText + '</div>'
                   + '<div class="s">' + esc(when) + ' • ' + esc(by) + '</div>'
                   + '<div class="s">' + ((settings.language==='en') ? 'Reason: ' : 'Anledning: ') + reason + '</div>';

    var right = document.createElement('div');
    right.innerHTML = '<div class="tag ' + tagClass + '">' + tagText + '</div>';

    item.appendChild(main);
    item.appendChild(right);
    list.appendChild(item);
  });
}


async function refreshCitizenRecords(){
  if(!currentCitizenId){ showToast((settings.language==='en' ? 'No person selected' : 'Ingen person vald')); return; }
  var qEl = document.getElementById('citizenRecordsSearch');
  var q = qEl ? qEl.value.trim() : '';
  var res = await postNUI('getCitizenRecords', { citizenid: currentCitizenId, query: q });
  if(!res || !res.ok){ showToast((settings.language==='en'?'Could not fetch records':'Kunde inte hämta register')); return; }
  renderCitizenRecords(res.records || []);
}


async function refreshLicenseLogs(){
  if(!currentCitizenId){ showToast((settings.language==='en' ? 'No person selected' : 'Ingen person vald')); return; }
  var qEl = document.getElementById('licenseLogsSearch');
  var q = qEl ? qEl.value.trim() : '';
  var res = await postNUI('getLicenseLogs', { citizenid: currentCitizenId, query: q });
  if(!res || !res.ok){ showToast((settings.language==='en'?'Could not fetch license log':'Kunde inte hämta behörighetslogg')); return; }
  currentLicenseLogs = res.logs || [];
  renderLicenseLogs(currentLicenseLogs);
}


function renderCitizenReports(reports, q){
  var list = document.getElementById('citizenReports');
  var card = document.getElementById('citizenReportsCard');
  if(!list || !card) return;

  list.innerHTML = '';
  reports = reports || [];
  q = String(q || '').toLowerCase().trim();

  var filtered = reports;
  if(q){
    filtered = reports.filter(function(r){
      var hay = ((r.title||'')+' '+(r.category||'')+' '+(r.author_name||'')+' '+(r.created_at||'')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  if(!filtered.length){
    var div = document.createElement('div');
    div.className = 'empty';
    div.innerHTML = '<div class="muted">' + (q ? ((settings.language==='en') ? 'No reports match your search.' : 'Inga rapporter matchar din sökning.') : ((settings.language==='en') ? 'No reports linked to this person yet.' : 'Inga rapporter kopplade till personen ännu.')) + '</div>';
    list.appendChild(div);
    return;
  }

  filtered.forEach(function(r){
    var item = document.createElement('div');
    item.className = 'item';
    item.style.cursor = 'pointer';
    var main = document.createElement('div');
    main.className = 'main';
    var sub = [ (r.category || 'Rapport'), (r.author_name || '—'), formatDate(r.created_at) ].filter(Boolean).join(' • ');
    main.innerHTML = '<div class="h">' + esc(r.title || 'Rapport') + '</div><div class="s">' + esc(sub) + '</div>';
    var right = document.createElement('div');
    right.innerHTML = '<div class="tag">' + ((settings.language==='en') ? 'OPEN' : 'ÖPPNA') + '</div>';
    item.appendChild(main);
    item.appendChild(right);
    item.addEventListener('click', function(){
      if(r.id){ openReport(r.id); addActivity((settings.language==='en' ? 'Opened report #' : 'Öppnade rapport #') + r.id + (settings.language==='en' ? ' for ' : ' för ') + (currentCitizenName|| (settings.language==='en' ? 'person' : 'person'))); }
    });
    list.appendChild(item);
  });
}


function openAddCitizenRecordModal(){
  if(!currentCitizenId){ showToast((settings.language==='en' ? 'No person selected' : 'Ingen person vald')); return; }
  var body = '';
  body += `<div class="form">`;
  body += `<label>Typ</label>`;
  body += `<select class="input" id="recType">`;
  body += `<option value="ARANDE">${(settings.language==='en') ? 'Case' : 'Ärende'}</option>`;
  body += `<option value="MISSTANKE">${(settings.language==='en') ? 'Suspicion' : 'Misstanke'}</option>`;
  body += `<option value="DOM">Dom</option>`;
  body += `<option value="ANMARKNING">${(settings.language==='en') ? 'Annotation' : 'Anmärkning'}</option>`;
  body += `</select>`;
  body += `<label>Titel</label>`;
  body += `<input class="input" id="recTitle" placeholder="Kort rubrik">`;
  body += `<label>Detaljer</label>`;
  body += `<textarea class="input" id="recDetails" rows="7" placeholder="${(settings.language==='en') ? 'What happened?' : 'Vad har hänt?'}"></textarea>`;
  body += `<div class="row" style="justify-content:flex-end;margin-top:6px">`;
  body += `<button class="btn" id="recSave">${(settings.language==='en') ? 'Save note' : 'Spara notering'}</button>`;
  body += `</div>`;
  body += `</div>`;

  showModal('Ny notering', `CitizenID: ${currentCitizenId}`, body);

  // Bind (modal content is dynamic)
  setTimeout(() => {
    var btn = document.getElementById('recSave');
    if(!btn) return;
    btn.addEventListener('click', async () => {
      var type = getValue(document.getElementById('recType')).trim();
      var title = getValue(document.getElementById('recTitle')).trim();
      var details = getValue(document.getElementById('recDetails')).trim();
      if(!title){ showToast((settings.language==='en'?'Title is required':'Titel krävs')); return; }
      await postNUI('addCitizenRecord', { citizenid: currentCitizenId, record_type: type, title: title, details: details });
      hideModal();
      await refreshCitizenRecords();
      showToast('Notering sparad');
    });
  }, 0);
}

// Fordon
function stateLabel(state){
  // 0 = ute, 1 = i garage (vanligt i qb)
  return (Number(state) === 0) ? 'UTE' : 'I GARAGE';
}

async function searchVehicles(){
  const q = document.getElementById('vehicleQuery').value.trim();
  const res = await postNUI('searchVehicles', { query: q });
  const list = document.getElementById('vehicleResults');
  list.innerHTML = '';
  document.getElementById('vehicleProfileCard').classList.add('hidden');

  if(!res.ok){ showToast((settings.language==='en'?'No access or an error occurred':'Ingen behörighet eller fel')); return; }
  if(!res.results || res.results.length === 0){ showToast((settings.language==='en'?'No results':'Inga träffar')); return; }

  res.results.forEach(r => {
    const item = document.createElement('div');
    item.className = 'item';
    const main = document.createElement('div');
    main.className = 'main';
    const wanted = Number(r.wanted || 0) === 1 ? ' • EFTERLYST' : '';
    main.innerHTML = `<div class="h">${r.plate}${wanted}</div><div class="s">${(settings.language==='en') ? 'Owner CID' : 'Ägare CID'}: ${r.citizenid} • ${(settings.language==='en') ? 'Vehicle' : 'Fordon'}: ${r.vehicle}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="tag">${stateLabel(r.state)}</div>`;
    item.appendChild(main);
    item.appendChild(right);
    item.addEventListener('click', () => openVehicle(r.plate));
    list.appendChild(item);
  });
}

async function openVehicle(plate){
  currentVehiclePlate = plate;
  const data = await postNUI('getVehicle', { plate });
  if(!data.ok){ showToast((settings.language==='en'?'Vehicle not found':'Fordon hittades inte')); return; }

  addRecentVehicle({ plate: data.plate, vehicle: data.vehicle });
  addActivity((settings.language==='en' ? `Opened vehicle: ${data.plate} (${data.vehicle || 'Vehicle'})` : `Öppnade fordon: ${data.plate} (${data.vehicle || 'Fordon'})`));

  const card = document.getElementById('vehicleProfileCard');
  const holder = document.getElementById('vehicleProfile');
  holder.innerHTML = '';

  const wantedActive = Number((data.wanted ? data.wanted.wanted : undefined) || 0) === 1 && Number((data.wanted ? data.wanted.active : undefined) || 0) === 1;

  const fields = {
    Regnummer: data.plate,
    [(settings.language==='en' ? 'Vehicle' : 'Fordon')]: data.vehicle,
    Status: stateLabel(data.state),
    Garage: data.garage,
    [(settings.language==='en' ? 'Owner' : 'Ägare')]: `${(data.owner ? data.owner.name : undefined) || ((settings.language==='en') ? 'Unknown' : 'Okänd')} (${(data.owner ? data.owner.citizenid : undefined) || '—'})`,
    [(settings.language==='en' ? 'Wanted' : 'Efterlyst')]: wantedActive ? ((settings.language==='en') ? 'YES' : 'JA') : ((settings.language==='en') ? 'NO' : 'NEJ'),
    'BOLO aktiv': (Number((data.bolo ? data.bolo.active : undefined) || 0) === 1) ? 'JA' : 'NEJ'
  };
  holder.appendChild(buildFields(fields));

  // Visa efterlysningsskäl tydligt
  if(wantedActive && (data.wanted && data.wanted.reason) && data.wanted.reason !== ''){
    const rField = document.createElement('div');
    rField.className = 'field full';
    rField.innerHTML = `<div class="k">${(settings.language==='en') ? 'WARRANT REASON' : 'SKÄL TILL EFTERLYSNING'}</div><div class="v" style="white-space:pre-wrap;font-weight:800">${esc(data.wanted.reason)}</div>`;
    holder.appendChild(rField);
  }

  // BOLO-info
  if(Number((data.bolo ? data.bolo.active : undefined) || 0) === 1){
    const bField = document.createElement('div');
    bField.className = 'field full';
    bField.innerHTML = `<div class="k">BOLO</div><div class="v">${data.bolo.description || '—'}${data.bolo.last_seen ? '<br><span class="muted">Senast sedd: '+data.bolo.last_seen+'</span>' : ''}</div>`;
    holder.appendChild(bField);
  }

  // Efterlyst-hantering
  const action = document.createElement('div');
  action.className = 'field full';

  const currentReason = wantedActive ? ((data.wanted ? data.wanted.reason : undefined) || '') : '';
  const currentBy = wantedActive ? ((data.wanted ? data.wanted.created_by_name : undefined) || '') : '';

  action.innerHTML = `
    <div class="k">EFTERLYSNING (FORDON)</div>
    <div class="v">
      <div class="row" style="gap:10px; align-items:center; margin-top:8px;">
        <input class="input" id="wantedReason" placeholder="${(settings.language==='en') ? 'Reason (e.g. hit and run, theft, serious crime)' : 'Anledning (t.ex. smitning, stöld, grovt brott)'}" value="${currentReason.replace(/"/g,'&quot;')}">
        <button class="btn" id="btnWantedSet">${wantedActive ? 'Uppdatera' : 'Markera som efterlyst'}</button>
        <button class="btn btn-danger" id="btnWantedClear" ${wantedActive ? '' : 'disabled'}>Avmarkera</button>
      </div>
      ${wantedActive ? `<div class="muted" style="margin-top:8px;">${(settings.language==='en') ? 'Created by' : 'Skapad av'}: ${currentBy || '—'} • ${formatDate((data.wanted ? data.wanted.created_at : undefined))}</div>` : `<div class="muted" style="margin-top:8px;">${(settings.language==='en') ? 'No active wanted flag on this vehicle.' : 'Ingen aktiv efterlysning på detta fordon.'}</div>`}
    </div>
  `;
  holder.appendChild(action);

  // bind actions
  setTimeout(() => {
    const btnSet = document.getElementById('btnWantedSet');
    const btnClear = document.getElementById('btnWantedClear');
    const reasonEl = document.getElementById('wantedReason');

    if(btnSet) btnSet.addEventListener('click', async () => {
      const reason = getValue(reasonEl).trim();
      if(!reason){ showToast((settings.language==='en'?'Reason is required':'Anledning krävs')); return; }
      await postNUI('setVehicleWanted', { plate: data.plate, reason });
      showToast((settings.language==='en'?'Vehicle flagged as wanted':'Fordon markerat som efterlyst'));
      addActivity(`Markerade fordon som efterlyst: ${data.plate} • ${reason}`);
      await openVehicle(data.plate);
      await loadDashboard();
    });

    if(btnClear) btnClear.addEventListener('click', async () => {
      await postNUI('clearVehicleWanted', { plate: data.plate });
      showToast('Efterlysning borttagen');
      addActivity(`Avmarkerade efterlyst fordon: ${data.plate}`);
      await openVehicle(data.plate);
      await loadDashboard();
    });
  }, 0);

  card.classList.remove('hidden');
}

// Rapporter

// ----------------------------
// Report: people autocomplete (typeahead)
// ----------------------------
var reportPeopleSelected = [];
    var reportPeopleInitBound = false;

function syncReportPeopleHidden(){
  var hid = document.getElementById('reportCids');
  if(hid){
    hid.value = reportPeopleSelected.map(function(p){ return p.citizenid; }).join(', ');
  }
}

function renderReportPeopleChips(){
  var chips = document.getElementById('reportPeopleChips');
  if(!chips) return;
  chips.innerHTML = '';
  reportPeopleSelected.forEach(function(p){
    var c = document.createElement('div');
    c.className = 'chip';
    c.innerHTML = '<span>'+escapeHtml(p.name || ((settings.language==='en') ? 'Unknown' : 'Okänd'))+'</span><span class="cid">'+escapeHtml(p.citizenid)+'</span><span class="x" title="' + ((settings.language==='en') ? 'Remove' : 'Ta bort') + '">×</span>';
    c.querySelector('.x').addEventListener('click', function(){
      reportPeopleSelected = reportPeopleSelected.filter(function(pp){ return pp.citizenid !== p.citizenid; });
      syncReportPeopleHidden();
      renderReportPeopleChips();
    });
    chips.appendChild(c);
  });
}

function addReportPerson(p){
  if(!p || !p.citizenid) return;
  var exists = reportPeopleSelected.some(function(x){ return x.citizenid === p.citizenid; });
  if(exists) return;
  reportPeopleSelected.push({ citizenid: String(p.citizenid), name: String(p.name || ((settings.language==='en') ? 'Unknown' : 'Okänd')) });
  syncReportPeopleHidden();
  renderReportPeopleChips();
}

function hidePeopleSuggest(){
  var box = document.getElementById('reportPeopleSuggest');
  if(box){ box.classList.add('hidden'); box.innerHTML = ''; }
}

var _peopleSuggestTimer = null;

async function fetchPeopleSuggestions(q){
  q = String(q || '').trim();
  if(!q){ hidePeopleSuggest(); return; }
  var res = await postNUI('suggestCitizens', { query: q, limit: 8 });
  var box = document.getElementById('reportPeopleSuggest');
  if(!box) return;
  box.innerHTML = '';
  if(!res || !res.ok || !(res.results || []).length){
    hidePeopleSuggest();
    return;
  }
  (res.results || []).forEach(function(r){
    var row = document.createElement('div');
    row.className = 'srow';
    row.innerHTML = '<div>'+escapeHtml(r.name || ((settings.language==='en') ? 'Unknown' : 'Okänd'))+'</div><div class="cid">'+escapeHtml(r.citizenid)+'</div>';
    row.addEventListener('click', function(){
      addReportPerson({ citizenid: r.citizenid, name: r.name });
      var inp = document.getElementById('reportPeopleInput');
      if(inp) inp.value = '';
      hidePeopleSuggest();
    });
    box.appendChild(row);
  });
  box.classList.remove('hidden');
}

function initReportPeopleAutocomplete(){
  var inp = document.getElementById('reportPeopleInput');
  var box = document.getElementById('reportPeopleSuggest');
  if(!inp || !box) return;

  // reset when opening view
  reportPeopleSelected = [];
  syncReportPeopleHidden();
  renderReportPeopleChips();
  hidePeopleSuggest();

  if(reportPeopleInitBound) return;
  reportPeopleInitBound = true;

  inp.addEventListener('input', function(){
    var q = inp.value;
    if(_peopleSuggestTimer) clearTimeout(_peopleSuggestTimer);
    _peopleSuggestTimer = setTimeout(function(){ fetchPeopleSuggestions(q); }, 160);
  });

  inp.addEventListener('keydown', async function(e){
    if(e.key === 'Escape'){
      hidePeopleSuggest();
      return;
    }
    if(e.key === 'Enter' || e.key === ','){
      e.preventDefault();
      var v = String(inp.value || '').trim();
      if(!v) return;
      var res = await postNUI('suggestCitizens', { query: v, limit: 3 });
      if(res && res.ok && (res.results || []).length === 1){
        addReportPerson(res.results[0]);
        inp.value = '';
        hidePeopleSuggest();
        return;
      }
      if(res && res.ok && (res.results || []).length){
        await fetchPeopleSuggestions(v);
      }else{
        showToast((settings.language==='en'?'No matching person found':'Ingen träff på personen'));
      }
    }
  });

  document.addEventListener('click', function(ev){
    if(!ev || !ev.target) return;
    if(ev.target === inp) return;
    if(ev.target.closest && ev.target.closest('#reportPeopleSuggest')) return;
    hidePeopleSuggest();
  });
}

function populateCategories(){
  const sel = document.getElementById('reportCategory');
  sel.innerHTML = '';
  (categories || []).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

async function loadReports(){
  const res = await postNUI('listReports', { limit: 50 });
  const list = document.getElementById('reportList');
  list.innerHTML = '';
  if(!res.ok){ showToast((settings.language==='en'?'No access or an error occurred':'Ingen behörighet eller fel')); return; }
  (res.results || []).forEach(r => {
    const item = document.createElement('div');
    item.className = 'item';
    item.style.cursor = 'pointer';
    const main = document.createElement('div');
    main.className = 'main';
    main.innerHTML = `<div class="h">#${r.id} • ${r.title}</div><div class="s">${r.category} • ${r.author_name} • ${formatDate(r.created_at)}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="tag">LOGG</div>`;
    item.appendChild(main); item.appendChild(right);
    item.addEventListener('click', () => openReport(r.id));
    list.appendChild(item);
  });

  if((res.results || []).length === 0){
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = (settings.language==='en' ? 'No reports' : 'Inga rapporter');
    list.appendChild(div);
  }
}

async function saveReport(){
  const category = document.getElementById('reportCategory').value;
  const title = document.getElementById('reportTitle').value.trim();
  const content = document.getElementById('reportContent').value.trim();
  const people = (document.getElementById('reportCids').value || '').split(',').map(function(s){return (s||'').trim();}).filter(function(v){return !!v;});
  const plates = document.getElementById('reportPlates').value.split(',').map(s => s.trim()).filter(Boolean);

  if(!title || !content){ showToast((settings.language==='en'?'Title and content are required':'Titel och innehåll krävs')); return; }
  await postNUI('addReport', { category, title, content, involved_people: people, involved_plates: plates });
  showToast('Rapport skickad');
  addActivity(`Skapade rapport: ${title}`);
  document.getElementById('reportTitle').value = '';
  document.getElementById('reportContent').value = '';
  document.getElementById('reportCids').value = '';
  var rpi = document.getElementById('reportPeopleInput');
  if(rpi) rpi.value = '';
  reportPeopleSelected = [];
  renderReportPeopleChips();
  document.getElementById('reportPlates').value = '';
  await loadReports();
  await loadDashboard();
}

// Efterlysningar (warrants)
async function loadWarrants(){
  const res = await postNUI('listWarrants', { onlyActive: true, limit: 100 });
  const list = document.getElementById('warrantList');
  list.innerHTML = '';
  if(!res.ok){ showToast((settings.language==='en'?'No access or an error occurred':'Ingen behörighet eller fel')); return; }
  (res.results || []).forEach(w => {
    const item = document.createElement('div');
    item.className = 'item';
    const main = document.createElement('div');
    main.className = 'main';
    main.innerHTML = `<div class="h">#${w.id} • ${w.target_name}</div><div class="s">CID: ${w.target_cid} • ${w.reason}</div>`;
    const right = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger';
    btn.textContent = (settings.language==='en' ? 'Clear' : 'Rensa');
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await postNUI('clearWarrant', { id: w.id });
      showToast('Efterlysning rensad');
      await loadWarrants();
      await loadDashboard();
    });
    right.appendChild(btn);
    item.appendChild(main); item.appendChild(right);
    list.appendChild(item);
  });

  if((res.results || []).length === 0){
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = 'Inga aktiva efterlysningar';
    list.appendChild(div);
  }
}

async function saveWarrant(){
  const target_cid = document.getElementById('warrantTargetCid').value.trim();
  const target_name = document.getElementById('warrantTargetName').value.trim();
  const reason = document.getElementById('warrantReason').value.trim();
  const expires_at = document.getElementById('warrantExpires').value.trim();

  if(!target_cid || !reason){ showToast((settings.language==='en'?'Citizen ID and reason are required':'CitizenID och anledning krävs')); return; }
  await postNUI('addWarrant', { target_cid, target_name, reason, expires_at: expires_at || '' });
  showToast('Efterlysning skapad');
  addActivity(`Skapade efterlysning: ${target_cid} • ${reason}`);
  document.getElementById('warrantTargetCid').value = '';
  document.getElementById('warrantTargetName').value = '';
  document.getElementById('warrantReason').value = '';
  document.getElementById('warrantExpires').value = '';
  await loadWarrants();
  await loadDashboard();
}

// BOLO
async function loadBolos(){
  const res = await postNUI('listBolos', { onlyActive: true, limit: 100 });
  const list = document.getElementById('boloList');
  list.innerHTML = '';
  if(!res.ok){ showToast((settings.language==='en'?'No access or an error occurred':'Ingen behörighet eller fel')); return; }
  (res.results || []).forEach(b => {
    const item = document.createElement('div');
    item.className = 'item';
    const main = document.createElement('div');
    main.className = 'main';
    const typ = (b.type === 'VEHICLE') ? 'FORDON' : 'PERSON';
    main.innerHTML = `<div class="h">#${b.id} • ${typ}</div><div class="s">${b.description}${b.plate ? ' • Reg: '+b.plate : ''}${b.last_seen ? ' • Senast sedd: '+b.last_seen : ''}</div>`;
    const right = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger';
    btn.textContent = (settings.language==='en' ? 'Clear' : 'Rensa');
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await postNUI('clearBolo', { id: b.id });
      showToast('BOLO rensad');
      await loadBolos();
      await loadDashboard();
    });
    right.appendChild(btn);
    item.appendChild(main); item.appendChild(right);
    list.appendChild(item);
  });

  if((res.results || []).length === 0){
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = (settings.language==='en' ? 'No active BOLO' : 'Inga aktiva BOLO');
    list.appendChild(div);
  }
}

async function saveBolo(){
  const type = document.getElementById('boloType').value;
  const description = document.getElementById('boloDescription').value.trim();
  const last_seen = document.getElementById('boloLastSeen').value.trim();
  const plate = document.getElementById('boloPlate').value.trim();

  if(!description){ showToast((settings.language==='en'?'Description is required':'Beskrivning krävs')); return; }
  await postNUI('addBolo', { type, description, last_seen, plate });
  showToast('BOLO skapad');
  addActivity(`Skapade BOLO: ${type === 'VEHICLE' ? 'FORDON' : 'PERSON'} • ${description}`);
  document.getElementById('boloDescription').value = '';
  document.getElementById('boloLastSeen').value = '';
  document.getElementById('boloPlate').value = '';
  await loadBolos();
  await loadDashboard();
}

// Nav and quick actions
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tab = btn.dataset.tab;
    setTab(tab);
    if(tab === 'dashboard') await loadDashboard();
    if(tab === 'reports'){ initReportPeopleAutocomplete(); await loadReports(); }
    if(tab === 'warrants') await loadWarrants();
    if(tab === 'bolos') await loadBolos();
  });
});

document.querySelectorAll('[data-quick]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tab = btn.dataset.quick;
    setTab(tab);
    if(tab === 'dashboard') await loadDashboard();
    if(tab === 'reports'){ initReportPeopleAutocomplete(); await loadReports(); }
    if(tab === 'warrants') await loadWarrants();
    if(tab === 'bolos') await loadBolos();
  });
});

// Buttons
btnClose.addEventListener('click', () => postNUI('close', {}));
var btnGlobalRefresh = document.getElementById('btnGlobalRefresh');
if(btnGlobalRefresh){ btnGlobalRefresh.addEventListener('click', async function(){ await runBootSequence(lastSplashCfg); showToast('Uppdaterat'); }); }

document.getElementById('btnCitizenSearch').addEventListener('click', searchCitizens);
var btnAddRec = document.getElementById('btnAddCitizenRecord');
if(btnAddRec) btnAddRec.addEventListener('click', openAddCitizenRecordModal);
var btnRefRec = document.getElementById('btnRefreshCitizenRecord');
if(btnRefRec) btnRefRec.addEventListener('click', refreshCitizenRecords);
var btnRefLic = document.getElementById('btnRefreshLicenseLogs');
if(btnRefLic) btnRefLic.addEventListener('click', refreshLicenseLogs);
var btnRefRep = document.getElementById('btnRefreshCitizenReports');
if(btnRefRep) btnRefRep.addEventListener('click', refreshCitizenReports);

var recSearch = document.getElementById('citizenRecordsSearch');
if(recSearch){
  recSearch.addEventListener('input', function(){
    if(recSearchTimer) clearTimeout(recSearchTimer);
    recSearchTimer = setTimeout(function(){ refreshCitizenRecords(); }, 220);
  });
}

var licSearch = document.getElementById('licenseLogsSearch');
if(licSearch){
  licSearch.addEventListener('input', function(){
    if(licSearchTimer) clearTimeout(licSearchTimer);
    licSearchTimer = setTimeout(function(){ refreshLicenseLogs(); }, 220);
  });
}

var repSearch = document.getElementById('citizenReportsSearch');
if(repSearch){
  repSearch.addEventListener('input', function(){
    if(repSearchTimer) clearTimeout(repSearchTimer);
    repSearchTimer = setTimeout(function(){
      renderCitizenReports(currentCitizenReports || [], repSearch.value.trim());
    }, 120);
  });
}
document.getElementById('btnVehicleSearch').addEventListener('click', searchVehicles);
document.getElementById('btnReportSave').addEventListener('click', saveReport);
document.getElementById('btnReportsRefresh').addEventListener('click', loadReports);
document.getElementById('btnWarrantSave').addEventListener('click', saveWarrant);
document.getElementById('btnWarrantsRefresh').addEventListener('click', loadWarrants);
document.getElementById('btnBoloSave').addEventListener('click', saveBolo);
document.getElementById('btnBolosRefresh').addEventListener('click', loadBolos);
document.getElementById('btnDashboardReportsRefresh').addEventListener('click', loadDashboard);
var btnDW = document.getElementById('btnDashboardWantedRefresh');
if(btnDW) btnDW.addEventListener('click', loadDashboard);
var btnDWa = document.getElementById('btnDashboardWarrantsRefresh');
if(btnDWa) btnDWa.addEventListener('click', loadDashboard);

// Modal events
if(modalClose) modalClose.addEventListener('click', hideModal);
if(modal){
  modal.addEventListener('click', (e) => {
    // Klick på backdrop stänger
    if(e.target === modal){
      hideModal();
    }
  });
}

// Keyboard: ESC closes
window.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    // Stäng först modal om den är öppen, annars stäng MDT
    if(modal && !modal.classList.contains('hidden')){
      hideModal();
    }else{
      postNUI('close', {});
    }
  }
  if(e.key === 'Enter'){
    const active = getActiveTab();
    if(active === 'citizens') searchCitizens();
    if(active === 'vehicles') searchVehicles();
  }
});

// NUI messages from Lua
window.addEventListener('message', async (event) => {
  const data = event.data || {};
  if(data.action === 'open'){
    presets = data.presets || [];
    categories = data.categories || [];
    populateCategories();

    // Ladda inställningar + UI state
    settings = loadSettings();
    bindSettingsUI();
    hydrateSettingsUI();
    applySettings();
    renderRecent();
    renderActivity();

    root.classList.remove('hidden');

    // Splash / inloggning
    var splashCfg = data.splash || {};
    lastSplashCfg = splashCfg;

    // Kör boot-sekvens (samma används vid Refresh)
    await runBootSequence(splashCfg);
    showToast('MDT ansluten');

  }
  if(data.action === 'close'){
    root.classList.add('hidden');
    var splash = document.getElementById('splash');
    if(splash){ splash.classList.add('hidden'); splash.setAttribute('aria-hidden','true'); }
  }
});


async function refreshCitizenReports(){
  if(!currentCitizenId){ showToast((settings.language==='en' ? 'No person selected' : 'Ingen person vald')); return; }
  // Ladda om allt (inkl rapporter) men behåll tabben
  await openCitizen(currentCitizenId);
}
