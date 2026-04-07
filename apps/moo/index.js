const state = {
  currentPath: '',
  history: [],
  directories: [],
  filteredDirectories: [],
  files: [],
  filteredFiles: [],
  savedPlaylists: [],
  filteredSavedPlaylists: [],
  playlist: [],
  playlistsQuery: '',
  fileRegistry: {},
  currentTrack: null,
  currentPlaylistIndex: -1,
  activeSavedPlaylistId: 'current',
  randomMode: false,
  repeatMode: false,
  themeMode: 'dark',
  detailsExpanded: false,
  drives: [],
  loading: false
};

const PAGE_SIZE = 100;

const el = {
  drivesList: document.getElementById('drivesList'),
  directoryTree: document.getElementById('directoryTree'),
  directoriesList: document.getElementById('directoriesList'),
  filesList: document.getElementById('filesList'),
  contentLoader: document.getElementById('contentLoader'),
  loaderText: document.getElementById('loaderText'),
  emptyState: document.getElementById('emptyState'),
  currentTitle: document.getElementById('currentTitle'),
  currentSubtitle: document.getElementById('currentSubtitle'),
  dirCount: document.getElementById('dirCount'),
  fileCount: document.getElementById('fileCount'),
  nowPlayingTitle: document.getElementById('nowPlayingTitle'),
  detailsPanel: document.getElementById('detailsPanel'),
  detailsToggleBtn: document.getElementById('detailsToggleBtn'),
  detailsChevron: document.getElementById('detailsChevron'),
  themeDarkBtn: document.getElementById('themeDarkBtn'),
  themeLightBtn: document.getElementById('themeLightBtn'),
  themeAutoBtn: document.getElementById('themeAutoBtn'),
  playlistsSearchInput: document.getElementById('playlistsSearchInput'),
  playlistsPanel: document.getElementById('playlistsPanel'),
  playlistPanel: document.getElementById('playlistPanel'),
  playlistRandomBtn: document.getElementById('playlistRandomBtn'),
  playlistRepeatBtn: document.getElementById('playlistRepeatBtn'),
  playlistRepeatIcon: document.getElementById('playlistRepeatIcon'),
  playlistMenuBtn: document.getElementById('playlistMenuBtn'),
  playlistMenu: document.getElementById('playlistMenu'),
  copyPlaylistJsonBtn: document.getElementById('copyPlaylistJsonBtn'),
  exportPlaylistBtn: document.getElementById('exportPlaylistBtn'),
  importPlaylistBtn: document.getElementById('importPlaylistBtn'),
  importPlaylistInput: document.getElementById('importPlaylistInput'),
  audioPlayer: document.getElementById('audioPlayer'),
  snackbar: document.getElementById('snackbar'),
  statusText: document.getElementById('statusText'),
  pathInput: document.getElementById('pathInput'),
  searchInput: document.getElementById('searchInput'),
  breadcrumbBar: document.getElementById('breadcrumbBar'),
  refreshBtn: document.getElementById('refreshBtn'),
  openBtn: document.getElementById('openBtn'),
  backBtn: document.getElementById('backBtn'),
  playFirstBtn: document.getElementById('playFirstBtn'),
  clearSelectionBtn: document.getElementById('clearSelectionBtn')
};

let snackbarTimer = null;
const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const PLAYLIST_STORAGE_KEY = 'moo_saved_playlists';


function syncDetailsVisibility() {
  el.detailsToggleBtn.setAttribute('aria-expanded', state.detailsExpanded ? 'true' : 'false');
  el.detailsPanel.hidden = !state.detailsExpanded;
}
function setStatus(message, isError = false) {
  el.statusText.textContent = message;
  el.statusText.className = isError ? 'danger' : '';
}

function syncPlaylistModeButtons() {
  el.playlistRandomBtn.setAttribute('aria-pressed', state.randomMode ? 'true' : 'false');
  el.playlistRepeatBtn.setAttribute('aria-pressed', state.repeatMode ? 'true' : 'false');
  el.playlistRepeatIcon.textContent = state.repeatMode ? 'repeat_on' : 'repeat';
}

function applyTheme() {
  const resolvedTheme = state.themeMode === 'auto'
    ? (themeMediaQuery.matches ? 'dark' : 'light')
    : state.themeMode;

  document.documentElement.dataset.themeMode = state.themeMode;
  document.documentElement.dataset.themeResolved = resolvedTheme;

  el.themeDarkBtn.setAttribute('aria-pressed', state.themeMode === 'dark' ? 'true' : 'false');
  el.themeLightBtn.setAttribute('aria-pressed', state.themeMode === 'light' ? 'true' : 'false');
  el.themeAutoBtn.setAttribute('aria-pressed', state.themeMode === 'auto' ? 'true' : 'false');
  el.themeDarkBtn.setAttribute('role', 'radio');
  el.themeLightBtn.setAttribute('role', 'radio');
  el.themeAutoBtn.setAttribute('role', 'radio');
  el.themeDarkBtn.setAttribute('aria-checked', state.themeMode === 'dark' ? 'true' : 'false');
  el.themeLightBtn.setAttribute('aria-checked', state.themeMode === 'light' ? 'true' : 'false');
  el.themeAutoBtn.setAttribute('aria-checked', state.themeMode === 'auto' ? 'true' : 'false');
}

function setThemeMode(mode) {
  state.themeMode = mode;
  applyTheme();
}

function updateNowPlayingTitle(title) {
  const safeTitle = escapeHtml(title);

  el.nowPlayingTitle.classList.remove('is-marquee');
  el.nowPlayingTitle.style.removeProperty('--marquee-distance');
  el.nowPlayingTitle.style.removeProperty('--marquee-duration');
  el.nowPlayingTitle.innerHTML = `<span class="now-playing-title-text">${safeTitle}</span>`;

  requestAnimationFrame(() => {
    const textEl = el.nowPlayingTitle.querySelector('.now-playing-title-text');
    if (!textEl) {
      return;
    }

    const overflow = textEl.scrollWidth - el.nowPlayingTitle.clientWidth;
    if (overflow <= 8) {
      return;
    }

    const gap = 36;
    const duration = Math.max(8, textEl.scrollWidth / 24);
    el.nowPlayingTitle.classList.add('is-marquee');
    el.nowPlayingTitle.style.setProperty('--marquee-distance', `${Math.ceil(textEl.scrollWidth + gap)}px`);
    el.nowPlayingTitle.style.setProperty('--marquee-duration', `${duration.toFixed(1)}s`);
    el.nowPlayingTitle.innerHTML = `
      <span class="now-playing-title-track">
        <span class="now-playing-title-text">${safeTitle}</span>
        <span class="now-playing-title-gap" aria-hidden="true"></span>
        <span class="now-playing-title-text" aria-hidden="true">${safeTitle}</span>
      </span>`;
  });
}

function makePlaylistId() {
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePlaylistName(name) {
  const trimmed = String(name || '').trim();
  return trimmed || 'Playlist sans nom';
}

function getSavedPlaylistItems() {
  const currentEntry = {
    id: 'current',
    name: 'Playlist courante',
    tracks: [...state.playlist],
    system: true
  };

  return [currentEntry, ...state.savedPlaylists];
}

function persistSavedPlaylists() {
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(state.savedPlaylists));
  }
  catch (error) {
    console.error(error);
  }
}

function loadSavedPlaylists() {
  try {
    const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return;
    }

    state.savedPlaylists = parsed
      .filter((item) => item && typeof item.name === 'string' && Array.isArray(item.tracks))
      .map((item) => ({
        id: typeof item.id === 'string' && item.id ? item.id : makePlaylistId(),
        name: normalizePlaylistName(item.name),
        tracks: item.tracks.filter((track) => typeof track === 'string')
      }));
  }
  catch (error) {
    console.error(error);
    state.savedPlaylists = [];
  }
}

function syncFilteredSavedPlaylists() {
  const query = state.playlistsQuery.trim().toLowerCase();
  const items = getSavedPlaylistItems();

  if (!query) {
    state.filteredSavedPlaylists = items;
    return;
  }

  state.filteredSavedPlaylists = items.filter((playlist) => {
    return [playlist.name, ...playlist.tracks]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function renderSavedPlaylists() {
  syncFilteredSavedPlaylists();

  if (!state.filteredSavedPlaylists.length) {
    el.playlistsPanel.className = 'playlists-list muted';
    el.playlistsPanel.innerHTML = 'Aucune playlist correspondante.';
    return;
  }

  el.playlistsPanel.className = 'playlists-list';
  el.playlistsPanel.innerHTML = state.filteredSavedPlaylists.map((playlist) => {
    const activeClass = state.activeSavedPlaylistId === playlist.id ? ' is-active' : '';
    const countLabel = `${playlist.tracks.length} fichier(s)`;

    return `
      <button class="playlists-item${activeClass}" type="button" data-playlist-id="${escapeHtml(playlist.id)}">
        <span class="playlists-item-main">
          <span class="playlists-item-title">${escapeHtml(playlist.name)}</span>
          <span class="playlists-item-meta">· ${escapeHtml(countLabel)}</span>
        </span>
      </button>`;
  }).join('');

  [...el.playlistsPanel.querySelectorAll('.playlists-item')].forEach((button) => {
    button.addEventListener('click', () => {
      const playlistId = button.dataset.playlistId;
      if (playlistId === 'current') {
        state.activeSavedPlaylistId = 'current';
        renderSavedPlaylists();
        return;
      }

      const playlist = state.savedPlaylists.find((item) => item.id === playlistId);
      if (!playlist) {
        return;
      }

      state.playlist = [...playlist.tracks];
      state.activeSavedPlaylistId = playlist.id;
      syncCurrentTrackWithPlaylist();
      renderPlaylist();
      renderSavedPlaylists();
      setStatus(`Playlist chargee : ${playlist.name}`);
    });
  });
}

function saveNamedPlaylist(name, tracks) {
  const normalizedTracks = Array.isArray(tracks) ? tracks.filter((track) => typeof track === 'string') : [];
  if (!normalizedTracks.length) {
    return;
  }

  const normalizedName = normalizePlaylistName(name);
  const existingIndex = state.savedPlaylists.findIndex((playlist) => playlist.name === normalizedName);
  const payload = {
    id: existingIndex >= 0 ? state.savedPlaylists[existingIndex].id : makePlaylistId(),
    name: normalizedName,
    tracks: normalizedTracks
  };

  if (existingIndex >= 0) {
    state.savedPlaylists.splice(existingIndex, 1, payload);
  }
  else {
    state.savedPlaylists.unshift(payload);
  }

  persistSavedPlaylists();
  renderSavedPlaylists();
}

function showSnackbar(message) {
  el.snackbar.textContent = message;
  el.snackbar.hidden = false;

  if (snackbarTimer) {
    clearTimeout(snackbarTimer);
  }

  snackbarTimer = setTimeout(() => {
    el.snackbar.hidden = true;
    snackbarTimer = null;
  }, 2200);
}

function updateCounters() {
  el.dirCount.textContent = state.filteredDirectories.length;
  el.fileCount.textContent = state.filteredFiles.length;
  el.currentTitle.textContent = state.currentPath || 'Exploration';
  el.currentSubtitle.textContent = `${state.filteredDirectories.length} dossier(s), ${state.filteredFiles.length} media(s)`;
}

function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) {
    return 'taille inconnue';
  }
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return 'date inconnue';
  }

  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) {
    return 'date inconnue';
  }

  return date.toLocaleString('fr-BE');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function rememberFiles(files) {
  files.forEach((file) => {
    state.fileRegistry[file.path] = file;
  });
}

function getFileFromRegistry(path) {
  const knownFile = state.fileRegistry[path] || state.files.find((item) => item.path === path);
  if (knownFile) {
    return knownFile;
  }

  if (!path) {
    return null;
  }

  const normalizedPath = String(path).replace(/\\/g, '/');
  const segments = normalizedPath.split('/').filter(Boolean);
  const name = segments.length ? segments[segments.length - 1] : path;
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';

  return {
    name,
    path,
    type: 'file',
    extension,
    size: null,
    modified: null
  };
}

function updateEmptyState() {
  if (!el.contentLoader.hidden) {
    el.emptyState.hidden = true;
    return;
  }

  const hasDirectories = state.filteredDirectories.length > 0;
  const hasFiles = state.filteredFiles.length > 0;
  el.emptyState.hidden = hasDirectories || hasFiles;
}

function showLoader(message) {
  el.loaderText.textContent = message;
  el.contentLoader.hidden = false;
  el.emptyState.hidden = true;
}

function hideLoader() {
  el.contentLoader.hidden = true;
}

function resetContent() {
  state.directories = [];
  state.filteredDirectories = [];
  state.files = [];
  state.filteredFiles = [];

  el.directoriesList.innerHTML = '';
  el.filesList.innerHTML = '';
  el.searchInput.value = '';
}

function syncFilteredEntries() {
  const query = el.searchInput.value.trim().toLowerCase();

  if (!query) {
    state.filteredDirectories = [...state.directories];
    state.filteredFiles = [...state.files];
    return;
  }

  state.filteredDirectories = state.directories.filter((directory) => {
    return [directory.name, directory.path]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  state.filteredFiles = state.files.filter((file) => {
    return [file.name, file.path, file.extension]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function refreshContentView() {
  syncFilteredEntries();
  renderDirectories();
  renderFilesList();
  updateCounters();
  updateEmptyState();
}

async function loadDrives() {
  setStatus('Chargement des supports...');

  try {
    const response = await fetch('/?get=moomuse_drives');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.drives = payload.drives || [];

    renderDrives();
    setStatus(`Supports detectes : ${state.drives.length}`);

    if (!state.currentPath && state.drives.length) {
      await openPath(state.drives[0].path, false);
    }
  } catch (error) {
    console.error(error);
    setStatus(`Impossible de charger les supports: ${error.message}`, true);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchAllEntries(endpoint, key, path, onBatch) {
  let start = 0;
  let basePath = path;

  while (true) {
    const payload = await fetchJson(
      `/?get=${endpoint}&path=${encodeURIComponent(path)}&start=${start}&limit=${PAGE_SIZE}`
    );
    const batch = payload[key] || [];
    basePath = payload.base_path || basePath;

    if (batch.length > 0) {
      onBatch(batch, basePath);
    }

    if (batch.length < PAGE_SIZE) {
      return { basePath };
    }

    start += PAGE_SIZE;
  }
}

async function openPath(path, pushHistory = true) {
  if (!path || state.loading) {
    return;
  }

  const previousPath = state.currentPath;
  state.loading = true;
  state.currentPath = path;
  setStatus(`Chargement de ${path}...`);
  showLoader(`Chargement de ${path}...`);
  resetContent();
  el.pathInput.value = path;
  renderDrives();
  renderBreadcrumbs();
  refreshContentView();

  try {
    let firstContentDisplayed = false;
    const revealContent = () => {
      if (!firstContentDisplayed && (state.directories.length || state.files.length)) {
        firstContentDisplayed = true;
        hideLoader();
      }
    };

    const [directoriesResult, filesResult] = await Promise.all([
      fetchAllEntries('moomuse_directories', 'directories', path, (batch, basePath) => {
        if (!state.currentPath) {
          state.currentPath = basePath;
        }
        state.directories.push(...batch);
        revealContent();
        refreshContentView();
      }),
      fetchAllEntries('moomuse_files', 'files', path, (batch, basePath) => {
        if (!state.currentPath) {
          state.currentPath = basePath;
        }
        rememberFiles(batch);
        state.files.push(...batch);
        revealContent();
        refreshContentView();
      })
    ]);

    const basePath = filesResult.basePath || directoriesResult.basePath || path;

    state.currentPath = basePath;
    el.pathInput.value = state.currentPath;
    renderDrives();
    renderBreadcrumbs();
    renderPlayer();

    if (pushHistory && previousPath && previousPath !== basePath) {
      state.history.push(previousPath);
    }

    hideLoader();
    refreshContentView();

    setStatus(`Dossier charge : ${state.currentPath}`);
  } catch (error) {
    console.error(error);
    hideLoader();
    updateEmptyState();
    setStatus(`Impossible de charger le dossier: ${error.message}`, true);
  } finally {
    state.loading = false;
  }
}

function renderFilesList() {
  el.filesList.innerHTML = state.filteredFiles.map((file) => {
    return `
      <div class="card list-item" data-type="file" data-path="${escapeHtml(file.path)}">
        <div class="item-main between">
          <div class="item-main">
            <div class="icon file">&#127925;</div>
            <div class="item-text">
              <div class="item-title">${escapeHtml(file.name)}</div>
              <div class="item-meta">${escapeHtml(file.extension || 'media')} - ${escapeHtml(formatBytes(file.size))}</div>
            </div>
          </div>
          <div class="item-actions">
            <button class="icon-button add-playlist-btn" type="button" data-path="${escapeHtml(file.path)}" title="Ajouter a la playlist">+</button>
          </div>
        </div>
      </div>`;
  }).join('');

  [...el.filesList.querySelectorAll('.list-item')].forEach((item) => {
    const path = item.dataset.path;
    item.addEventListener('click', () => playFile(path));
  });

  [...el.filesList.querySelectorAll('.add-playlist-btn')].forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      addToPlaylist(button.dataset.path);
    });
  });
}

function renderDrives() {
  if (!state.drives.length) {
    el.drivesList.innerHTML = '<div class="muted">Aucun support detecte.</div>';
    return;
  }

  el.drivesList.innerHTML = state.drives.map((drive) => {
    const activeClass = state.currentPath && state.currentPath.startsWith(drive.path) ? 'active' : '';

    return `
      <div class="drive-item ${activeClass}" data-path="${escapeHtml(drive.path)}">
        <div class="item-main">
          <div class="icon drive">&#128190;</div>
          <div class="item-text">
            <div class="item-title">${escapeHtml(drive.name || drive.path)}</div>
            <div class="item-meta">${escapeHtml(drive.path)} - libre ${escapeHtml(formatBytes(drive.free))}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  [...el.drivesList.querySelectorAll('.drive-item')].forEach((item) => {
    item.addEventListener('click', () => openPath(item.dataset.path));
  });
}

function renderDirectories() {
  if (!state.filteredDirectories.length) {
    el.directoryTree.innerHTML = '<div class="muted">Aucun sous-dossier.</div>';
    el.directoriesList.innerHTML = '';
    return;
  }

  const treeHtml = state.filteredDirectories.map((directory) => `
    <div class="tree-item" data-path="${escapeHtml(directory.path)}">
      <div class="item-main">
        <div class="icon folder">&#128193;</div>
        <div class="item-text">
          <div class="item-title">${escapeHtml(directory.name)}</div>
          <div class="item-meta">${escapeHtml(directory.path)}</div>
        </div>
      </div>
    </div>`).join('');

  const gridHtml = state.filteredDirectories.map((directory) => `
    <div class="card list-item" data-type="directory" data-path="${escapeHtml(directory.path)}">
      <div class="item-main">
        <div class="icon folder">&#128193;</div>
        <div class="item-text">
          <div class="item-title">${escapeHtml(directory.name)}</div>
          <div class="item-meta">Dossier</div>
        </div>
      </div>
    </div>`).join('');

  el.directoryTree.innerHTML = treeHtml;
  el.directoriesList.innerHTML = gridHtml;

  [...el.directoryTree.querySelectorAll('.tree-item')].forEach((item) => {
    item.addEventListener('click', () => openPath(item.dataset.path));
  });

  [...el.directoriesList.querySelectorAll('.list-item')].forEach((item) => {
    item.addEventListener('click', () => openPath(item.dataset.path));
  });
}

function renderBreadcrumbs() {
  const path = state.currentPath;

  if (!path) {
    el.breadcrumbBar.innerHTML = '';
    return;
  }

  const normalized = path.replace(/\\/g, '/');
  const rawParts = normalized.split('/').filter(Boolean);
  const crumbs = [];

  if (/^[A-Za-z]:$/.test(rawParts[0] || '')) {
    let current = `${rawParts[0]}/`;
    crumbs.push({ label: rawParts[0], path: current });

    for (let index = 1; index < rawParts.length; index += 1) {
      current += `${rawParts[index]}/`;
      crumbs.push({ label: rawParts[index], path: current });
    }
  } else {
    let current = '/';
    crumbs.push({ label: '/', path: '/' });

    rawParts.forEach((part) => {
      current = current === '/' ? `/${part}` : `${current}/${part}`;
      crumbs.push({ label: part, path: current });
    });
  }

  el.breadcrumbBar.innerHTML = crumbs.map((crumb) => `
    <div class="breadcrumb" data-path="${escapeHtml(crumb.path)}">${escapeHtml(crumb.label)}</div>
  `).join('');

  [...el.breadcrumbBar.querySelectorAll('.breadcrumb')].forEach((item) => {
    item.addEventListener('click', () => openPath(item.dataset.path));
  });
}

function buildMediaUrl(file) {
  if (!file) {
    return '';
  }

  return `/?get=moomuse_stream&path=${encodeURIComponent(file.path)}`;
}

function addToPlaylist(path, options = {}) {
  const { silent = false } = options;
  const file = getFileFromRegistry(path);
  if (!file) {
    return -1;
  }

  state.playlist.push(path);
  state.activeSavedPlaylistId = 'current';
  if (!silent) {
    renderPlaylist();
    renderSavedPlaylists();
    setStatus(`Ajoute a la playlist : ${file.name}`);
  }
  return state.playlist.length - 1;
}

function removeFromPlaylist(index) {
  const [removedPath] = state.playlist.splice(index, 1);
  state.activeSavedPlaylistId = 'current';

  if (state.currentPlaylistIndex === index) {
    state.currentPlaylistIndex = -1;
  }
  else if (state.currentPlaylistIndex > index) {
    state.currentPlaylistIndex -= 1;
  }

  renderPlaylist();
  renderSavedPlaylists();

  const file = getFileFromRegistry(removedPath);
  if (file) {
    setStatus(`Retire de la playlist : ${file.name}`);
  }
}

function shufflePlaylist() {
  if (state.playlist.length < 2) {
    setStatus('Au moins deux fichiers sont necessaires pour melanger la playlist.', true);
    return;
  }

  const currentPath = state.currentTrack ? state.currentTrack.path : null;
  const shuffled = [...state.playlist];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  state.playlist = shuffled;
  state.activeSavedPlaylistId = 'current';
  state.currentPlaylistIndex = currentPath ? state.playlist.indexOf(currentPath) : -1;
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Playlist melangee : ${state.playlist.length} fichier(s)`);
}

function renderPlaylist() {
  if (!state.playlist.length) {
    el.playlistPanel.className = 'playlist-list muted';
    el.playlistPanel.innerHTML = 'Aucun fichier dans la playlist.';
    return;
  }

  el.playlistPanel.className = 'playlist-list';
  el.playlistPanel.innerHTML = state.playlist.map((path, index) => {
    const file = getFileFromRegistry(path);
    const title = file ? file.name : path.split(/[\\/]/).pop();
    const playingClass = state.currentPlaylistIndex === index ? ' is-playing' : '';

    return `
      <div class="playlist-item${playingClass}" data-index="${index}" data-path="${escapeHtml(path)}">
        <div class="playlist-item-main">
          <div class="playlist-item-title">${escapeHtml(title || path)}</div>
          <div class="playlist-item-path">${escapeHtml(path)}</div>
        </div>
        <div class="playlist-item-actions">
          <button class="icon-button playlist-remove-btn" type="button" data-index="${index}" title="Retirer">&times;</button>
        </div>
      </div>`;
  }).join('');

  [...el.playlistPanel.querySelectorAll('.playlist-item')].forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.index);
      if (index >= 0 && index < state.playlist.length) {
        playPlaylistIndex(index, true);
      }
    });
  });

  [...el.playlistPanel.querySelectorAll('.playlist-remove-btn')].forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      removeFromPlaylist(Number(button.dataset.index));
    });
  });
}

function exportPlaylist() {
  const payload = JSON.stringify(state.playlist, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'playlist.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  setStatus(`Playlist exportee : ${state.playlist.length} fichier(s)`);
}

function closePlaylistMenu() {
  el.playlistMenu.hidden = true;
  el.playlistMenuBtn.setAttribute('aria-expanded', 'false');
}

function togglePlaylistMenu() {
  const willOpen = el.playlistMenu.hidden;
  el.playlistMenu.hidden = !willOpen;
  el.playlistMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

async function copyPlaylistJson() {
  const payload = JSON.stringify(state.playlist, null, 2);

  try {
    await navigator.clipboard.writeText(payload);
    setStatus(`Playlist copiée dans le presse-papiers : ${state.playlist.length} fichier(s)`);
    showSnackbar('Playlist JSON copiée');
  }
  catch (error) {
    console.error(error);
    setStatus('Copie impossible depuis le navigateur.', true);
  }

  closePlaylistMenu();
}

function syncCurrentTrackWithPlaylist() {
  if (!state.currentTrack) {
    state.currentPlaylistIndex = -1;
    return;
  }

  const index = state.playlist.indexOf(state.currentTrack.path);
  if (index === -1) {
    state.currentTrack = null;
    state.currentPlaylistIndex = -1;
    el.audioPlayer.pause();
    delete el.audioPlayer.dataset.path;
    renderPlayer();
  }
  else {
    state.currentPlaylistIndex = index;
  }
}

function importPlaylistFromText(content) {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    throw new Error('invalid_playlist_format');
  }

  state.playlist = [...parsed];
  state.activeSavedPlaylistId = 'current';
  syncCurrentTrackWithPlaylist();
  renderPlaylist();
  renderSavedPlaylists();
  closePlaylistMenu();
  setStatus(`Playlist importee : ${state.playlist.length} fichier(s)`);
}

function ensureTrackInPlaylist(path) {
  let index = state.playlist.indexOf(path);
  if (index === -1) {
    index = addToPlaylist(path, { silent: true });
  }
  return index;
}

function playPlaylistIndex(index, autoPlay = true) {
  if (index < 0 || index >= state.playlist.length) {
    return;
  }

  const path = state.playlist[index];
  const file = getFileFromRegistry(path);
  if (!file) {
    return;
  }

  state.currentPlaylistIndex = index;
  state.currentTrack = file;
  renderPlayer(autoPlay);
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Lecture : ${file.name}`);
}

function playFile(path) {
  const index = ensureTrackInPlaylist(path);
  if (index === -1) {
    return;
  }
  playPlaylistIndex(index, true);
}

function renderPlayer(autoPlay = false) {
  const file = state.currentTrack;

  if (!file) {
    updateNowPlayingTitle('Aucun media selectionne');
    el.detailsPanel.innerHTML = 'Les informations du fichier selectionne apparaitront ici.';
    el.audioPlayer.removeAttribute('src');
    el.audioPlayer.load();
    return;
  }

  updateNowPlayingTitle(file.name);
  el.detailsPanel.innerHTML = `
    <div><strong>Nom</strong><br>${escapeHtml(file.name)}</div>
    <div class="details-spacer"></div>
    <div><strong>Chemin</strong><br><span class="muted">${escapeHtml(file.path)}</span></div>
    <div class="details-spacer"></div>
    <div><strong>Extension</strong><br>${escapeHtml(file.extension || '-')}</div>
    <div class="details-spacer"></div>
    <div><strong>Taille</strong><br>${escapeHtml(formatBytes(file.size))}</div>
    <div class="details-spacer"></div>
    <div><strong>Derniere modification</strong><br>${escapeHtml(formatDate(file.modified))}</div>
  `;

  syncDetailsVisibility();

  const mediaUrl = buildMediaUrl(file);
  if (!mediaUrl) {
    return;
  }

  if (el.audioPlayer.dataset.path !== file.path) {
    el.audioPlayer.src = mediaUrl;
    el.audioPlayer.dataset.path = file.path;
  }

  if (autoPlay) {
    el.audioPlayer.play().catch(() => {
      setStatus('Lecture bloquee par le navigateur. Clique sur Play.', true);
    });
  }
}

function applyFilter() {
  refreshContentView();
}

el.refreshBtn.addEventListener('click', () => openPath(state.currentPath || el.pathInput.value, false));
el.openBtn.addEventListener('click', () => openPath(el.pathInput.value));
el.backBtn.addEventListener('click', () => {
  const previous = state.history.pop();
  if (previous) {
    openPath(previous, false);
  }
});
if (el.playFirstBtn) {
  el.playFirstBtn.addEventListener('click', () => {
    const first = state.filteredFiles[0];
    if (first) {
      playFile(first.path);
    }
  });
}

if (el.clearSelectionBtn) {
  el.clearSelectionBtn.addEventListener('click', () => {
    state.currentTrack = null;
    state.currentPlaylistIndex = -1;
    el.audioPlayer.pause();
    delete el.audioPlayer.dataset.path;
    renderPlayer();
    renderPlaylist();
    setStatus('Lecture arretee.');
  });
}
el.pathInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    openPath(el.pathInput.value);
  }
});
el.searchInput.addEventListener('input', applyFilter);
el.playlistsSearchInput.addEventListener('input', () => {
  state.playlistsQuery = el.playlistsSearchInput.value;
  renderSavedPlaylists();
});
el.themeDarkBtn.addEventListener('click', () => {
  setThemeMode('dark');
});
el.themeLightBtn.addEventListener('click', () => {
  setThemeMode('light');
});
el.themeAutoBtn.addEventListener('click', () => {
  setThemeMode('auto');
});
el.playlistRandomBtn.addEventListener('click', () => {
  state.randomMode = !state.randomMode;
  syncPlaylistModeButtons();
  shufflePlaylist();
});
el.playlistRepeatBtn.addEventListener('click', () => {
  state.repeatMode = !state.repeatMode;
  syncPlaylistModeButtons();
});
el.playlistMenuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  togglePlaylistMenu();
});
el.copyPlaylistJsonBtn.addEventListener('click', () => {
  copyPlaylistJson();
});
el.exportPlaylistBtn.addEventListener('click', () => {
  exportPlaylist();
  closePlaylistMenu();
});
el.importPlaylistBtn.addEventListener('click', () => {
  el.importPlaylistInput.click();
});
el.importPlaylistInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  event.target.value = '';

  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    importPlaylistFromText(content);
    saveNamedPlaylist(file.name.replace(/\.json$/i, ''), state.playlist);
  }
  catch (error) {
    console.error(error);
    closePlaylistMenu();
    setStatus('Import impossible : JSON de playlist invalide.', true);
  }
});
el.audioPlayer.addEventListener('ended', () => {
  const nextIndex = state.currentPlaylistIndex + 1;
  if (nextIndex >= 0 && nextIndex < state.playlist.length) {
    playPlaylistIndex(nextIndex, true);
  }
  else if (state.repeatMode && state.playlist.length) {
    playPlaylistIndex(0, true);
  }
});
el.detailsToggleBtn.addEventListener('click', () => {
  state.detailsExpanded = !state.detailsExpanded;
  syncDetailsVisibility();
});
document.addEventListener('click', (event) => {
  if (!el.playlistMenu.hidden && !event.target.closest('.playlist-menu-wrap')) {
    closePlaylistMenu();
  }
});
window.addEventListener('resize', () => {
  updateNowPlayingTitle(state.currentTrack ? state.currentTrack.name : 'Aucun media selectionne');
});
themeMediaQuery.addEventListener('change', () => {
  if (state.themeMode === 'auto') {
    applyTheme();
  }
});

applyTheme();
loadSavedPlaylists();
syncDetailsVisibility();
syncPlaylistModeButtons();
renderSavedPlaylists();
renderPlaylist();
loadDrives();









