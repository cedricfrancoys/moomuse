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
  currentPlaylistMeta: {
    name: 'Playlist courante',
    author: '',
    description: ''
  },
  playlistsQuery: '',
  fileRegistry: {},
  currentTrack: null,
  currentPlaylistIndex: -1,
  activeSavedPlaylistId: 'current',
  randomMode: false,
  repeatMode: false,
  themeMode: 'dark',
  detailsExpanded: false,
  playlistsExpanded: false,
  showDirectories: true,
  showFiles: true,
  drives: [],
  loading: false,
  mode: 'browse', // 'browse' or 'library'
  libraryTracks: [],
  libraryCategory: 'all',
  libraryQuery: '',
  libraryPage: 1,
  libraryStart: 0,
  libraryPageSize: 50,
  libraryTotalCount: 0
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
  playlistsToggleBtn: document.getElementById('playlistsToggleBtn'),
  playlistsChevron: document.getElementById('playlistsChevron'),
  playlistsSearchInput: document.getElementById('playlistsSearchInput'),
  playlistsPanel: document.getElementById('playlistsPanel'),
  playlistPanel: document.getElementById('playlistPanel'),
  playlistRandomBtn: document.getElementById('playlistRandomBtn'),
  playlistRepeatBtn: document.getElementById('playlistRepeatBtn'),
  playlistRepeatIcon: document.getElementById('playlistRepeatIcon'),
  playlistMenuBtn: document.getElementById('playlistMenuBtn'),
  playlistMenu: document.getElementById('playlistMenu'),
  editPlaylistBtn: document.getElementById('editPlaylistBtn'),
  copyPlaylistJsonBtn: document.getElementById('copyPlaylistJsonBtn'),
  exportPlaylistBtn: document.getElementById('exportPlaylistBtn'),
  importPlaylistBtn: document.getElementById('importPlaylistBtn'),
  importPlaylistInput: document.getElementById('importPlaylistInput'),
  playlistEditModal: document.getElementById('playlistEditModal'),
  closePlaylistEditBtn: document.getElementById('closePlaylistEditBtn'),
  cancelPlaylistEditBtn: document.getElementById('cancelPlaylistEditBtn'),
  savePlaylistEditBtn: document.getElementById('savePlaylistEditBtn'),
  playlistNameInput: document.getElementById('playlistNameInput'),
  playlistAuthorInput: document.getElementById('playlistAuthorInput'),
  playlistDescriptionInput: document.getElementById('playlistDescriptionInput'),
  audioPlayer: document.getElementById('audioPlayer'),
  snackbar: document.getElementById('snackbar'),
  statusText: document.getElementById('statusText'),
  pathInput: document.getElementById('pathInput'),
  searchInput: document.getElementById('searchInput'),
  showDirectoriesBtn: document.getElementById('showDirectoriesBtn'),
  showFilesBtn: document.getElementById('showFilesBtn'),
  breadcrumbBar: document.getElementById('breadcrumbBar'),
  refreshBtn: document.getElementById('refreshBtn'),
  openBtn: document.getElementById('openBtn'),
  backBtn: document.getElementById('backBtn'),
  playFirstBtn: document.getElementById('playFirstBtn'),
  clearSelectionBtn: document.getElementById('clearSelectionBtn'),
  // Mode switching
  browseModeBtn: document.getElementById('browseModeBtn'),
  libraryModeBtn: document.getElementById('libraryModeBtn'),
  modeDescription: document.getElementById('modeDescription'),
  browseSidebar: document.getElementById('browseSidebar'),
  librarySidebar: document.getElementById('librarySidebar'),
  browseToolbar: document.getElementById('browseToolbar'),
  libraryToolbar: document.getElementById('libraryToolbar'),
  browseContent: document.getElementById('browseContent'),
  libraryContent: document.getElementById('libraryContent'),
  // Library elements
  librarySearchInput: document.getElementById('librarySearchInput'),
  libraryRefreshBtn: document.getElementById('libraryRefreshBtn'),
  libraryList: document.getElementById('libraryList'),
  libraryPagination: document.getElementById('libraryPagination'),
  libraryEmptyState: document.getElementById('libraryEmptyState'),
  librarySubtitle: document.getElementById('librarySubtitle')
};

let snackbarTimer = null;
let librarySearchDebounceTimer = null;
const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const PLAYLIST_STORAGE_KEY = 'moo_saved_playlists';
const CRON_INTERVAL_MS = 60000;
let wakeLock = null;
let wakeLockEnabled = 'wakeLock' in navigator;

function startCronPolling() {
  setInterval(() => {
    fetch('/?do=moomuse_cron_run').catch((error) => {
      console.error('Cron run failed.', error);
    });
  }, CRON_INTERVAL_MS);
}

async function requestWakeLock() {
  if (!wakeLockEnabled || wakeLock || el.audioPlayer.paused || el.audioPlayer.ended || document.hidden) {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  }
  catch (error) {
    wakeLockEnabled = false;
    console.error(error);
  }
}

async function releaseWakeLock() {
  if (!wakeLock) {
    return;
  }

  try {
    await wakeLock.release();
  }
  catch (error) {
    console.error(error);
  }
  finally {
    wakeLock = null;
  }
}


function syncDetailsVisibility() {
  el.detailsToggleBtn.setAttribute('aria-expanded', state.detailsExpanded ? 'true' : 'false');
  el.detailsChevron.textContent = state.detailsExpanded ? 'arrow_drop_up' : 'arrow_drop_down';
  el.detailsPanel.hidden = !state.detailsExpanded;
}

function syncPlaylistsVisibility() {
  el.playlistsToggleBtn.setAttribute('aria-expanded', state.playlistsExpanded ? 'true' : 'false');
  el.playlistsChevron.textContent = state.playlistsExpanded ? 'arrow_drop_up' : 'arrow_drop_down';
  el.playlistsSearchInput.hidden = !state.playlistsExpanded;
  el.playlistsPanel.classList.toggle('is-collapsed', !state.playlistsExpanded);
  const playlistsCard = el.playlistsPanel.closest('.playlists-card');
  if (playlistsCard) {
    playlistsCard.classList.toggle('is-expanded', state.playlistsExpanded);
  }
}

function syncContentFilterButtons() {
  el.showDirectoriesBtn.setAttribute('aria-pressed', state.showDirectories ? 'true' : 'false');
  el.showFilesBtn.setAttribute('aria-pressed', state.showFiles ? 'true' : 'false');
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

function switchMode(mode) {
  if (mode !== 'browse' && mode !== 'library') {
    return;
  }

  state.mode = mode;

  // Update button states
  const isBrowseMode = mode === 'browse';
  el.browseModeBtn.setAttribute('aria-pressed', isBrowseMode ? 'true' : 'false');
  el.libraryModeBtn.setAttribute('aria-pressed', !isBrowseMode ? 'true' : 'false');

  // Update description
  el.modeDescription.textContent = isBrowseMode
    ? 'Explore les supports pour lancer les médias immédiatement'
    : 'Consulte la bibliothèque indexée et crée des playlists';

  // Update sidebar visibility
  el.browseSidebar.hidden = !isBrowseMode;
  el.librarySidebar.hidden = isBrowseMode;

  // Update toolbar visibility
  el.browseToolbar.hidden = !isBrowseMode;
  el.libraryToolbar.hidden = isBrowseMode;

  // Update content area visibility
  el.browseContent.hidden = !isBrowseMode;
  el.libraryContent.hidden = isBrowseMode;

  if (isBrowseMode) {
    // Initialize browse mode if needed
    if (!state.drives.length) {
      initializeBrowseMode();
    }
  } 
  else {
    // Initialize library mode if needed
    if (!state.libraryTracks.length) {
      initializeLibraryMode();
    }
  }
}

function initializeBrowseMode() {
  // Will be called when switching to browse mode
  setStatus('Mode Parcourir activé');
}

function initializeLibraryMode() {
  // Will be called when switching to library mode
  el.libraryEmptyState.hidden = true;
  el.libraryPagination.hidden = true;
  el.libraryPagination.innerHTML = '';
  el.libraryList.innerHTML = '';
  el.librarySubtitle.textContent = 'Chargement...';
  
  // Load library tracks from database
  loadLibraryTracks();
}

function buildLibraryDomain(query) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery.length) {
    return [];
  }

  const parts = normalizedQuery.split(/\s+/).slice(0, 4);
  // #todo - allow field-specific search (e.g. "artist:beatles album:abbey")
  const fields = ['name', 'title', 'artist', 'album'];
  let clauses = [[]];

  for (const part of parts) {
    const nextClauses = [];

    for (const clause of clauses) {
      for (const field of fields) {
        nextClauses.push([
          ...clause,
          [field, 'ilike', `%${part}%`]
        ]);
      }
    }

    clauses = nextClauses;
  }

  return clauses;
}

async function loadLibraryTracks(start = state.libraryStart) {
  try {
    el.libraryEmptyState.hidden = true;
    el.libraryPagination.hidden = true;
    el.libraryPagination.innerHTML = '';
    el.libraryList.innerHTML = '';
    el.librarySubtitle.textContent = 'Chargement...';
    
    state.libraryStart = Math.max(0, Number(start) || 0);
    state.libraryPage = Math.floor(state.libraryStart / state.libraryPageSize) + 1;
    
    // Build the request
    const params = new URLSearchParams({
      get: 'moomuse_Track_collect',
      limit: state.libraryPageSize,
      start: state.libraryStart,
      order: 'title',
      fields: '{id,name,path,full_path,extension,size,artist,title,album,drive_id}'
    });
    
    const domain = buildLibraryDomain(state.libraryQuery);
    if (domain.length) {
      params.append('domain', JSON.stringify(domain));
    }
    
    const response = await fetch(`/?${params.toString()}`);
    const result = await response.json();
    const collection = Array.isArray(result) ? result.map((track) => normalizeTrack(track)) : [];
    const totalCountHeader = response.headers.get('X-Total-Count');
    const totalCount = totalCountHeader ? Number.parseInt(totalCountHeader, 10) : collection.length;

    state.libraryTracks = collection;
    state.libraryTotalCount = Number.isFinite(totalCount) ? totalCount : collection.length;
    
    renderLibraryList();
    el.librarySubtitle.textContent = state.libraryTotalCount
      ? `${state.libraryTotalCount} titre(s) indexes`
      : 'Aucun titre indexe pour le moment';
    
    if (state.libraryTracks.length === 0) {
      el.libraryEmptyState.hidden = false;
      el.librarySubtitle.textContent = state.libraryPage === 1 
        ? 'Aucun titre indexé pour le moment'
        : 'Fin de la liste';
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la bibliothèque:', error);
    el.librarySubtitle.textContent = 'Erreur lors du chargement';
  }
}

function renderLibraryList() {
  el.libraryList.innerHTML = '';
  
  state.libraryTracks.forEach((track, index) => {
    const normalizedTrack = normalizeTrack(track);
    const trackItem = document.createElement('div');
    trackItem.className = 'library-track-item';
    trackItem.dataset.trackId = normalizedTrack.id || '';
    
    const artist = normalizedTrack.artist || 'Artiste inconnu';
    const title = normalizedTrack.title || normalizedTrack.name || 'Titre inconnu';
    const album = normalizedTrack.album || '';
    
    trackItem.innerHTML = `
      <div class="track-item-content">
        <div class="track-item-primary">
          <span class="track-title">${escapeHtml(title)}</span>
        </div>
        <div class="track-item-secondary">
          <span class="track-artist">${escapeHtml(artist)}</span>
          ${album ? `<span class="track-album">${escapeHtml(album)}</span>` : ''}
        </div>
      </div>
      <div class="track-item-actions">
        <button class="icon-button library-track-add" type="button" aria-label="Ajouter a la playlist" title="Ajouter a la playlist">
          <span class="material-symbols-outlined" aria-hidden="true">add</span>
        </button>
      </div>
    `;
    
    trackItem.querySelector('.library-track-add').addEventListener('click', async (event) => {
      event.stopPropagation();

      try {
        const file = await fetchLibraryTrackPlaybackFile(normalizedTrack);
        addToPlaylist(file.path);
      }
      catch (error) {
        console.error(error);
        setStatus('Impossible d ajouter cette piste a la playlist.', true);
      }
    });
    
    trackItem.addEventListener('click', () => {
      playTrackFromLibrary(normalizedTrack, index);
    });
    
    el.libraryList.appendChild(trackItem);
  });
  
  renderLibraryPagination();
}

function renderLibraryPagination() {
  const totalPages = Math.ceil(state.libraryTotalCount / state.libraryPageSize);
  const currentPage = Math.floor(state.libraryStart / state.libraryPageSize) + 1;
  const hasPrevious = state.libraryStart > 0;
  const nextStart = state.libraryStart + state.libraryPageSize;
  const hasNext = nextStart < state.libraryTotalCount;

  if (totalPages <= 1) {
    el.libraryPagination.hidden = true;
    el.libraryPagination.innerHTML = '';
    return;
  }

  const firstStart = 0;
  const previousStart = Math.max(0, state.libraryStart - state.libraryPageSize);
  const lastStart = Math.max(0, (totalPages - 1) * state.libraryPageSize);
  const visibleFrom = state.libraryTotalCount ? state.libraryStart + 1 : 0;
  const visibleTo = Math.min(state.libraryStart + state.libraryTracks.length, state.libraryTotalCount);

  el.libraryPagination.innerHTML = `
    <button class="button pagination-btn" type="button" data-start="${firstStart}" ${hasPrevious ? '' : 'disabled'}>« Début</button>
    <button class="button pagination-btn" type="button" data-start="${previousStart}" ${hasPrevious ? '' : 'disabled'}>‹ Précédent</button>
    <span class="pagination-info">Page ${currentPage} / ${totalPages} · ${visibleFrom}-${visibleTo} sur ${state.libraryTotalCount}</span>
    <button class="button pagination-btn" type="button" data-start="${nextStart}" ${hasNext ? '' : 'disabled'}>Suivant ›</button>
    <button class="button pagination-btn" type="button" data-start="${lastStart}" ${hasNext ? '' : 'disabled'}>Fin »</button>
  `;
  el.libraryPagination.innerHTML = [
    `<button class="button pagination-btn icon-only" type="button" data-start="${firstStart}" aria-label="Premiere page" title="Premiere page" ${hasPrevious ? '' : 'disabled'}><span class="material-symbols-outlined" aria-hidden="true">first_page</span></button>`,
    `<button class="button pagination-btn icon-only" type="button" data-start="${previousStart}" aria-label="Page precedente" title="Page precedente" ${hasPrevious ? '' : 'disabled'}><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>`,
    `<span class="pagination-info">Page ${currentPage} / ${totalPages} - ${visibleFrom}-${visibleTo} sur ${state.libraryTotalCount}</span>`,
    `<button class="button pagination-btn icon-only" type="button" data-start="${nextStart}" aria-label="Page suivante" title="Page suivante" ${hasNext ? '' : 'disabled'}><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>`,
    `<button class="button pagination-btn icon-only" type="button" data-start="${lastStart}" aria-label="Derniere page" title="Derniere page" ${hasNext ? '' : 'disabled'}><span class="material-symbols-outlined" aria-hidden="true">last_page</span></button>`
  ].join('');
  el.libraryPagination.hidden = false;

  el.libraryPagination.querySelectorAll('.pagination-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStart = Number.parseInt(btn.dataset.start || '0', 10);
      loadLibraryTracks(targetStart);
      el.libraryContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

async function fetchLibraryTrackPlaybackFile(track) {
  const params = new URLSearchParams({
    get: 'moomuse_Track_info',
    ids: track.id,
    fields: '{id,name,path,full_path,filename,extension,size,artist,title,album,drive_id,extref_accoust_id,extref_mb_track_id}'
  });

  const response = await fetch(`/?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  const record = Array.isArray(result) ? result[0] : null;

  const playbackPath = record?.full_path || record?.path;
  if (!playbackPath) {
    throw new Error('missing_full_path');
  }

  const file = normalizeTrack({
    ...track,
    ...record,
    path: String(playbackPath)
  });

  state.fileRegistry[file.path] = file;
  return file;
}

async function playTrackFromLibrary(track, index) {
  try {
    const file = await fetchLibraryTrackPlaybackFile(track);
    state.currentTrack = file;
    state.currentPlaylistIndex = state.playlist.indexOf(file.path);
    renderPlayer(true);
    renderPlaylist();
    renderSavedPlaylists();
    setStatus(`Lecture : ${file.name}`);
  }
  catch (error) {
    console.error(error);
    setStatus('Impossible de lire cette piste depuis la bibliothèque.', true);
  }
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

function normalizePlaylistAuthor(author) {
  return String(author || '').trim();
}

function normalizePlaylistDescription(description) {
  return String(description || '').trim();
}

function normalizePlaylistRecord(item, fallback = {}) {
  const tracks = Array.isArray(item?.tracks)
    ? item.tracks.map((track) => normalizePlaylistTrackItem(track)).filter(Boolean)
    : Array.isArray(item)
      ? item.map((track) => normalizePlaylistTrackItem(track)).filter(Boolean)
      : Array.isArray(fallback.tracks)
        ? fallback.tracks.map((track) => normalizePlaylistTrackItem(track)).filter(Boolean)
        : [];

  return {
    id: typeof item?.id === 'string' && item.id ? item.id : (fallback.id || makePlaylistId()),
    name: normalizePlaylistName(item?.name ?? fallback.name),
    author: normalizePlaylistAuthor(item?.author ?? fallback.author),
    description: normalizePlaylistDescription(item?.description ?? fallback.description),
    tracks
  };
}

function getSavedPlaylistItems() {
  const currentEntry = {
    id: 'current',
    name: normalizePlaylistName(state.currentPlaylistMeta.name),
    author: normalizePlaylistAuthor(state.currentPlaylistMeta.author),
    description: normalizePlaylistDescription(state.currentPlaylistMeta.description),
    tracks: serializeCurrentPlaylistTracks(),
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
      .filter((item) => item && ((typeof item.name === 'string' && Array.isArray(item.tracks)) || Array.isArray(item)))
      .map((item) => normalizePlaylistRecord(item));
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
    return [
      playlist.name,
      ...playlist.tracks.flatMap((track) => [track.full_path, track.path])
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function renderSavedPlaylists() {
  syncFilteredSavedPlaylists();

  const itemsToRender = state.playlistsExpanded
    ? state.filteredSavedPlaylists
    : getSavedPlaylistItems().filter((playlist) => playlist.id === 'current');

  if (!itemsToRender.length) {
    el.playlistsPanel.className = 'playlists-list muted';
    el.playlistsPanel.innerHTML = 'Aucune playlist correspondante.';
    syncPlaylistsVisibility();
    return;
  }

  el.playlistsPanel.className = 'playlists-list';
  el.playlistsPanel.innerHTML = itemsToRender.map((playlist) => {
    const activeClass = state.activeSavedPlaylistId === playlist.id ? ' is-active' : '';
    const countLabel = `${playlist.tracks.length} fichier(s)`;
    const detailLabel = playlist.author || playlist.description || countLabel;

    return `
      <button class="playlists-item${activeClass}" type="button" data-playlist-id="${escapeHtml(playlist.id)}">
        <span class="playlists-item-main">
          <span class="playlists-item-title">${escapeHtml(playlist.name)}</span>
        </span>
        <span class="playlists-item-meta">${escapeHtml(detailLabel)}</span>
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

      state.playlist = playlist.tracks
        .map((track) => {
          const fullPath = getPlaylistTrackFullPath(track);
          if (!fullPath) {
            return null;
          }

          state.fileRegistry[fullPath] = normalizeTrack({
            path: fullPath,
            full_path: fullPath,
            track_id: track.track_id ?? null,
            drive_id: track.drive_id ?? null,
            musicbrainz_track_id: track.musicbrainz_track_id ?? null
          });

          return fullPath;
        })
        .filter(Boolean);
      state.currentPlaylistMeta = {
        name: playlist.name,
        author: playlist.author || '',
        description: playlist.description || ''
      };
      state.activeSavedPlaylistId = playlist.id;
      syncCurrentTrackWithPlaylist();
      renderPlaylist();
      renderSavedPlaylists();
      setStatus(`Playlist chargee : ${playlist.name}`);
    });
  });

  syncPlaylistsVisibility();
}

function getActivePlaylistRecord() {
  if (state.activeSavedPlaylistId === 'current') {
    return getSavedPlaylistItems().find((playlist) => playlist.id === 'current') || null;
  }

  return state.savedPlaylists.find((playlist) => playlist.id === state.activeSavedPlaylistId) || null;
}

function openPlaylistEditModal() {
  const playlist = getActivePlaylistRecord();
  if (!playlist) {
    setStatus('Aucune playlist a editer.', true);
    return;
  }

  el.playlistNameInput.value = playlist.name || '';
  el.playlistAuthorInput.value = playlist.author || '';
  el.playlistDescriptionInput.value = playlist.description || '';
  el.playlistEditModal.hidden = false;
  closePlaylistMenu();
  requestAnimationFrame(() => el.playlistNameInput.focus());
}

function closePlaylistEditModal() {
  el.playlistEditModal.hidden = true;
}

function savePlaylistEdit() {
  const playlist = getActivePlaylistRecord();
  if (!playlist) {
    closePlaylistEditModal();
    return;
  }

  const payload = {
    name: normalizePlaylistName(el.playlistNameInput.value),
    author: normalizePlaylistAuthor(el.playlistAuthorInput.value),
    description: normalizePlaylistDescription(el.playlistDescriptionInput.value)
  };

  state.currentPlaylistMeta = {
    ...state.currentPlaylistMeta,
    ...payload
  };

  if (state.activeSavedPlaylistId !== 'current') {
    const index = state.savedPlaylists.findIndex((item) => item.id === state.activeSavedPlaylistId);
    if (index >= 0) {
      state.savedPlaylists.splice(index, 1, {
        ...state.savedPlaylists[index],
        ...payload
      });
      persistSavedPlaylists();
    }
  }

  renderSavedPlaylists();
  closePlaylistEditModal();
  setStatus(`Playlist mise a jour : ${payload.name}`);
}

function saveNamedPlaylist(name, tracks, options = {}) {
  const normalizedTracks = Array.isArray(tracks)
    ? tracks.map((track) => normalizePlaylistTrackItem(track)).filter(Boolean)
    : [];
  if (!normalizedTracks.length) {
    return;
  }

  const normalizedName = normalizePlaylistName(name);
  const existingIndex = state.savedPlaylists.findIndex((playlist) => playlist.name === normalizedName);
  const existing = existingIndex >= 0 ? state.savedPlaylists[existingIndex] : null;
  const payload = normalizePlaylistRecord({
    id: existing?.id,
    name: normalizedName,
    author: options.author ?? existing?.author ?? '',
    description: options.description ?? existing?.description ?? '',
    tracks: normalizedTracks
  }, { id: makePlaylistId() });

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

function normalizeTrack(track = {}, fallbackPath = '') {
  const sourcePath = typeof track.path === 'string' ? track.path : '';
  const fullPath = String(track.full_path || track.fullpath || sourcePath || fallbackPath || '');
  const resolvedPath = fullPath;
  const normalizedPath = resolvedPath.replace(/\\/g, '/');
  const segments = normalizedPath.split('/').filter(Boolean);
  const fallbackName = segments.length ? segments[segments.length - 1] : resolvedPath;
  const name = track.name || track.filename || fallbackName || track.title || 'media';
  const extension = (track.extension || (name.includes('.') ? name.split('.').pop().toLowerCase() : '')).toLowerCase();
  const driveId = typeof track.drive_id === 'object' && track.drive_id !== null
    ? track.drive_id.id ?? null
    : track.drive_id ?? null;
  const trackId = track.track_id ?? track.id ?? null;
  const relativePath = (track.full_path || track.fullpath) && sourcePath && sourcePath !== resolvedPath
    ? sourcePath
    : null;

  return {
    id: track.id ?? trackId,
    track_id: trackId,
    name,
    path: resolvedPath,
    full_path: resolvedPath,
    relative_path: relativePath,
    extension,
    size: track.size ?? null,
    artist: track.artist || '',
    title: track.title || '',
    album: track.album || '',
    drive_id: driveId,
    musicbrainz_track_id: track.musicbrainz_track_id || track.extref_mb_track_id || '',
    type: 'file',
    modified: track.modified ?? null
  };
}

function normalizePlaylistTrackItem(track) {
  if (typeof track === 'string') {
    const fullPath = track.trim();
    return fullPath ? { full_path: fullPath } : null;
  }

  if (!track || typeof track !== 'object') {
    return null;
  }

  const fullPath = String(track.full_path || track.fullpath || track.path || '').trim();
  if (!fullPath) {
    return null;
  }

  const normalized = { full_path: fullPath };
  const trackId = track.track_id ?? track.id ?? null;
  const driveId = typeof track.drive_id === 'object' && track.drive_id !== null
    ? track.drive_id.id ?? null
    : track.drive_id ?? null;
  const musicbrainzTrackId = track.musicbrainz_track_id || track.extref_mb_track_id || null;

  if (trackId != null && trackId !== '') {
    normalized.track_id = trackId;
  }

  if (driveId != null && driveId !== '') {
    normalized.drive_id = driveId;
  }

  if (musicbrainzTrackId) {
    normalized.musicbrainz_track_id = musicbrainzTrackId;
  }

  return normalized;
}

function serializeTrackForPlaylist(track) {
  const normalizedTrack = normalizeTrack(track);
  const serialized = {
    full_path: normalizedTrack.full_path || normalizedTrack.path
  };

  if (normalizedTrack.track_id != null) {
    serialized.track_id = normalizedTrack.track_id;
  }

  if (normalizedTrack.drive_id != null) {
    serialized.drive_id = normalizedTrack.drive_id;
  }

  if (normalizedTrack.musicbrainz_track_id) {
    serialized.musicbrainz_track_id = normalizedTrack.musicbrainz_track_id;
  }

  return serialized;
}

function getPlaylistTrackFullPath(track) {
  return normalizePlaylistTrackItem(track)?.full_path || null;
}

function serializeCurrentPlaylistTracks() {
  return state.playlist
    .map((path) => serializeTrackForPlaylist(getFileFromRegistry(path) || { path }))
    .filter((track) => track && track.full_path);
}

function getTrackPlaybackPath(track) {
  if (!track) {
    return '';
  }

  const fullPath = typeof track.full_path === 'string'
    ? track.full_path.trim()
    : (typeof track.fullpath === 'string' ? track.fullpath.trim() : '');
  if (fullPath) {
    return fullPath;
  }

  const path = typeof track.path === 'string' ? track.path.trim() : '';
  return path;
}

function rememberFiles(files) {
  files.forEach((file) => {
    const normalizedTrack = normalizeTrack(file);
    state.fileRegistry[normalizedTrack.path] = normalizedTrack;
  });
}

function getFileFromRegistry(path) {
  const knownFile = state.fileRegistry[path] || state.files.find((item) => item.path === path);
  if (knownFile) {
    return normalizeTrack(knownFile);
  }

  if (!path) {
    return null;
  }

  return normalizeTrack({ path });
}

function updateEmptyState() {
  if (!el.contentLoader.hidden) {
    el.emptyState.hidden = true;
    return;
  }

  const hasDirectories = state.showDirectories && state.filteredDirectories.length > 0;
  const hasFiles = state.showFiles && state.filteredFiles.length > 0;
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
  el.directoriesList.hidden = !state.showDirectories;
  el.filesList.hidden = !state.showFiles;
  updateCounters();
  updateEmptyState();
}

async function loadDrives() {
  setStatus('Chargement des supports...');
  showLoader('Chargement des supports...');
  renderDrives();

  try {
    const response = await fetch('/?get=moomuse_drives');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.drives = payload || [];

    renderDrives();
    setStatus(`Supports detectes : ${state.drives.length}`);

    if (!state.currentPath && state.drives.length) {
      await openPath(state.drives[0].path, false);
      return;
    }

    hideLoader();
    updateEmptyState();
  } catch (error) {
    console.error(error);
    hideLoader();
    updateEmptyState();
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

    const [directoriesResult, filesResult] = await Promise.allSettled([
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
        const tracks = batch.map((file) => normalizeTrack(file));
        rememberFiles(tracks);
        state.files.push(...tracks);
        revealContent();
        refreshContentView();
      })
    ]);

    const directoriesBasePath = directoriesResult.status === 'fulfilled'
      ? directoriesResult.value.basePath
      : null;
    const filesBasePath = filesResult.status === 'fulfilled'
      ? filesResult.value.basePath
      : null;
    const basePath = filesBasePath || directoriesBasePath || path;
    const loadingErrors = [];

    if (directoriesResult.status === 'rejected') {
      console.error(directoriesResult.reason);
      loadingErrors.push(`dossiers: ${directoriesResult.reason.message}`);
    }

    if (filesResult.status === 'rejected') {
      console.error(filesResult.reason);
      loadingErrors.push(`fichiers: ${filesResult.reason.message}`);
    }

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

    if (loadingErrors.length) {
      setStatus(`Chargement partiel pour ${state.currentPath} (${loadingErrors.join(' | ')})`, true);
    } 
    else {
      setStatus(`Dossier charge : ${state.currentPath}`);
    }
  } 
  catch (error) {
    console.error(error);
    hideLoader();
    updateEmptyState();
    setStatus(`Impossible de charger le dossier: ${error.message}`, true);
  } 
  finally {
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
            <button class="icon-button add-playlist-btn" type="button" data-path="${escapeHtml(file.path)}" title="Ajouter a la playlist" aria-label="Ajouter a la playlist"><span class="material-symbols-outlined" aria-hidden="true">add</span></button>
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

  const playbackPath = getTrackPlaybackPath(file);
  if (!playbackPath) {
    return '';
  }

  return `/?get=moomuse_stream&path=${encodeURIComponent(playbackPath)}`;
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
  const payload = JSON.stringify({
    name: state.currentPlaylistMeta.name || 'Playlist exportee',
    author: state.currentPlaylistMeta.author || '',
    description: state.currentPlaylistMeta.description || '',
    tracks: serializeCurrentPlaylistTracks()
  }, null, 2);
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
  const payload = JSON.stringify({
    name: state.currentPlaylistMeta.name || 'Playlist courante',
    author: state.currentPlaylistMeta.author || '',
    description: state.currentPlaylistMeta.description || '',
    tracks: serializeCurrentPlaylistTracks()
  }, null, 2);

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
  const playlist = normalizePlaylistRecord(parsed, { name: 'Playlist importee' });
  if (!Array.isArray(playlist.tracks) || playlist.tracks.some((item) => !item || typeof item !== 'object' || !(item.full_path || item.fullpath))) {
    throw new Error('invalid_playlist_format');
  }

  state.playlist = playlist.tracks
    .map((track) => {
      const fullPath = track.full_path || track.fullpath;
      state.fileRegistry[fullPath] = normalizeTrack({
        path: fullPath,
        full_path: fullPath,
        track_id: track.track_id ?? null,
        drive_id: track.drive_id ?? null,
        musicbrainz_track_id: track.musicbrainz_track_id ?? null
      });
      return fullPath;
    })
    .filter(Boolean);
  state.currentPlaylistMeta = {
    name: playlist.name,
    author: playlist.author || '',
    description: playlist.description || ''
  };
  state.activeSavedPlaylistId = 'current';
  syncCurrentTrackWithPlaylist();
  renderPlaylist();
  renderSavedPlaylists();
  closePlaylistMenu();
  setStatus(`Playlist importee : ${state.playlist.length} fichier(s)`);
  return playlist;
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
  const file = getFileFromRegistry(path);
  if (!file) {
    return;
  }

  state.currentTrack = file;
  state.currentPlaylistIndex = state.playlist.indexOf(path);
  renderPlayer(true);
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Lecture : ${file.name}`);
}

function renderPlayer(autoPlay = false) {
  const track = state.currentTrack;

  if (!track) {
    updateNowPlayingTitle('Aucun media selectionne');
    el.detailsPanel.innerHTML = 'Les informations du fichier selectionne apparaitront ici.';
    el.audioPlayer.removeAttribute('src');
    el.audioPlayer.load();
    return;
  }

  updateNowPlayingTitle(track.title || track.name);
  const selectionLines = [
    track.title,
    track.artist,
    track.album
  ].filter((value) => value && String(value).trim().length > 0);

  el.detailsPanel.innerHTML = `
    <small>${selectionLines.map((value) => `${escapeHtml(value)}`).join(' - ')}</small>
    ${selectionLines.length ? '<div class="details-spacer"></div>' : ''}
    <div><strong>Nom</strong><br>${escapeHtml(track.name)}</div>
    <div class="details-spacer"></div>
    <div><strong>Chemin</strong><br><span class="muted" style="display: inline-block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(track.path)}">${escapeHtml(track.path)}</span></div>
    <div class="details-spacer"></div>
    <div><strong>Extension</strong><br>${escapeHtml(track.extension || '-')}</div>
    <div class="details-spacer"></div>
    <div><strong>Taille</strong><br>${escapeHtml(formatBytes(track.size))}</div>
  `;

  syncDetailsVisibility();

  const mediaUrl = buildMediaUrl(track);
  if (!mediaUrl) {
    return;
  }

  const playbackPath = getTrackPlaybackPath(track);

  if (el.audioPlayer.dataset.path !== playbackPath) {
    el.audioPlayer.src = mediaUrl;
    el.audioPlayer.dataset.path = playbackPath;
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
el.showDirectoriesBtn.addEventListener('click', () => {
  state.showDirectories = !state.showDirectories;
  syncContentFilterButtons();
  refreshContentView();
});
el.showFilesBtn.addEventListener('click', () => {
  state.showFiles = !state.showFiles;
  syncContentFilterButtons();
  refreshContentView();
});
el.playlistsSearchInput.addEventListener('input', () => {
  state.playlistsQuery = el.playlistsSearchInput.value;
  renderSavedPlaylists();
});
el.playlistsToggleBtn.addEventListener('click', () => {
  state.playlistsExpanded = !state.playlistsExpanded;
  syncPlaylistsVisibility();
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

// Mode switching
el.browseModeBtn.addEventListener('click', () => {
  switchMode('browse');
});
el.libraryModeBtn.addEventListener('click', () => {
  switchMode('library');
});
el.libraryRefreshBtn.addEventListener('click', () => {
  loadLibraryTracks(state.libraryStart);
});
el.librarySearchInput.addEventListener('input', () => {
  state.libraryQuery = el.librarySearchInput.value;
  state.libraryStart = 0;

  if (librarySearchDebounceTimer) {
    clearTimeout(librarySearchDebounceTimer);
  }

  librarySearchDebounceTimer = setTimeout(() => {
    loadLibraryTracks(0);
    librarySearchDebounceTimer = null;
  }, 300);
});

// Playlist mode buttons
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
el.editPlaylistBtn.addEventListener('click', () => {
  openPlaylistEditModal();
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
    const playlist = importPlaylistFromText(content);
    saveNamedPlaylist(
      playlist.name || file.name.replace(/\.json$/i, ''),
      playlist.tracks,
      {
        author: playlist.author,
        description: playlist.description
      }
    );
  }
  catch (error) {
    console.error(error);
    closePlaylistMenu();
    setStatus('Import impossible : JSON de playlist invalide.', true);
  }
});
el.closePlaylistEditBtn.addEventListener('click', () => {
  closePlaylistEditModal();
});
el.cancelPlaylistEditBtn.addEventListener('click', () => {
  closePlaylistEditModal();
});
el.savePlaylistEditBtn.addEventListener('click', () => {
  savePlaylistEdit();
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
el.audioPlayer.addEventListener('play', () => {
  requestWakeLock();
});
el.audioPlayer.addEventListener('pause', () => {
  releaseWakeLock();
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
el.playlistEditModal.addEventListener('click', (event) => {
  if (event.target === el.playlistEditModal) {
    closePlaylistEditModal();
  }
});
window.addEventListener('resize', () => {
  updateNowPlayingTitle(state.currentTrack ? state.currentTrack.name : 'Aucun media selectionne');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    releaseWakeLock();
    return;
  }

  if (!el.audioPlayer.paused && !el.audioPlayer.ended) {
    requestWakeLock();
  }
});
themeMediaQuery.addEventListener('change', () => {
  if (state.themeMode === 'auto') {
    applyTheme();
  }
});

applyTheme();
loadSavedPlaylists();
syncDetailsVisibility();
syncPlaylistsVisibility();
syncContentFilterButtons();
syncPlaylistModeButtons();
renderSavedPlaylists();
renderPlaylist();
loadDrives();
window.addEventListener('load', startCronPolling, { once: true });









