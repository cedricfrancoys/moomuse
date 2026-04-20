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
    name: '',
    author: '',
    description: ''
  },
  playlistsQuery: '',
  fileRegistry: {},
  currentTrack: null,
  currentPlaylistIndex: -1,
  activePlayerKey: 'primary',
  queuedPlayerKey: 'secondary',
  bufferPlayerKey: 'tertiary',
  fadingPlayerKey: null,
  queuedTrack: null,
  queuedPlaylistIndex: -1,
  bufferTrack: null,
  bufferPlaylistIndex: -1,
  crossfadeInProgress: false,
  crossfadePlayerStarted: false,
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
  mode: 'library', // 'browse', 'library' or 'visualize'
  libraryTracks: [],
  libraryCategory: 'all',
  libraryQuery: '',
  libraryPage: 1,
  libraryStart: 0,
  libraryPageSize: 50,
  libraryTotalCount: 0,
  libraryRequestId: 0
};

const PAGE_SIZE = 100;
const LIBRARY_SEARCH_LIMIT = 50;

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
  currentPlaylistName: document.getElementById('currentPlaylistName'),
  playlistPlayBtn: document.getElementById('playlistPlayBtn'),
  playlistSkipBtn: document.getElementById('playlistSkipBtn'),
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
  secondaryAudioPlayer: document.getElementById('secondaryAudioPlayer'),
  tertiaryAudioPlayer: document.getElementById('tertiaryAudioPlayer'),
  playerLikeBtn: document.getElementById('playerLikeBtn'),
  playerAddPlaylistBtn: document.getElementById('playerAddPlaylistBtn'),
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
  visualizeModeBtn: document.getElementById('visualizeModeBtn'),
  modeDescription: document.getElementById('modeDescription'),
  browseSidebar: document.getElementById('browseSidebar'),
  librarySidebar: document.getElementById('librarySidebar'),
  visualizeSidebar: document.getElementById('visualizeSidebar'),
  browseToolbar: document.getElementById('browseToolbar'),
  libraryToolbar: document.getElementById('libraryToolbar'),
  visualizeToolbar: document.getElementById('visualizeToolbar'),
  browseContent: document.getElementById('browseContent'),
  libraryContent: document.getElementById('libraryContent'),
  visualizeContent: document.getElementById('visualizeContent'),
  visualizationGrid: document.getElementById('visualizationGrid'),
  // Library elements
  librarySearchInput: document.getElementById('librarySearchInput'),
  libraryRefreshBtn: document.getElementById('libraryRefreshBtn'),
  libraryList: document.getElementById('libraryList'),
  libraryPagination: document.getElementById('libraryPagination'),
  libraryEmptyState: document.getElementById('libraryEmptyState'),
  librarySubtitle: document.getElementById('librarySubtitle'),
  visualizeTrackInfo: document.getElementById('visualizeTrackInfo'),
  visualizeConfidence: document.getElementById('visualizeConfidence'),
  visualizeCardsToggleBtn: document.getElementById('visualizeCardsToggleBtn'),
  visualizeCardsToggleIcon: document.getElementById('visualizeCardsToggleIcon'),
  visualizeElapsed: document.getElementById('visualizeElapsed'),
  emotionWheel: document.getElementById('emotionWheel'),
  emotionWheelCursor: document.getElementById('emotionWheelCursor'),
  emotionWheelSelectionCursor: document.getElementById('emotionWheelSelectionCursor'),
  emotionWheelSelectionDirection: document.getElementById('emotionWheelSelectionDirection'),
  emotionWheelSelectionEmotion: document.getElementById('emotionWheelSelectionEmotion'),
  emotionWheelSelectionMeta: document.getElementById('emotionWheelSelectionMeta'),
  visualizeTrackAverageEnergy: document.getElementById('visualizeTrackAverageEnergy'),
  visualizeTrackAverageTension: document.getElementById('visualizeTrackAverageTension'),
  visualizeTrackAverageTemperament: document.getElementById('visualizeTrackAverageTemperament'),
  visualizeTrackAverageStability: document.getElementById('visualizeTrackAverageStability'),
  visualizeTrackAverageValence: document.getElementById('visualizeTrackAverageValence'),
  visualizeBarInstantEnergy: document.getElementById('visualizeBarInstantEnergy'),
  visualizeBarShortEnergy: document.getElementById('visualizeBarShortEnergy'),
  visualizeBarLongEnergy: document.getElementById('visualizeBarLongEnergy'),
  visualizeBarTrackEnergy: document.getElementById('visualizeBarTrackEnergy'),
  visualizeBarPerceivedEnergy: document.getElementById('visualizeBarPerceivedEnergy'),
  visualizeBarInstantTension: document.getElementById('visualizeBarInstantTension'),
  visualizeBarShortTension: document.getElementById('visualizeBarShortTension'),
  visualizeBarLongTension: document.getElementById('visualizeBarLongTension'),
  visualizeBarTrackTension: document.getElementById('visualizeBarTrackTension'),
  visualizeBarPerceivedTension: document.getElementById('visualizeBarPerceivedTension'),
  visualizeBarInstantTemperament: document.getElementById('visualizeBarInstantTemperament'),
  visualizeBarShortTemperament: document.getElementById('visualizeBarShortTemperament'),
  visualizeBarLongTemperament: document.getElementById('visualizeBarLongTemperament'),
  visualizeBarTrackTemperament: document.getElementById('visualizeBarTrackTemperament'),
  visualizeBarPerceivedTemperament: document.getElementById('visualizeBarPerceivedTemperament'),
  visualizeBarInstantStability: document.getElementById('visualizeBarInstantStability'),
  visualizeBarShortStability: document.getElementById('visualizeBarShortStability'),
  visualizeBarLongStability: document.getElementById('visualizeBarLongStability'),
  visualizeBarTrackStability: document.getElementById('visualizeBarTrackStability'),
  visualizeBarPerceivedStability: document.getElementById('visualizeBarPerceivedStability'),
  visualizeBarInstantValence: document.getElementById('visualizeBarInstantValence'),
  visualizeBarShortValence: document.getElementById('visualizeBarShortValence'),
  visualizeBarLongValence: document.getElementById('visualizeBarLongValence'),
  visualizeBarHeaderValence: document.getElementById('visualizeBarHeaderValence'),
  visualizeBarTrackValence: document.getElementById('visualizeBarTrackValence'),
  visualizeBarPerceivedValence: document.getElementById('visualizeBarPerceivedValence')
};

let snackbarTimer = null;
let librarySearchDebounceTimer = null;
const likedTrackPaths = new Set();
const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const AUDIO_PLAYER_KEYS = ['primary', 'secondary', 'tertiary'];
const PLAYLIST_STORAGE_KEY = 'moo_saved_playlists';
const CURRENT_PLAYLIST_STORAGE_KEY = 'moo_current_playlist';
const ACTIVE_PLAYLIST_STORAGE_KEY = 'moo_active_playlist';
const CRON_INTERVAL_MS = 60000;
const CROSSFADE_TRIGGER_SECONDS = 10;
const CROSSFADE_DURATION_MS = 10000;
const CROSSFADE_MIN_DURATION_MS = 1200;
const AUDIO_ANALYSIS_INTERVAL_MS = 40;
const AUDIO_ANALYSIS_UI_INTERVAL_MS = 320;
const AUDIO_ANALYSIS_SHORT_ALPHA = 0.08;
const AUDIO_ANALYSIS_LONG_ALPHA = 0.01;
const AUDIO_ANALYSIS_LONG_ALPHA_FAST = 0.035;
const AUDIO_ANALYSIS_DRIFT_THRESHOLD = 0.18;
const AUDIO_ANALYSIS_DRIFT_UPDATES = 6;
const AUDIO_ANALYSIS_END_WINDOW_MS = 10000;
const AUDIO_ANALYSIS_PERCEIVED_GAMMA = 1.5;
const EMOTION_WHEEL_SMOOTHING_ALPHA = 0.10;
const EMOTION_WHEEL_POSITION_GAIN = 1.75;
const EMOTION_WHEEL_MIN_VISIBLE_RADIUS = 0.18;
const EMOTION_WHEEL_CENTER_THRESHOLD = 0.05;
const AUDIO_ANALYSIS_SILENCE_RMS_THRESHOLD = 0.008;
const AUDIO_ANALYSIS_SILENCE_PEAK_THRESHOLD = 0.02;
const AUDIO_ANALYSIS_SILENCE_SPECTRUM_THRESHOLD = 0.018;
const AUDIO_ANALYSIS_SILENCE_CONSECUTIVE_FRAMES = 4;
const AUDIO_ANALYSIS_ONSET_THRESHOLD = 0.34;
const AUDIO_ANALYSIS_ONSET_MIN_GAP_MS = 90;
const AUDIO_FEATURE_BOUNDS = {
  rms: { min: 0.015, max: 0.45 },
  peak: { min: 0.05, max: 1.0 },
  zeroCrossingRate: { min: 0.01, max: 0.3 },
  spectralCentroidHz: { min: 700, max: 4200 },
  spectralSpreadHz: { min: 350, max: 3200 },
  spectralFlux: { min: 0.002, max: 0.08 },
  lowBandRatio: { min: 0.05, max: 0.75 },
  midBandRatio: { min: 0.05, max: 0.8 },
  highBandRatio: { min: 0.01, max: 0.55 },
  highPresenceRatio: { min: 0.005, max: 0.35 },
  dynamicVariation: { min: 0.005, max: 0.3 },
  spectralVariation: { min: 0.003, max: 0.28 },
  transientSharpness: { min: 0.008, max: 0.22 },
  fluxVariance: { min: 0.002, max: 0.22 },
  rhythmicDensity: { min: 0.2, max: 4.5 },
  ioiVariance: { min: 0.002, max: 0.08 },
  temporalCompression: { min: 0.15, max: 0.95 },
  patternDrift: { min: 0.002, max: 0.12 }
};
const EMOTION_DIMENSIONS = ['energy', 'tension', 'temperament', 'stability', 'valence'];
const BIPOLAR_EMOTION_DIMENSIONS = ['temperament', 'valence'];
const UNIPOLAR_EMOTION_DIMENSIONS = ['energy', 'tension', 'stability'];
let wakeLock = null;
let wakeLockEnabled = 'wakeLock' in navigator;
let audioAnalysisFrameId = 0;
let audioAnalysisLastSampleAt = 0;
let audioAnalysisLastUiUpdateAt = 0;
let crossfadeAnimationFrameId = 0;

const audioAnalysis = {
  context: null,
  sources: {},
  analyser: null,
  timeData: null,
  freqData: null,
  prevFreqData: null,
  featureHistory: [],
  onsetHistory: [],
  onsetTimes: [],
  ioiHistory: [],
  rhythmFluxHistory: [],
  dynamicHistory: [],
  activeFrameHistory: [],
  states: createEmptyEmotionState(),
  trackAxisHistory: createEmotionAxisHistory(),
  trackTimeline: [],
  trackProfile: createTrackEmotionProfile(),
  trackProfileDirty: false,
  confidence: 0,
  elapsedMs: 0,
  trackAverageSamples: 0,
  driftCounters: {
    energy: 0,
    tension: 0,
    temperament: 0,
    stability: 0,
    valence: 0
  },
  silenceFrames: 0,
  activeTrackPath: ''
};
const emotionWheelState = {
  current: { x: 0, y: 0, r: 0 },
  target: { x: 0, y: 0, r: 0 }
};
const emotionWheelSelectionState = {
  theta: null,
  radius: null,
  result: null
};
const EMOTION_WHEEL_DIRECTIONS = [
  'N',
  'N-NNE',
  'N-NE',
  'NNE-NE',
  'NE',
  'NE-ENE',
  'NE-E',
  'ENE-E',
  'E',
  'E-ESE',
  'E-SE',
  'ESE-SE',
  'SE',
  'SE-SSE',
  'SE-S',
  'SSE-S',
  'S',
  'S-SSW',
  'S-SW',
  'SSW-SW',
  'SW',
  'SW-WSW',
  'SW-W',
  'WSW-W',
  'W',
  'W-WNW',
  'W-NW',
  'WNW-NW',
  'NW',
  'NW-NNW',
  'NW-N',
  'NNW-N'
];
const EMOTION_WHEEL_MAP = {
  N: { 1: 'bien-être', 2: 'plaisir', 3: 'joie' },
  'N-NNE': { 1: 'reconnaissance', 2: 'gratitude', 3: 'gratitude_profonde' },
  'N-NE': { 1: 'envie', 2: 'élan', 3: 'élan_vital' },
  'NNE-NE': { 1: 'intérêt_actif', 2: 'motivation', 3: 'engagement' },
  NE: { 1: 'intérêt', 2: 'motivation_forte', 3: 'enthousiasme' },
  'NE-ENE': { 1: 'stimulation_légère', 2: 'stimulation', 3: 'stimulation_intense' },
  'NE-E': { 1: 'excitation_légère', 2: 'excitation', 3: 'excitation_forte' },
  'ENE-E': { 1: 'tension_légère', 2: 'tension', 3: 'tension_forte' },
  E: { 1: 'inquiétude', 2: 'stress', 3: 'anxiété' },
  'E-ESE': { 1: 'doute', 2: 'inquiétude_forte', 3: 'inquiétude_profonde' },
  'E-SE': { 1: 'appréhension_légère', 2: 'appréhension', 3: 'appréhension_forte' },
  'ESE-SE': { 1: 'sensibilité', 2: 'fragilité', 3: 'vulnérabilité' },
  SE: { 1: 'déception', 2: 'chagrin', 3: 'tristesse' },
  'SE-SSE': { 1: 'peine', 2: 'chagrin_profond', 3: 'douleur_émotionnelle' },
  'SE-S': { 1: 'fatigue_émotionnelle', 2: 'abattement', 3: 'abattement_profond' },
  'SSE-S': { 1: 'désillusion_légère', 2: 'désillusion', 3: 'désillusion_profonde' },
  S: { 1: 'tristesse_douce', 2: 'nostalgie', 3: 'mélancolie' },
  'S-SSW': { 1: 'souvenir', 2: 'nostalgie_profonde', 3: 'attachement_passé' },
  'S-SW': { 1: 'réflexion', 2: 'introspection', 3: 'introspection_profonde' },
  'SSW-SW': { 1: 'acceptation_légère', 2: 'acceptation', 3: 'lâcher-prise' },
  SW: { 1: 'relâchement', 2: 'soulagement', 3: 'apaisement' },
  'SW-WSW': { 1: 'détente', 2: 'relâchement_profond', 3: 'libération' },
  'SW-W': { 1: 'calme', 2: 'calme_profond', 3: 'stabilité' },
  'WSW-W': { 1: 'équilibre_léger', 2: 'équilibre', 3: 'équilibre_stable' },
  W: { 1: 'calme_intérieur', 2: 'paix', 3: 'sérénité' },
  'W-WNW': { 1: 'satisfaction_légère', 2: 'satisfaction', 3: 'satisfaction_profonde' },
  'W-NW': { 1: 'contentement_léger', 2: 'contentement', 3: 'contentement_stable' },
  'WNW-NW': { 1: 'bien-être_stable', 2: 'plénitude', 3: 'plénitude_profonde' },
  NW: { 1: 'affection', 2: 'attachement', 3: 'contentement' },
  'NW-NNW': { 1: 'tendresse', 2: 'affection_profonde', 3: 'attachement_fort' },
  'NW-N': { 1: 'proximité', 2: 'attachement_stable', 3: 'lien_affectif' },
  'NNW-N': { 1: 'harmonie', 2: 'bien-être', 3: 'alignement' }
};

function normalizeLibrarySearchQuery(query) {
  const source = String(query || '').trim();
  if (!source.length) {
    return '';
  }

  return source
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss')
    .replace(/\u00C6/g, 'AE')
    .replace(/\u00E6/g, 'ae')
    .replace(/\u0152/g, 'OE')
    .replace(/\u0153/g, 'oe')
    .replace(/\u00D8/g, 'O')
    .replace(/\u00F8/g, 'o')
    .replace(/\u0110/g, 'D')
    .replace(/\u0111/g, 'd')
    .replace(/\u0141/g, 'L')
    .replace(/\u0142/g, 'l')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAudioPlayerByKey(key) {
  if (key === 'secondary') {
    return el.secondaryAudioPlayer;
  }

  if (key === 'tertiary') {
    return el.tertiaryAudioPlayer;
  }

  return el.audioPlayer;
}

function getActiveAudioPlayer() {
  return getAudioPlayerByKey(state.activePlayerKey);
}

function getQueuedAudioPlayer() {
  return getAudioPlayerByKey(state.queuedPlayerKey);
}

function getBufferAudioPlayer() {
  return getAudioPlayerByKey(state.bufferPlayerKey);
}

function getFadingAudioPlayer() {
  return state.fadingPlayerKey ? getAudioPlayerByKey(state.fadingPlayerKey) : null;
}

function isPlayerPlaying(player) {
  return Boolean(player && !player.paused && !player.ended && player.currentSrc);
}

function hasAnyPlayingAudio() {
  return AUDIO_PLAYER_KEYS.some((key) => isPlayerPlaying(getAudioPlayerByKey(key)));
}

function syncAudioPlayerVisibility() {
  const activePlayer = getActiveAudioPlayer();
  AUDIO_PLAYER_KEYS.forEach((key) => {
    const player = getAudioPlayerByKey(key);
    const isActivePlayer = key === state.activePlayerKey;
    player.hidden = false;
    player.classList.toggle('is-active', isActivePlayer);
    player.setAttribute('aria-hidden', isActivePlayer ? 'false' : 'true');
  });
}

function clearAudioPlayer(player) {
  if (!player) {
    return;
  }

  player.pause();
  player.volume = 1;
  delete player.dataset.path;
  delete player.dataset.playlistIndex;
  player.removeAttribute('src');
  player.load();
}

function stopCrossfadeAnimation() {
  if (!crossfadeAnimationFrameId) {
    return;
  }

  cancelAnimationFrame(crossfadeAnimationFrameId);
  crossfadeAnimationFrameId = 0;
}

function cancelCrossfade() {
  stopCrossfadeAnimation();
  state.crossfadeInProgress = false;
  state.crossfadePlayerStarted = false;
  const fadingPlayer = getFadingAudioPlayer();
  if (fadingPlayer) {
    clearAudioPlayer(fadingPlayer);
  }
  state.fadingPlayerKey = null;
  getActiveAudioPlayer().volume = 1;
  getQueuedAudioPlayer().volume = 1;
  getBufferAudioPlayer().volume = 1;
  syncAudioPlayerVisibility();
}

function resetAudioAnalysisContext() {
  if (audioAnalysis.context) {
    audioAnalysis.context.close().catch((error) => {
      console.error(error);
    });
  }

  audioAnalysis.context = null;
  audioAnalysis.sources = {};
  audioAnalysis.analyser = null;
  audioAnalysis.timeData = null;
  audioAnalysis.freqData = null;
}

function getNextPlaylistIndex() {
  return getPlaylistIndexAtOffset(1);
}

function getPlaylistIndexAtOffset(offset) {
  if (!state.playlist.length || state.currentPlaylistIndex < 0) {
    return -1;
  }

  const rawIndex = state.currentPlaylistIndex + offset;
  if (rawIndex >= 0 && rawIndex < state.playlist.length) {
    return rawIndex;
  }

  if (!state.repeatMode) {
    return -1;
  }

  const length = state.playlist.length;
  return ((rawIndex % length) + length) % length;
}

function loadTrackIntoPlayer(player, track, playlistIndex) {
  if (!player || !track) {
    clearAudioPlayer(player);
    return false;
  }

  const mediaUrl = buildMediaUrl(track);
  const playbackPath = getTrackPlaybackPath(track);
  if (!mediaUrl || !playbackPath) {
    clearAudioPlayer(player);
    return false;
  }

  if (player.dataset.path !== playbackPath) {
    player.src = mediaUrl;
    player.dataset.path = playbackPath;
    player.dataset.playlistIndex = String(playlistIndex);
    player.load();
  }
  else {
    try {
      player.currentTime = 0;
    }
    catch (error) {
      console.error(error);
    }
  }

  player.volume = 0;
  return true;
}

function rebuildUpcomingPlayers() {
  const inactiveKeys = AUDIO_PLAYER_KEYS.filter((key) => key !== state.activePlayerKey);
  const [nextQueuedKey, nextBufferKey] = inactiveKeys;

  state.crossfadeInProgress = false;
  state.crossfadePlayerStarted = false;
  state.fadingPlayerKey = null;
  state.queuedPlayerKey = nextQueuedKey;
  state.bufferPlayerKey = nextBufferKey;
  state.queuedTrack = null;
  state.queuedPlaylistIndex = -1;
  state.bufferTrack = null;
  state.bufferPlaylistIndex = -1;

  inactiveKeys.forEach((key) => {
    clearAudioPlayer(getAudioPlayerByKey(key));
  });

  const activePlayer = getActiveAudioPlayer();
  activePlayer.volume = 1;
  syncAudioPlayerVisibility();
  prepareUpcomingTracks();
}

function prepareUpcomingTracks() {
  if (state.crossfadeInProgress || !state.currentTrack?.path) {
    return;
  }

  const queuedIndex = getPlaylistIndexAtOffset(1);
  if (queuedIndex >= 0) {
    const queuedTrack = getFileFromRegistry(state.playlist[queuedIndex]);
    if (queuedTrack && loadTrackIntoPlayer(getQueuedAudioPlayer(), queuedTrack, queuedIndex)) {
      state.queuedTrack = queuedTrack;
      state.queuedPlaylistIndex = queuedIndex;
    }
    else {
      state.queuedTrack = null;
      state.queuedPlaylistIndex = -1;
    }
  }
  else {
    state.queuedTrack = null;
    state.queuedPlaylistIndex = -1;
    clearAudioPlayer(getQueuedAudioPlayer());
  }

  const bufferIndex = getPlaylistIndexAtOffset(2);
  if (bufferIndex >= 0) {
    const bufferTrack = getFileFromRegistry(state.playlist[bufferIndex]);
    if (bufferTrack && loadTrackIntoPlayer(getBufferAudioPlayer(), bufferTrack, bufferIndex)) {
      state.bufferTrack = bufferTrack;
      state.bufferPlaylistIndex = bufferIndex;
    }
    else {
      state.bufferTrack = null;
      state.bufferPlaylistIndex = -1;
    }
  }
  else {
    state.bufferTrack = null;
    state.bufferPlaylistIndex = -1;
    clearAudioPlayer(getBufferAudioPlayer());
  }
}

function normalize(value, min, max) {
  if (max <= min) {
    return 0;
  }

  return clamp((value - min) / (max - min), 0, 1);
}

function createEmotionVector() {
  return {
    energy: 0,
    tension: 0,
    temperament: 0,
    stability: 0,
    valence: 0
  };
}

function createEmptyEmotionState() {
  return {
    instant: createEmotionVector(),
    shortTerm: createEmotionVector(),
    longTerm: createEmotionVector(),
    trackAverage: createEmotionVector(),
    trackPerceived: createEmotionVector()
  };
}

function createEmotionAxisHistory() {
  return EMOTION_DIMENSIONS.reduce((history, dimension) => {
    history[dimension] = [];
    return history;
  }, {});
}

function createTrackEmotionProfile() {
  return {
    average: createEmotionVector(),
    perceived: createEmotionVector(),
    peaks: {
      energy: 0,
      tension: 0,
      stability: 0,
      temperamentPositive: 0,
      temperamentNegative: 0,
      valencePositive: 0,
      valenceNegative: 0
    },
    percentiles: {
      p80: createEmotionVector(),
      p90: createEmotionVector()
    },
    endWindow: createEmotionVector()
  };
}

function averageValues(values) {
  if (!Array.isArray(values) || !values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageAbsoluteDelta(values) {
  if (!Array.isArray(values) || values.length < 2) {
    return 0;
  }

  let totalDelta = 0;
  for (let index = 1; index < values.length; index += 1) {
    totalDelta += Math.abs(values[index] - values[index - 1]);
  }

  return totalDelta / (values.length - 1);
}

function computePercentile(values, percentile) {
  if (!Array.isArray(values) || !values.length) {
    return 0;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const scaledIndex = clamp(percentile, 0, 1) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.ceil(scaledIndex);
  const mix = scaledIndex - lowerIndex;

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  return sortedValues[lowerIndex] + ((sortedValues[upperIndex] - sortedValues[lowerIndex]) * mix);
}

function computeBiasedMean(values, isBipolar = false, gamma = AUDIO_ANALYSIS_PERCEIVED_GAMMA) {
  if (!Array.isArray(values) || !values.length) {
    return 0;
  }

  const transformedValues = values.map((value) => {
    if (!isBipolar) {
      return value ** gamma;
    }

    const magnitude = Math.abs(value) ** gamma;
    return Math.sign(value) * magnitude;
  });

  return averageValues(transformedValues);
}

function computeSignedPercentile(values, percentile) {
  if (!Array.isArray(values) || !values.length) {
    return 0;
  }

  const positiveValues = values.filter((value) => value > 0);
  const negativeMagnitudes = values.filter((value) => value < 0).map((value) => Math.abs(value));
  const positivePercentile = computePercentile(positiveValues, percentile);
  const negativePercentile = computePercentile(negativeMagnitudes, percentile);

  return clamp(positivePercentile - negativePercentile, -1, 1);
}

function recordTrackEmotionSample(vector, timeMs) {
  EMOTION_DIMENSIONS.forEach((dimension) => {
    audioAnalysis.trackAxisHistory[dimension].push(vector[dimension]);
  });

  audioAnalysis.trackTimeline.push({
    timeMs,
    ...vector
  });
  audioAnalysis.trackProfileDirty = true;
}

function computeEndWindowVector() {
  if (!audioAnalysis.trackTimeline.length) {
    return createEmotionVector();
  }

  const lastTimeMs = audioAnalysis.trackTimeline[audioAnalysis.trackTimeline.length - 1].timeMs;
  const windowStartMs = Math.max(0, lastTimeMs - AUDIO_ANALYSIS_END_WINDOW_MS);
  const endSamples = audioAnalysis.trackTimeline.filter((sample) => sample.timeMs >= windowStartMs);

  if (!endSamples.length) {
    return createEmotionVector();
  }

  return EMOTION_DIMENSIONS.reduce((vector, dimension) => {
    vector[dimension] = averageValues(endSamples.map((sample) => sample[dimension]));
    return vector;
  }, createEmotionVector());
}

function computeTrackEmotionProfile() {
  const profile = createTrackEmotionProfile();

  if (!audioAnalysis.trackTimeline.length) {
    return profile;
  }

  profile.average = { ...audioAnalysis.states.trackAverage };
  profile.endWindow = computeEndWindowVector();

  UNIPOLAR_EMOTION_DIMENSIONS.forEach((dimension) => {
    const values = audioAnalysis.trackAxisHistory[dimension];
    profile.peaks[dimension] = values.length ? Math.max(...values) : 0;
    profile.percentiles.p80[dimension] = computePercentile(values, 0.8);
    profile.percentiles.p90[dimension] = computePercentile(values, 0.9);
    const biasedMean = computeBiasedMean(values, false);
    profile.perceived[dimension] = clamp(
      (0.35 * biasedMean)
      + (0.40 * profile.percentiles.p90[dimension])
      + (0.25 * profile.endWindow[dimension]),
      0,
      1
    );
  });

  BIPOLAR_EMOTION_DIMENSIONS.forEach((dimension) => {
    const values = audioAnalysis.trackAxisHistory[dimension];
    const positiveValues = values.filter((value) => value > 0);
    const negativeMagnitudes = values.filter((value) => value < 0).map((value) => Math.abs(value));
    const positivePeak = positiveValues.length ? Math.max(...positiveValues) : 0;
    const negativePeak = negativeMagnitudes.length ? Math.max(...negativeMagnitudes) : 0;
    const signedP80 = computeSignedPercentile(values, 0.8);
    const signedP90 = computeSignedPercentile(values, 0.9);
    const biasedMean = computeBiasedMean(values, true);

    profile.percentiles.p80[dimension] = signedP80;
    profile.percentiles.p90[dimension] = signedP90;
    profile.perceived[dimension] = clamp(
      (0.40 * biasedMean)
      + (0.35 * signedP90)
      + (0.25 * profile.endWindow[dimension]),
      -1,
      1
    );

    if (dimension === 'temperament') {
      profile.peaks.temperamentPositive = positivePeak;
      profile.peaks.temperamentNegative = negativePeak ? -negativePeak : 0;
    }
    else if (dimension === 'valence') {
      profile.peaks.valencePositive = positivePeak;
      profile.peaks.valenceNegative = negativePeak ? -negativePeak : 0;
    }
  });

  profile.perceived.valence = computeDisplayedValence(profile.perceived);

  return profile;
}

function pushLimited(list, value, limit) {
  list.push(value);
  while (list.length > limit) {
    list.shift();
  }
}

function normalizeFeature(name, value) {
  const bounds = AUDIO_FEATURE_BOUNDS[name];
  if (!bounds) {
    return 0;
  }

  return normalize(value, bounds.min, bounds.max);
}

function smoothEmotionVector(nextVector, prevVector, alpha) {
  return {
    energy: prevVector.energy + ((nextVector.energy - prevVector.energy) * alpha),
    tension: prevVector.tension + ((nextVector.tension - prevVector.tension) * alpha),
    temperament: prevVector.temperament + ((nextVector.temperament - prevVector.temperament) * alpha),
    stability: prevVector.stability + ((nextVector.stability - prevVector.stability) * alpha),
    valence: prevVector.valence + ((nextVector.valence - prevVector.valence) * alpha)
  };
}

function resetAudioAnalysisState() {
  audioAnalysis.featureHistory = [];
  audioAnalysis.onsetHistory = [];
  audioAnalysis.onsetTimes = [];
  audioAnalysis.ioiHistory = [];
  audioAnalysis.rhythmFluxHistory = [];
  audioAnalysis.dynamicHistory = [];
  audioAnalysis.activeFrameHistory = [];
  audioAnalysis.prevFreqData = null;
  audioAnalysis.states = createEmptyEmotionState();
  audioAnalysis.trackAxisHistory = createEmotionAxisHistory();
  audioAnalysis.trackTimeline = [];
  audioAnalysis.trackProfile = createTrackEmotionProfile();
  audioAnalysis.trackProfileDirty = false;
  audioAnalysis.confidence = 0;
  audioAnalysis.elapsedMs = 0;
  audioAnalysis.trackAverageSamples = 0;
  audioAnalysis.driftCounters = {
    energy: 0,
    tension: 0,
    temperament: 0,
    stability: 0,
    valence: 0
  };
  audioAnalysis.silenceFrames = 0;
  audioAnalysisLastSampleAt = 0;
  audioAnalysisLastUiUpdateAt = 0;
}

function stopAudioAnalysisLoop() {
  if (audioAnalysisFrameId) {
    cancelAnimationFrame(audioAnalysisFrameId);
    audioAnalysisFrameId = 0;
  }
}

function resetVisualizationUi() {
  el.visualizeTrackInfo.innerHTML = 'Des infos seront visibles en cours de lecture.';
  el.visualizeConfidence.textContent = 'Confiance 0%';
  el.visualizeElapsed.textContent = '0 ms analyses';
  el.visualizeTrackAverageEnergy.textContent = '0.00';
  el.visualizeTrackAverageTension.textContent = '0.00';
  el.visualizeTrackAverageTemperament.textContent = '0.00';
  el.visualizeTrackAverageStability.textContent = '0.00';
  el.visualizeTrackAverageValence.textContent = '0.00';

  [
    el.visualizeBarInstantEnergy,
    el.visualizeBarShortEnergy,
    el.visualizeBarLongEnergy,
    el.visualizeBarTrackEnergy,
    el.visualizeBarPerceivedEnergy,
    el.visualizeBarInstantTension,
    el.visualizeBarShortTension,
    el.visualizeBarLongTension,
    el.visualizeBarTrackTension,
    el.visualizeBarPerceivedTension,
    el.visualizeBarInstantStability,
    el.visualizeBarShortStability,
    el.visualizeBarLongStability,
    el.visualizeBarTrackStability,
    el.visualizeBarPerceivedStability
  ].filter(Boolean).forEach((bar) => {
    bar.style.width = '0%';
  });

  [
    el.visualizeBarHeaderValence,
    el.visualizeBarInstantValence,
    el.visualizeBarShortValence,
    el.visualizeBarLongValence,
    el.visualizeBarTrackValence,
    el.visualizeBarPerceivedValence
  ].filter(Boolean).forEach((bar) => {
    bar.style.left = '50%';
    bar.style.width = '0%';
  });

  [
    el.visualizeBarInstantTemperament,
    el.visualizeBarShortTemperament,
    el.visualizeBarLongTemperament,
    el.visualizeBarTrackTemperament,
    el.visualizeBarPerceivedTemperament
  ].filter(Boolean).forEach((bar) => {
    bar.style.left = '50%';
    bar.style.width = '0%';
  });

  document.querySelectorAll('.emotion-row-value').forEach((node) => {
    node.textContent = '0.00';
  });

  emotionWheelState.current = { x: 0, y: 0, r: 0 };
  emotionWheelState.target = { x: 0, y: 0, r: 0 };
  renderEmotionWheel(true);
}

function renderVisualizationTrackInfo(track) {
  if (!track) {
    resetVisualizationUi();
    return;
  }

  const rawName = String(track.name || track.title || 'Piste inconnue');
  const displayName = rawName.replace(/\.[^.\\\/]+$/, '') || rawName;
  const path = escapeHtml(track.path || '');

  el.visualizeTrackInfo.innerHTML = `
    <div><strong>${escapeHtml(displayName)}</strong></div>
    ${path ? `<div title="${path}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${path}</div>` : ''}
  `;
}

function setEmotionBar(bar, value) {
  if (!bar) {
    return;
  }

  bar.style.width = `${clamp(value, 0, 1) * 100}%`;
}

function setBipolarEmotionBar(bar, value) {
  if (!bar) {
    return;
  }

  const normalized = clamp(value, -1, 1);
  if (normalized >= 0) {
    bar.style.left = '50%';
    bar.style.width = `${normalized * 50}%`;
    return;
  }

  bar.style.left = `${50 + (normalized * 50)}%`;
  bar.style.width = `${Math.abs(normalized) * 50}%`;
}

function computeDisplayedValence(perceivedAxes) {
  const energyComponent = ((perceivedAxes.energy || 0) * 2) - 1;
  const stabilityComponent = ((perceivedAxes.stability || 0) * 2) - 1;
  const tensionComponent = 1 - ((perceivedAxes.tension || 0) * 2);
  const temperamentComponent = perceivedAxes.temperament || 0;

  return clamp(
    (0.40 * temperamentComponent)
    + (0.20 * tensionComponent)
    + (0.20 * stabilityComponent)
    + (0.20 * energyComponent),
    -1,
    1
  );
}

function mapEmotionToWheel(stateVector) {
  const energy = clamp(stateVector?.energy ?? 0, 0, 1);
  const tension = clamp(stateVector?.tension ?? 0, 0, 1);
  const temperament = clamp(stateVector?.temperament ?? 0, -1, 1);
  const valence = clamp(stateVector?.valence ?? 0, -1, 1);

  return {
    x: clamp(tension * temperament, -1, 1),
    y: valence,
    r: clamp((0.6 * energy) + (0.4 * tension), 0, 1)
  };
}

function normalizeAngleDegrees(theta) {
  return ((theta % 360) + 360) % 360;
}

function clampNormalizedRadius(radius) {
  return clamp(Number.isFinite(radius) ? radius : 0, 0, 1);
}

function getWheelLevelFromRadius(radius) {
  const clampedRadius = clampNormalizedRadius(radius);
  if (clampedRadius < 0.25) {
    return 1;
  }

  if (clampedRadius < 0.60) {
    return 2;
  }

  return 3;
}

function getEmotionFromWheelPosition(theta, radius, directions, emotionMap) {
  if (!Array.isArray(directions) || !directions.length) {
    throw new Error('Emotion wheel directions must be a non-empty array.');
  }

  const normalizedTheta = normalizeAngleDegrees(theta);
  const clampedRadius = clampNormalizedRadius(radius);
  const segmentSize = 360 / directions.length;
  const index = Math.round(normalizedTheta / segmentSize) % directions.length;
  const direction = directions[index];

  if (!direction) {
    throw new Error(`No direction found at index ${index}.`);
  }

  if (clampedRadius < EMOTION_WHEEL_CENTER_THRESHOLD) {
    return {
      direction: 'center',
      level: 1,
      emotion: 'neutral'
    };
  }

  const level = getWheelLevelFromRadius(clampedRadius);
  const directionMap = emotionMap[direction];
  if (!directionMap) {
    throw new Error(`Missing emotion mapping for direction "${direction}".`);
  }

  const emotion = directionMap[String(level)];
  if (!emotion) {
    throw new Error(`Missing emotion mapping for direction "${direction}" at level "${level}".`);
  }

  return { direction, level, emotion };
}

function getWheelPositionFromEmotion(emotion, directions, emotionMap) {
  if (!emotion || typeof emotion !== 'string') {
    throw new Error('Emotion identifier must be a non-empty string.');
  }

  for (const direction of directions) {
    const directionMap = emotionMap[direction];
    if (!directionMap) {
      continue;
    }

    for (const levelKey of ['1', '2', '3']) {
      if (directionMap[levelKey] === emotion) {
        return {
          direction,
          level: Number(levelKey)
        };
      }
    }
  }

  throw new Error(`Emotion "${emotion}" is not present in the wheel mapping.`);
}

function getEmotionWheelSelectionGeometry(radius) {
  const size = el.emotionWheel?.clientWidth || 300;
  const center = size / 2;
  const wheelRadius = center - 12;
  return { center, wheelRadius };
}

function getEmotionWheelPolarCoordinates(clientX, clientY) {
  if (!el.emotionWheel) {
    return null;
  }

  const rect = el.emotionWheel.getBoundingClientRect();
  const centerX = rect.left + (rect.width / 2);
  const centerY = rect.top + (rect.height / 2);
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  const distance = Math.hypot(dx, dy);
  const radius = clampNormalizedRadius(distance / (Math.min(rect.width, rect.height) / 2));
  const theta = normalizeAngleDegrees((Math.atan2(dx, -dy) * 180) / Math.PI);

  return { theta, radius };
}

function renderEmotionWheelSelection() {
  if (!el.emotionWheelSelectionEmotion || !el.emotionWheelSelectionMeta || !el.emotionWheelSelectionDirection) {
    return;
  }

  const selection = emotionWheelSelectionState.result;
  if (!selection || emotionWheelSelectionState.theta == null || emotionWheelSelectionState.radius == null) {
    el.emotionWheelSelectionDirection.textContent = '-';
    el.emotionWheelSelectionEmotion.textContent = 'Clique dans la roue pour identifier une émotion.';
    el.emotionWheelSelectionMeta.textContent = 'Aucune sélection.';
    if (el.emotionWheelSelectionCursor) {
      el.emotionWheelSelectionCursor.hidden = true;
    }
    return;
  }

  el.emotionWheelSelectionDirection.textContent = selection.direction;
  el.emotionWheelSelectionEmotion.textContent = selection.emotion.replace(/_/g, ' ');
  el.emotionWheelSelectionMeta.textContent = `Niveau ${selection.level} • θ ${Math.round(emotionWheelSelectionState.theta)}° • r ${emotionWheelSelectionState.radius.toFixed(2)}`;

  if (!el.emotionWheelSelectionCursor || selection.direction === 'center') {
    if (el.emotionWheelSelectionCursor) {
      el.emotionWheelSelectionCursor.hidden = selection.direction === 'center';
    }
    return;
  }

  const normalizedTheta = normalizeAngleDegrees(emotionWheelSelectionState.theta);
  const thetaRadians = (normalizedTheta * Math.PI) / 180;
  const { center, wheelRadius } = getEmotionWheelSelectionGeometry();
  const clampedRadius = clampNormalizedRadius(emotionWheelSelectionState.radius);
  const px = center + (Math.sin(thetaRadians) * clampedRadius * wheelRadius);
  const py = center - (Math.cos(thetaRadians) * clampedRadius * wheelRadius);

  el.emotionWheelSelectionCursor.hidden = false;
  el.emotionWheelSelectionCursor.style.left = `${px}px`;
  el.emotionWheelSelectionCursor.style.top = `${py}px`;
}

function setEmotionWheelSelection(theta, radius) {
  emotionWheelSelectionState.theta = normalizeAngleDegrees(theta);
  emotionWheelSelectionState.radius = clampNormalizedRadius(radius);
  emotionWheelSelectionState.result = getEmotionFromWheelPosition(
    emotionWheelSelectionState.theta,
    emotionWheelSelectionState.radius,
    EMOTION_WHEEL_DIRECTIONS,
    EMOTION_WHEEL_MAP
  );
  renderEmotionWheelSelection();
  return emotionWheelSelectionState.result;
}

function handleEmotionWheelClick(event) {
  const polarCoordinates = getEmotionWheelPolarCoordinates(event.clientX, event.clientY);
  if (!polarCoordinates) {
    return;
  }

  try {
    setEmotionWheelSelection(polarCoordinates.theta, polarCoordinates.radius);
  }
  catch (error) {
    console.error(error);
  }
}

function renderEmotionWheel(force = false) {
  if (!el.emotionWheel || !el.emotionWheelCursor) {
    return;
  }

  const baseState = audioAnalysis.states.trackPerceived || createEmotionVector();
  const mapped = mapEmotionToWheel(baseState);
  const stability = clamp(baseState.stability ?? 0, 0, 1);
  const stabilityBlend = 0.35 + (0.65 * stability);

  emotionWheelState.target.x = mapped.x;
  emotionWheelState.target.y = mapped.y;
  emotionWheelState.target.r = mapped.r;

  if (force) {
    emotionWheelState.current.x = emotionWheelState.target.x;
    emotionWheelState.current.y = emotionWheelState.target.y;
    emotionWheelState.current.r = emotionWheelState.target.r;
  }
  else {
    emotionWheelState.current.x += ((emotionWheelState.target.x - emotionWheelState.current.x) * EMOTION_WHEEL_SMOOTHING_ALPHA * stabilityBlend);
    emotionWheelState.current.y += ((emotionWheelState.target.y - emotionWheelState.current.y) * EMOTION_WHEEL_SMOOTHING_ALPHA * stabilityBlend);
    emotionWheelState.current.r += ((emotionWheelState.target.r - emotionWheelState.current.r) * EMOTION_WHEEL_SMOOTHING_ALPHA);
  }

  const size = el.emotionWheel.clientWidth || 300;
  const center = size / 2;
  const wheelRadius = center - 12;
  const projectedRadius = clamp(
    EMOTION_WHEEL_MIN_VISIBLE_RADIUS
      + (emotionWheelState.current.r * (1 - EMOTION_WHEEL_MIN_VISIBLE_RADIUS)),
    0,
    1
  );
  const projectedX = clamp(
    emotionWheelState.current.x * projectedRadius * EMOTION_WHEEL_POSITION_GAIN,
    -1,
    1
  );
  const projectedY = clamp(
    emotionWheelState.current.y * projectedRadius * EMOTION_WHEEL_POSITION_GAIN,
    -1,
    1
  );
  const px = center + (projectedX * wheelRadius);
  const py = center - (projectedY * wheelRadius);
  const cursorSize = 12 + (emotionWheelState.current.r * 8);
  const cursorOpacity = 0.55 + (emotionWheelState.current.r * 0.4);

  el.emotionWheelCursor.style.left = `${px}px`;
  el.emotionWheelCursor.style.top = `${py}px`;
  el.emotionWheelCursor.style.width = `${cursorSize}px`;
  el.emotionWheelCursor.style.height = `${cursorSize}px`;
  el.emotionWheelCursor.style.opacity = `${cursorOpacity}`;
}

function renderEmotionState() {
  if (audioAnalysis.trackProfileDirty) {
    audioAnalysis.trackProfile = computeTrackEmotionProfile();
    audioAnalysis.states.trackPerceived = { ...audioAnalysis.trackProfile.perceived };
    audioAnalysis.trackProfileDirty = false;
  }

  const {
    instant,
    shortTerm,
    longTerm,
    trackAverage,
    trackPerceived
  } = audioAnalysis.states;
  const displayedValence = trackPerceived.valence;

  el.visualizeConfidence.textContent = `Confiance ${Math.round(audioAnalysis.confidence * 100)}%`;
  el.visualizeElapsed.textContent = `${Math.round(audioAnalysis.elapsedMs)} ms analyses`;
  el.visualizeTrackAverageEnergy.textContent = trackPerceived.energy.toFixed(2);
  el.visualizeTrackAverageTension.textContent = trackPerceived.tension.toFixed(2);
  el.visualizeTrackAverageTemperament.textContent = trackPerceived.temperament.toFixed(2);
  el.visualizeTrackAverageStability.textContent = trackPerceived.stability.toFixed(2);
  el.visualizeTrackAverageValence.textContent = displayedValence.toFixed(2);

  setEmotionBar(el.visualizeBarInstantEnergy, instant.energy);
  setEmotionBar(el.visualizeBarShortEnergy, shortTerm.energy);
  setEmotionBar(el.visualizeBarLongEnergy, longTerm.energy);
  setEmotionBar(el.visualizeBarTrackEnergy, trackAverage.energy);
  setEmotionBar(el.visualizeBarPerceivedEnergy, trackPerceived.energy);
  setEmotionBar(el.visualizeBarInstantTension, instant.tension);
  setEmotionBar(el.visualizeBarShortTension, shortTerm.tension);
  setEmotionBar(el.visualizeBarLongTension, longTerm.tension);
  setEmotionBar(el.visualizeBarTrackTension, trackAverage.tension);
  setEmotionBar(el.visualizeBarPerceivedTension, trackPerceived.tension);
  setEmotionBar(el.visualizeBarInstantStability, instant.stability);
  setEmotionBar(el.visualizeBarShortStability, shortTerm.stability);
  setEmotionBar(el.visualizeBarLongStability, longTerm.stability);
  setEmotionBar(el.visualizeBarTrackStability, trackAverage.stability);
  setEmotionBar(el.visualizeBarPerceivedStability, trackPerceived.stability);
  setBipolarEmotionBar(el.visualizeBarHeaderValence, displayedValence);
  setBipolarEmotionBar(el.visualizeBarInstantValence, instant.valence);
  setBipolarEmotionBar(el.visualizeBarShortValence, shortTerm.valence);
  setBipolarEmotionBar(el.visualizeBarLongValence, longTerm.valence);
  setBipolarEmotionBar(el.visualizeBarTrackValence, trackAverage.valence);
  setBipolarEmotionBar(el.visualizeBarPerceivedValence, trackPerceived.valence);
  setBipolarEmotionBar(el.visualizeBarInstantTemperament, instant.temperament);
  setBipolarEmotionBar(el.visualizeBarShortTemperament, shortTerm.temperament);
  setBipolarEmotionBar(el.visualizeBarLongTemperament, longTerm.temperament);
  setBipolarEmotionBar(el.visualizeBarTrackTemperament, trackAverage.temperament);
  setBipolarEmotionBar(el.visualizeBarPerceivedTemperament, trackPerceived.temperament);

  document.querySelectorAll('.emotion-row-value').forEach((node) => {
    const dimension = node.dataset.dimension;
    const scope = node.dataset.scope;
    const source = scope === 'instant'
      ? instant
      : (scope === 'short'
        ? shortTerm
        : (scope === 'long'
          ? longTerm
          : (scope === 'track' ? trackAverage : trackPerceived)));
    const value = typeof source[dimension] === 'number' ? source[dimension] : 0;
    node.textContent = value.toFixed(2);
  });

  renderEmotionWheel(true);
}

function setEmotionCardExpanded(button, details, expanded) {
  details.hidden = !expanded;
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function syncGlobalEmotionCardsToggle() {
  if (!el.visualizeCardsToggleBtn || !el.visualizeCardsToggleIcon || !el.visualizationGrid) {
    return;
  }

  const toggleButtons = [...el.visualizationGrid.querySelectorAll('.emotion-card-toggle')];
  const allExpanded = toggleButtons.length > 0 && toggleButtons.every((button) => button.getAttribute('aria-expanded') === 'true');
  el.visualizeCardsToggleBtn.setAttribute('aria-expanded', allExpanded ? 'true' : 'false');
  el.visualizeCardsToggleIcon.textContent = allExpanded ? 'unfold_less' : 'unfold_more';
}

function initEmotionCardToggles() {
  if (!el.visualizationGrid) {
    return;
  }

  el.visualizationGrid.querySelectorAll('.emotion-card-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('aria-controls');
      if (!targetId) {
        return;
      }

      const details = document.getElementById(targetId);
      if (!details) {
        return;
      }

      const willExpand = details.hidden;
      setEmotionCardExpanded(button, details, willExpand);
      syncGlobalEmotionCardsToggle();
    });
  });

  if (el.visualizeCardsToggleBtn) {
    el.visualizeCardsToggleBtn.addEventListener('click', () => {
      const toggleButtons = [...el.visualizationGrid.querySelectorAll('.emotion-card-toggle')];
      const detailPanels = toggleButtons.map((button) => document.getElementById(button.getAttribute('aria-controls')));
      const shouldExpandAll = toggleButtons.some((button) => button.getAttribute('aria-expanded') !== 'true');

      toggleButtons.forEach((button, index) => {
        const details = detailPanels[index];
        if (!details) {
          return;
        }

        setEmotionCardExpanded(button, details, shouldExpandAll);
      });

      syncGlobalEmotionCardsToggle();
    });
  }

  syncGlobalEmotionCardsToggle();
}

function computeZeroCrossingRate(timeData) {
  let crossings = 0;

  for (let i = 1; i < timeData.length; i += 1) {
    const previous = (timeData[i - 1] - 128) / 128;
    const current = (timeData[i] - 128) / 128;
    if ((previous >= 0 && current < 0) || (previous < 0 && current >= 0)) {
      crossings += 1;
    }
  }

  return crossings / Math.max(1, timeData.length - 1);
}

function computeAudioFeatures() {
  if (!audioAnalysis.analyser || !audioAnalysis.timeData || !audioAnalysis.freqData) {
    return null;
  }

  audioAnalysis.analyser.getByteTimeDomainData(audioAnalysis.timeData);
  audioAnalysis.analyser.getByteFrequencyData(audioAnalysis.freqData);

  const timeData = audioAnalysis.timeData;
  const freqData = audioAnalysis.freqData;
  const binCount = freqData.length;
  const sampleRate = audioAnalysis.context?.sampleRate || 44100;
  const nyquist = sampleRate / 2;
  const binFrequency = nyquist / Math.max(1, binCount);

  let rmsAccumulator = 0;
  let peak = 0;

  for (let i = 0; i < timeData.length; i += 1) {
    const sample = (timeData[i] - 128) / 128;
    rmsAccumulator += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const rms = Math.sqrt(rmsAccumulator / Math.max(1, timeData.length));
  const zeroCrossingRate = computeZeroCrossingRate(timeData);

  let totalMagnitude = 0;
  let weightedMagnitude = 0;
  let weightedSquaredMagnitude = 0;
  let lowBand = 0;
  let midBand = 0;
  let highBand = 0;
  let highPresenceBand = 0;
  let spectralFluxRaw = 0;

  for (let i = 0; i < binCount; i += 1) {
    const magnitude = freqData[i] / 255;
    const frequency = i * binFrequency;
    totalMagnitude += magnitude;
    weightedMagnitude += magnitude * frequency;
    weightedSquaredMagnitude += magnitude * frequency * frequency;

    if (frequency < 250) {
      lowBand += magnitude;
    }
    else if (frequency < 2000) {
      midBand += magnitude;
    }
    else {
      highBand += magnitude;
    }

    if (frequency >= 4000) {
      highPresenceBand += magnitude;
    }

    if (audioAnalysis.prevFreqData) {
      const diff = magnitude - audioAnalysis.prevFreqData[i];
      if (diff > 0) {
        spectralFluxRaw += diff;
      }
    }
  }

  const spectralCentroidHz = totalMagnitude > 0 ? weightedMagnitude / totalMagnitude : 0;
  const spectralSpreadHz = totalMagnitude > 0
    ? Math.sqrt(Math.max((weightedSquaredMagnitude / totalMagnitude) - (spectralCentroidHz * spectralCentroidHz), 0))
    : 0;
  const totalBand = Math.max(totalMagnitude, 0.0001);
  const averageSpectrumMagnitude = totalMagnitude / Math.max(1, binCount);
  const lowBandRatioRaw = lowBand / totalBand;
  const midBandRatioRaw = midBand / totalBand;
  const highBandRatioRaw = highBand / totalBand;
  const highPresenceRatioRaw = highPresenceBand / totalBand;
  const spectralFluxRawNormalized = spectralFluxRaw / Math.max(1, binCount);

  const isSilentFrame = (
    rms <= AUDIO_ANALYSIS_SILENCE_RMS_THRESHOLD
    && peak <= AUDIO_ANALYSIS_SILENCE_PEAK_THRESHOLD
    && averageSpectrumMagnitude <= AUDIO_ANALYSIS_SILENCE_SPECTRUM_THRESHOLD
  );

  if (isSilentFrame) {
    audioAnalysis.silenceFrames += 1;
  }
  else {
    audioAnalysis.silenceFrames = 0;
  }

  if (audioAnalysis.silenceFrames >= AUDIO_ANALYSIS_SILENCE_CONSECUTIVE_FRAMES) {
    audioAnalysis.prevFreqData = null;
    return null;
  }

  audioAnalysis.prevFreqData = Array.from(freqData, (value) => value / 255);

  return {
    rmsRaw: rms,
    peakRaw: peak,
    averageSpectrumMagnitude,
    analysisTimeMs: (getActiveAudioPlayer().currentTime || 0) * 1000,
    rms: normalizeFeature('rms', rms),
    peak: normalizeFeature('peak', peak),
    zeroCrossingRate: normalizeFeature('zeroCrossingRate', zeroCrossingRate),
    spectralCentroid: normalizeFeature('spectralCentroidHz', spectralCentroidHz),
    spectralSpread: normalizeFeature('spectralSpreadHz', spectralSpreadHz),
    spectralFlux: normalizeFeature('spectralFlux', spectralFluxRawNormalized),
    lowBandRatio: normalizeFeature('lowBandRatio', lowBandRatioRaw),
    midBandRatio: normalizeFeature('midBandRatio', midBandRatioRaw),
    highBandRatio: normalizeFeature('highBandRatio', highBandRatioRaw),
    highPresenceRatio: normalizeFeature('highPresenceRatio', highPresenceRatioRaw)
  };
}

function updateAudioEmotionState(features) {
  if (!features) {
    return;
  }

  const previousFeatures = audioAnalysis.featureHistory[audioAnalysis.featureHistory.length - 1] || null;
  const dynamicVariationRaw = previousFeatures ? Math.abs(features.rms - previousFeatures.rms) : 0;
  const spectralVariationRaw = previousFeatures ? Math.abs(features.spectralCentroid - previousFeatures.spectralCentroid) : 0;
  const transientSharpnessRaw = Math.max(0, features.peak - features.rms);
  const dynamicVariation = normalizeFeature('dynamicVariation', dynamicVariationRaw);
  const spectralVariation = normalizeFeature('spectralVariation', spectralVariationRaw);
  const transientSharpness = normalizeFeature('transientSharpness', transientSharpnessRaw);
  const transientDensity = clamp((0.65 * transientSharpness) + (0.35 * features.peak), 0, 1);
  const onsetStrength = transientDensity;
  const isActiveFrame = features.rmsRaw > AUDIO_ANALYSIS_SILENCE_RMS_THRESHOLD
    || features.peakRaw > AUDIO_ANALYSIS_SILENCE_PEAK_THRESHOLD
    || features.averageSpectrumMagnitude > AUDIO_ANALYSIS_SILENCE_SPECTRUM_THRESHOLD;

  pushLimited(audioAnalysis.activeFrameHistory, isActiveFrame ? 1 : 0, 120);

  const lastOnsetTime = audioAnalysis.onsetTimes[audioAnalysis.onsetTimes.length - 1] || 0;
  if (
    onsetStrength >= AUDIO_ANALYSIS_ONSET_THRESHOLD
    && (!lastOnsetTime || (features.analysisTimeMs - lastOnsetTime) >= AUDIO_ANALYSIS_ONSET_MIN_GAP_MS)
  ) {
    if (lastOnsetTime) {
      pushLimited(audioAnalysis.ioiHistory, (features.analysisTimeMs - lastOnsetTime) / 1000, 48);
    }
    pushLimited(audioAnalysis.onsetTimes, features.analysisTimeMs, 48);
  }

  pushLimited(audioAnalysis.featureHistory, features, 180);
  pushLimited(audioAnalysis.dynamicHistory, dynamicVariation, 90);
  pushLimited(audioAnalysis.onsetHistory, transientDensity, 90);
  pushLimited(audioAnalysis.rhythmFluxHistory, features.spectralFlux, 90);

  const averagedDynamicVariation = averageValues(audioAnalysis.dynamicHistory);
  const averagedSpectralFlux = averageValues(audioAnalysis.rhythmFluxHistory);
  const averageOnsetDensity = averageValues(audioAnalysis.onsetHistory);

  const fluxVarianceRaw = averageValues(
    audioAnalysis.rhythmFluxHistory.map((value) => Math.abs(value - averagedSpectralFlux))
  );
  const fluxVariance = normalizeFeature('fluxVariance', fluxVarianceRaw);
  const recentWindowSeconds = 6;
  const recentOnsets = audioAnalysis.onsetTimes.filter((timeMs) => (features.analysisTimeMs - timeMs) <= (recentWindowSeconds * 1000));
  const rhythmicDensityRaw = recentOnsets.length / recentWindowSeconds;
  const rhythmicDensity = normalizeFeature('rhythmicDensity', rhythmicDensityRaw);
  const temporalCompressionRaw = averageValues(audioAnalysis.activeFrameHistory);
  const averageIoi = averageValues(audioAnalysis.ioiHistory);
  const ioiVarianceRaw = averageValues(
    audioAnalysis.ioiHistory.map((ioi) => Math.abs(ioi - averageIoi))
  );
  const ioiVariance = normalizeFeature('ioiVariance', ioiVarianceRaw);
  const patternDriftRaw = averageAbsoluteDelta(audioAnalysis.ioiHistory);
  const patternDrift = normalizeFeature('patternDrift', patternDriftRaw);
  const lowDynamicVariation = clamp(1 - averagedDynamicVariation, 0, 1);
  const lowHighFreqPresence = clamp(1 - features.highPresenceRatio, 0, 1);
  const spectralWarmth = clamp(
    (0.60 * features.lowBandRatio)
    + (0.40 * (1 - features.highPresenceRatio)),
    0,
    1
  );
  const spectralSharpness = clamp(
    (0.55 * features.highPresenceRatio)
    + (0.25 * features.highBandRatio)
    + (0.20 * features.spectralSpread),
    0,
    1
  );
  const rhythmIrregularity = clamp(
    (0.55 * ioiVariance)
    + (0.25 * averagedDynamicVariation)
    + (0.20 * averagedSpectralFlux),
    0,
    1
  );
  const tempoConfidence = clamp(
    1 - ((0.65 * ioiVariance) + (0.35 * patternDrift)),
    0,
    1
  );
  const patternRepetitionScore = clamp(
    1 - ((0.65 * patternDrift) + (0.35 * ioiVariance)),
    0,
    1
  );
  const harmonicBrightness = clamp(
    (0.50 * features.midBandRatio)
    + (0.30 * features.spectralCentroid)
    + (0.20 * (1 - features.lowBandRatio)),
    0,
    1
  );
  const dissonanceLevel = clamp(
    (0.55 * features.spectralSpread)
    + (0.25 * features.highPresenceRatio)
    + (0.20 * features.zeroCrossingRate),
    0,
    1
  );
  const majorModeConfidence = clamp(
    (0.45 * features.midBandRatio)
    + (0.25 * harmonicBrightness)
    + (0.20 * tempoConfidence)
    + (0.10 * (1 - dissonanceLevel)),
    0,
    1
  );

  const energyRaw = clamp(
    (0.50 * features.rms)
    + (0.25 * averageOnsetDensity)
    + (0.25 * features.lowBandRatio),
    0,
    1
  );

  const tensionRaw = clamp(
    (0.35 * averagedDynamicVariation)
    + (0.30 * ioiVariance)
    + (0.20 * rhythmIrregularity)
    + (0.15 * spectralVariation),
    0,
    1
  );

  const aggressivenessRaw = clamp(
    (0.40 * features.highPresenceRatio)
    + (0.30 * spectralSharpness)
    + (0.30 * transientDensity),
    0,
    1
  );

  const softnessRaw = clamp(
    (0.40 * spectralWarmth)
    + (0.30 * lowDynamicVariation)
    + (0.30 * lowHighFreqPresence),
    0,
    1
  );

  const temperamentValue = clamp(aggressivenessRaw - softnessRaw, -1, 1);

  const stabilityRaw = clamp(
    (0.35 * (1 - rhythmIrregularity))
    + (0.25 * (1 - averagedDynamicVariation))
    + (0.20 * tempoConfidence)
    + (0.20 * patternRepetitionScore),
    0,
    1
  );
  const valenceRaw = clamp(
    (0.35 * harmonicBrightness)
    + (0.25 * features.spectralCentroid)
    + (0.20 * majorModeConfidence)
    + (0.20 * (1 - dissonanceLevel)),
    0,
    1
  );
  const valenceValue = clamp((valenceRaw * 2) - 1, -1, 1);

  audioAnalysis.states.instant = {
    energy: energyRaw,
    tension: tensionRaw,
    temperament: temperamentValue,
    stability: stabilityRaw,
    valence: valenceValue
  };

  audioAnalysis.states.shortTerm = smoothEmotionVector(
    audioAnalysis.states.instant,
    audioAnalysis.states.shortTerm,
    AUDIO_ANALYSIS_SHORT_ALPHA
  );

  const longNext = {};
  EMOTION_DIMENSIONS.forEach((dimension) => {
    const shortValue = audioAnalysis.states.shortTerm[dimension];
    const longValue = audioAnalysis.states.longTerm[dimension];
    const delta = Math.abs(shortValue - longValue);

    if (delta > AUDIO_ANALYSIS_DRIFT_THRESHOLD) {
      audioAnalysis.driftCounters[dimension] += 1;
    }
    else {
      audioAnalysis.driftCounters[dimension] = 0;
    }

    const isBipolarDimension = dimension === 'temperament' || dimension === 'valence';
    const baseAlpha = isBipolarDimension ? 0.02 : AUDIO_ANALYSIS_LONG_ALPHA;
    const fastAlpha = isBipolarDimension ? 0.055 : AUDIO_ANALYSIS_LONG_ALPHA_FAST;
    const alpha = audioAnalysis.driftCounters[dimension] >= AUDIO_ANALYSIS_DRIFT_UPDATES
      ? fastAlpha
      : baseAlpha;

    longNext[dimension] = longValue + ((shortValue - longValue) * alpha);
  });

  audioAnalysis.states.longTerm = longNext;
  recordTrackEmotionSample(audioAnalysis.states.instant, features.analysisTimeMs);
  audioAnalysis.trackAverageSamples += 1;
  EMOTION_DIMENSIONS.forEach((dimension) => {
    const currentAverage = audioAnalysis.states.trackAverage[dimension];
    const instantValue = audioAnalysis.states.instant[dimension];
    audioAnalysis.states.trackAverage[dimension] = currentAverage
      + ((instantValue - currentAverage) / audioAnalysis.trackAverageSamples);
  });
  audioAnalysis.elapsedMs = (getActiveAudioPlayer().currentTime || 0) * 1000;
  audioAnalysis.confidence = clamp(
    normalize(audioAnalysis.featureHistory.length, 1, 40) * 0.75
    + (tempoConfidence * 0.15)
    + ((1 - fluxVariance) * 0.10),
    0,
    1
  );
}

function ensureAudioAnalysisContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return false;
  }

  if (!audioAnalysis.context) {
    audioAnalysis.context = new AudioContextCtor();
  }

  if (!audioAnalysis.analyser) {
    audioAnalysis.analyser = audioAnalysis.context.createAnalyser();
    audioAnalysis.analyser.fftSize = 2048;
    audioAnalysis.analyser.smoothingTimeConstant = 0.78;
    audioAnalysis.timeData = new Uint8Array(audioAnalysis.analyser.fftSize);
    audioAnalysis.freqData = new Uint8Array(audioAnalysis.analyser.frequencyBinCount);
  }

  AUDIO_PLAYER_KEYS.forEach((key) => {
    if (audioAnalysis.sources[key]) {
      return;
    }

    const player = getAudioPlayerByKey(key);
    const source = audioAnalysis.context.createMediaElementSource(player);
    source.connect(audioAnalysis.analyser);
    source.connect(audioAnalysis.context.destination);
    audioAnalysis.sources[key] = source;
  });

  return true;
}

async function ensureAudioAnalysisRunning() {
  const ready = ensureAudioAnalysisContext();
  if (!ready) {
    return;
  }

  if (audioAnalysis.context.state === 'suspended') {
    try {
      await audioAnalysis.context.resume();
    }
    catch (error) {
      console.error(error);
    }
  }

  if (!audioAnalysisFrameId) {
    audioAnalysisLoop();
  }
}

function audioAnalysisLoop(now = performance.now()) {
  audioAnalysisFrameId = requestAnimationFrame(audioAnalysisLoop);
  const activePlayer = getActiveAudioPlayer();

  if (!audioAnalysis.analyser || activePlayer.paused || activePlayer.ended || !state.currentTrack) {
    renderEmotionWheel();
    return;
  }

  if (!audioAnalysisLastSampleAt || (now - audioAnalysisLastSampleAt) >= AUDIO_ANALYSIS_INTERVAL_MS) {
    const features = computeAudioFeatures();
    updateAudioEmotionState(features);
    audioAnalysisLastSampleAt = now;
  }

  if (!audioAnalysisLastUiUpdateAt || (now - audioAnalysisLastUiUpdateAt) >= AUDIO_ANALYSIS_UI_INTERVAL_MS) {
    renderEmotionState();
    audioAnalysisLastUiUpdateAt = now;
  }
}

function syncVisualizationTrack(track) {
  const nextTrackPath = track?.path || '';
  if (audioAnalysis.activeTrackPath !== nextTrackPath) {
    audioAnalysis.activeTrackPath = nextTrackPath;
    resetAudioAnalysisState();
  }

  renderVisualizationTrackInfo(track);
  renderEmotionState();
}

function startCronPolling() {
  setInterval(() => {
    fetch('/?do=moomuse_cron_run').catch((error) => {
      console.error('Cron run failed.', error);
    });
  }, CRON_INTERVAL_MS);
}

async function requestWakeLock() {
  if (!wakeLockEnabled || wakeLock || !hasAnyPlayingAudio() || document.hidden) {
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
  el.statusText.hidden = true;
}

function syncPlaylistModeButtons() {
  el.playlistRandomBtn.setAttribute('aria-pressed', 'false');
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

function syncPlayerActions() {
  const hasCurrentTrack = Boolean(state.currentTrack && state.currentTrack.path);
  const currentPath = hasCurrentTrack ? state.currentTrack.path : '';
  const isLiked = hasCurrentTrack && likedTrackPaths.has(currentPath);

  el.playerLikeBtn.disabled = !hasCurrentTrack;
  el.playerAddPlaylistBtn.disabled = !hasCurrentTrack;
  el.playerLikeBtn.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
}

function renderLibraryWelcomeState() {
  state.libraryTracks = [];
  state.libraryTotalCount = 0;
  el.libraryList.innerHTML = '';
  el.librarySubtitle.textContent = 'Recherche un titre, un artiste ou un album';
  el.libraryEmptyState.hidden = false;
  el.libraryEmptyState.textContent = 'Lance une recherche dans la bibliotheque ou, s il n y a pas encore d index, passe en mode explorer et selectionne les dossiers a analyser.';
  renderLibraryPagination();
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
  el.libraryPagination.innerHTML = '';
  el.libraryList.innerHTML = '';
  el.librarySubtitle.textContent = 'Chargement...';
  
  // Load library tracks from database
  loadLibraryTracks();
}

function getLibraryQueryParts(query) {
  const normalizedQuery = normalizeLibrarySearchQuery(query);
  if (!normalizedQuery.length) {
    return [];
  }

  return normalizedQuery.split(/\s+/).slice(0, 8);
}

async function fetchLibraryTracksBatch({ start = 0, limit = state.libraryPageSize, domain = [] } = {}) {
  const params = new URLSearchParams({
    get: 'moomuse_Track_collect',
    limit,
    start,
    order: 'title',
    fields: '{id,name,path,full_path,extension,size,artist,title,album,drive_id}'
  });

  if (domain.length) {
    params.append('domain', JSON.stringify(domain));
  }

  const response = await fetch(`/?${params.toString()}`);
  const result = await response.json();
  const collection = Array.isArray(result) ? result.map((track) => normalizeTrack(track)) : [];
  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader ? Number.parseInt(totalCountHeader, 10) : collection.length;

  return {
    collection,
    totalCount: Number.isFinite(totalCount) ? totalCount : collection.length
  };
}

function updateLibraryResults(collection, subtitle) {
  state.libraryTracks = collection;
  state.libraryTotalCount = collection.length;
  renderLibraryList();
  el.librarySubtitle.textContent = subtitle;
  el.libraryEmptyState.hidden = collection.length > 0;
}

async function fetchLibrarySearchResults(query, limit = LIBRARY_SEARCH_LIMIT) {
  const params = new URLSearchParams({
    get: 'moomuse_Track_search',
    q: query,
    limit
  });

  const response = await fetch(`/?${params.toString()}`);
  const result = await response.json();
  return Array.isArray(result) ? result.map((track) => normalizeTrack(track)) : [];
}

async function refreshLibraryResults(start = state.libraryStart) {
  const requestId = ++state.libraryRequestId;
  state.libraryStart = Math.max(0, Number(start) || 0);
  state.libraryPage = 1;

  el.libraryEmptyState.hidden = true;
  el.librarySubtitle.textContent = 'Recherche...';

  try {
    const results = await fetchLibrarySearchResults(state.libraryQuery, LIBRARY_SEARCH_LIMIT);

    if (requestId !== state.libraryRequestId) {
      return;
    }

    updateLibraryResults(
      results,
      results.length
        ? `${results.length} resultat(s)`
        : 'Aucun resultat'
    );
  }
  catch (error) {
    if (requestId !== state.libraryRequestId) {
      return;
    }

    console.error('Erreur lors de la recherche dans la bibliotheque:', error);
    state.libraryTracks = [];
    state.libraryTotalCount = 0;
    el.libraryList.innerHTML = '';
    el.libraryEmptyState.hidden = false;
    el.librarySubtitle.textContent = 'Erreur lors de la recherche';
    renderLibraryPagination();
  }
}

async function loadLibraryTracks(start = state.libraryStart) {
  const requestId = ++state.libraryRequestId;

  if (getLibraryQueryParts(state.libraryQuery).length) {
    await refreshLibraryResults(start);
    return;
  }

  try {
    el.libraryEmptyState.hidden = true;
    el.libraryPagination.innerHTML = '';
    el.libraryList.innerHTML = '';
    el.librarySubtitle.textContent = 'Chargement...';
    
    state.libraryStart = Math.max(0, Number(start) || 0);
    state.libraryPage = Math.floor(state.libraryStart / state.libraryPageSize) + 1;
    
    const result = await fetchLibraryTracksBatch({
      start: state.libraryStart,
      limit: state.libraryPageSize
    });

    if (requestId !== state.libraryRequestId) {
      return;
    }

    state.libraryTracks = result.collection;
    state.libraryTotalCount = result.totalCount;
    
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
        const playlistIndex = addToPlaylist(file.path, {
          statusMessage: `Ajoute a la playlist : ${file.title || file.name}`,
          snackbarMessage: 'Track ajoutee a la playlist'
        });
        if (playlistIndex >= 0) {
          setStatus(`Ajoute a la playlist : ${file.title || file.name}`);
        }
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
  const totalPages = Math.max(1, Math.ceil(state.libraryTotalCount / state.libraryPageSize));
  const currentPage = Math.floor(state.libraryStart / state.libraryPageSize) + 1;
  const hasPrevious = state.libraryStart > 0;
  const nextStart = state.libraryStart + state.libraryPageSize;
  const hasNext = nextStart < state.libraryTotalCount;

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

function getCurrentPlaylistDisplayName() {
  return normalizePlaylistName(state.currentPlaylistMeta.name);
}

function renderCurrentPlaylistHeader() {
  el.currentPlaylistName.textContent = getCurrentPlaylistDisplayName();
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
  if (state.activeSavedPlaylistId !== 'current') {
    return state.savedPlaylists;
  }

  const currentPlaylist = getCurrentPlaylistRecord();
  const remainingPlaylists = state.savedPlaylists.filter((playlist) => playlist.name !== currentPlaylist.name);
  return [currentPlaylist, ...remainingPlaylists];
}

function getCurrentPlaylistRecord() {
  return {
    id: 'current',
    name: normalizePlaylistName(state.currentPlaylistMeta.name),
    author: normalizePlaylistAuthor(state.currentPlaylistMeta.author),
    description: normalizePlaylistDescription(state.currentPlaylistMeta.description),
    tracks: serializeCurrentPlaylistTracks(),
    system: true
  };
}

function findSavedPlaylistByName(name) {
  const normalizedName = normalizePlaylistName(name);
  return state.savedPlaylists.find((playlist) => playlist.name === normalizedName) || null;
}

function confirmPlaylistOverwrite(name) {
  return window.confirm(`La playlist "${name}" existe deja. Voulez-vous l ecraser ?`);
}

function persistSavedPlaylists() {
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(state.savedPlaylists));
  }
  catch (error) {
    console.error(error);
  }
}

function persistCurrentPlaylist() {
  try {
    localStorage.setItem(CURRENT_PLAYLIST_STORAGE_KEY, JSON.stringify(getCurrentPlaylistRecord()));
  }
  catch (error) {
    console.error(error);
  }
}

function persistActivePlaylistId() {
  try {
    localStorage.setItem(ACTIVE_PLAYLIST_STORAGE_KEY, state.activeSavedPlaylistId || 'current');
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
      .filter((item) => item && item.id !== 'current' && ((typeof item.name === 'string' && Array.isArray(item.tracks)) || Array.isArray(item)))
      .map((item) => normalizePlaylistRecord(item));
  }
  catch (error) {
    console.error(error);
    state.savedPlaylists = [];
  }
}

function loadCurrentPlaylist() {
  try {
    const raw = localStorage.getItem(CURRENT_PLAYLIST_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    const playlist = normalizePlaylistRecord(parsed, { id: 'current', name: 'Playlist sans nom' });
    if (!Array.isArray(playlist.tracks)) {
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
    state.activeSavedPlaylistId = 'current';
  }
  catch (error) {
    console.error(error);
  }
}

function loadActivePlaylistId() {
  try {
    const raw = localStorage.getItem(ACTIVE_PLAYLIST_STORAGE_KEY);
    if (!raw) {
      return;
    }

    state.activeSavedPlaylistId = raw;
  }
  catch (error) {
    console.error(error);
  }
}

function openSavedPlaylistById(playlistId, options = {}) {
  const { silent = false } = options;
  const playlist = state.savedPlaylists.find((item) => item.id === playlistId);
  if (!playlist) {
    return false;
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
  persistActivePlaylistId();
  syncCurrentTrackWithPlaylist();
  renderPlaylist();
  renderSavedPlaylists();

  if (!silent) {
    setStatus(`Playlist chargee : ${playlist.name}`);
  }

  return true;
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

  const itemsToRender = state.filteredSavedPlaylists;

  if (!itemsToRender.length) {
    el.playlistsPanel.className = 'playlists-list muted';
    el.playlistsPanel.innerHTML = 'Aucune playlist correspondante.';
    syncPlaylistsVisibility();
    return;
  }

  el.playlistsPanel.className = 'playlists-list';
  el.playlistsPanel.innerHTML = itemsToRender.map((playlist) => {
    const activeClass = state.activeSavedPlaylistId === playlist.id ? ' is-active' : '';
    const countLabel = `${playlist.tracks.length} track(s)`;

    return `
      <button class="playlists-item${activeClass}" type="button" data-playlist-id="${escapeHtml(playlist.id)}">
        <span class="playlists-item-main">
          <span class="playlists-item-title">${escapeHtml(playlist.name)}</span>
        </span>
        <span class="playlists-item-meta">${escapeHtml(countLabel)}</span>
      </button>`;
  }).join('');

  [...el.playlistsPanel.querySelectorAll('.playlists-item')].forEach((button) => {
    button.addEventListener('click', () => {
      const playlistId = button.dataset.playlistId;
      if (playlistId === 'current') {
        state.activeSavedPlaylistId = 'current';
        persistActivePlaylistId();
        renderPlaylist();
        renderSavedPlaylists();
        return;
      }

      openSavedPlaylistById(playlistId);
    });
  });

  syncPlaylistsVisibility();
}

function getActivePlaylistRecord() {
  if (state.activeSavedPlaylistId === 'current') {
    return getCurrentPlaylistRecord();
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

  const conflictingPlaylist = findSavedPlaylistByName(payload.name);
  if (
    conflictingPlaylist
    && conflictingPlaylist.id !== state.activeSavedPlaylistId
    && !confirmPlaylistOverwrite(payload.name)
  ) {
    return;
  }

  state.currentPlaylistMeta = {
    ...state.currentPlaylistMeta,
    ...payload
  };
  persistCurrentPlaylist();
  persistActivePlaylistId();

  if (state.activeSavedPlaylistId !== 'current') {
    const sourceIndex = state.savedPlaylists.findIndex((item) => item.id === state.activeSavedPlaylistId);
    if (sourceIndex >= 0) {
      const targetIndex = conflictingPlaylist && conflictingPlaylist.id !== state.activeSavedPlaylistId
        ? state.savedPlaylists.findIndex((item) => item.id === conflictingPlaylist.id)
        : -1;
      const nextPlaylist = {
        ...state.savedPlaylists[sourceIndex],
        ...payload,
        id: conflictingPlaylist?.id || state.savedPlaylists[sourceIndex].id
      };

      if (targetIndex >= 0) {
        state.savedPlaylists.splice(sourceIndex, 1);
        const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        state.savedPlaylists.splice(adjustedTargetIndex, 1, nextPlaylist);
      }
      else {
        state.savedPlaylists.splice(sourceIndex, 1, nextPlaylist);
      }

      state.activeSavedPlaylistId = nextPlaylist.id;
      persistSavedPlaylists();
      persistActivePlaylistId();
    }
  }

  renderCurrentPlaylistHeader();
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
  const excludedId = typeof options.excludedId === 'string' ? options.excludedId : null;
  const existingIndex = state.savedPlaylists.findIndex((playlist) => playlist.name === normalizedName);
  const existing = existingIndex >= 0 ? state.savedPlaylists[existingIndex] : null;
  if (existing && existing.id !== excludedId && options.confirmOverwrite !== false && !confirmPlaylistOverwrite(normalizedName)) {
    return null;
  }
  const payload = normalizePlaylistRecord({
    id: existing?.id && existing.id !== 'current'
      ? existing.id
      : (excludedId && excludedId !== 'current' ? excludedId : null),
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
  return payload;
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

function notifyUser(message, options = {}) {
  const {
    isError = false,
    snackbarMessage = message,
    showSnack = !isError
  } = options;

  setStatus(message, isError);
  if (showSnack) {
    showSnackbar(snackbarMessage);
  }
}

function switchMode(mode) {
  if (mode !== 'browse' && mode !== 'library' && mode !== 'visualize') {
    return;
  }

  state.mode = mode;

  const isBrowseMode = mode === 'browse';
  const isLibraryMode = mode === 'library';
  const isVisualizeMode = mode === 'visualize';
  el.browseModeBtn.setAttribute('aria-pressed', isBrowseMode ? 'true' : 'false');
  el.libraryModeBtn.setAttribute('aria-pressed', isLibraryMode ? 'true' : 'false');
  el.visualizeModeBtn.setAttribute('aria-pressed', isVisualizeMode ? 'true' : 'false');

  el.modeDescription.textContent = isBrowseMode
    ? 'Explore les supports pour lancer les medias immediatement'
    : (isVisualizeMode
      ? 'Consulte une page dediee aux futures vues de visualisation'
      : 'Recherche dans la bibliotheque ou passe en mode explorer pour analyser des dossiers');

  el.browseSidebar.hidden = !isBrowseMode;
  el.librarySidebar.hidden = !isLibraryMode;
  el.visualizeSidebar.hidden = !isVisualizeMode;
  el.browseToolbar.hidden = !isBrowseMode;
  el.libraryToolbar.hidden = !isLibraryMode;
  el.visualizeToolbar.hidden = !isVisualizeMode;
  el.browseContent.hidden = !isBrowseMode;
  el.libraryContent.hidden = !isLibraryMode;
  el.visualizeContent.hidden = !isVisualizeMode;

  if (isBrowseMode) {
    if (!state.drives.length) {
      initializeBrowseMode();
    }
    return;
  }

  if (isLibraryMode) {
    initializeLibraryMode();
  }
}

function initializeLibraryMode() {
  renderLibraryWelcomeState();
}

async function loadLibraryTracks(start = state.libraryStart) {
  const requestId = ++state.libraryRequestId;

  if (getLibraryQueryParts(state.libraryQuery).length) {
    await refreshLibraryResults(start);
    return;
  }

  if (requestId !== state.libraryRequestId) {
    return;
  }

  renderLibraryWelcomeState();
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

function finalizeCrossfadeTransition() {
  stopCrossfadeAnimation();
  state.crossfadeInProgress = false;
  state.crossfadePlayerStarted = false;
  const fadingPlayerKey = state.fadingPlayerKey;
  const fadingPlayer = getFadingAudioPlayer();

  const activePlayer = getActiveAudioPlayer();
  activePlayer.volume = 1;
  if (activePlayer.paused && !activePlayer.ended) {
    activePlayer.play().catch((error) => {
      console.error(error);
    });
  }

  if (fadingPlayer) {
    clearAudioPlayer(fadingPlayer);
  }

  state.fadingPlayerKey = null;
  state.bufferPlayerKey = fadingPlayerKey || state.bufferPlayerKey;
  state.bufferTrack = null;
  state.bufferPlaylistIndex = -1;
  getBufferAudioPlayer().volume = 1;

  prepareUpcomingTracks();
  renderPlaylist();
  renderSavedPlaylists();
  ensureAudioAnalysisRunning();
}

function startCrossfadeToPreparedTrack() {
  if (state.crossfadeInProgress || !state.queuedTrack) {
    return;
  }

  const outgoingKey = state.activePlayerKey;
  const incomingKey = state.queuedPlayerKey;
  const nextQueuedKey = state.bufferPlayerKey;
  const nextBufferKey = outgoingKey;
  const outgoingPlayer = getAudioPlayerByKey(outgoingKey);
  const incomingPlayer = getAudioPlayerByKey(incomingKey);
  const remainingMs = Math.max(0, ((outgoingPlayer.duration || 0) - (outgoingPlayer.currentTime || 0)) * 1000);
  const fadeDurationMs = clamp(remainingMs || CROSSFADE_DURATION_MS, CROSSFADE_MIN_DURATION_MS, CROSSFADE_DURATION_MS);

  state.crossfadeInProgress = true;
  state.crossfadePlayerStarted = false;
  state.fadingPlayerKey = outgoingKey;
  incomingPlayer.volume = 0;

  incomingPlayer.play().then(() => {
    state.crossfadePlayerStarted = true;
    state.activePlayerKey = incomingKey;
    state.currentTrack = state.queuedTrack;
    state.currentPlaylistIndex = state.queuedPlaylistIndex;
    state.queuedPlayerKey = nextQueuedKey;
    state.bufferPlayerKey = nextBufferKey;
    state.queuedTrack = state.bufferTrack;
    state.queuedPlaylistIndex = state.bufferPlaylistIndex;
    state.bufferTrack = null;
    state.bufferPlaylistIndex = -1;
    syncAudioPlayerVisibility();
    renderPlayerUiOnly();
    renderPlaylist();
    renderSavedPlaylists();

    const startedAt = performance.now();
    const step = (now) => {
      const progress = clamp((now - startedAt) / fadeDurationMs, 0, 1);
      outgoingPlayer.volume = 1 - progress;
      incomingPlayer.volume = progress;

      if (progress < 1 && state.crossfadeInProgress) {
        crossfadeAnimationFrameId = requestAnimationFrame(step);
        return;
      }

      stopCrossfadeAnimation();
      outgoingPlayer.volume = 0;
      incomingPlayer.volume = 1;
    };

    crossfadeAnimationFrameId = requestAnimationFrame(step);
  }).catch((error) => {
    console.error(error);
    state.crossfadeInProgress = false;
    state.crossfadePlayerStarted = false;
    state.fadingPlayerKey = null;
    outgoingPlayer.volume = 1;
    incomingPlayer.volume = 0;
    setStatus('Fondu bloque par le navigateur. La piste suivante demarrera normalement.', true);
  });
}

function maybeStartCrossfade(player) {
  if (state.crossfadeInProgress || player !== getActiveAudioPlayer() || !state.queuedTrack) {
    return;
  }

  const duration = Number(player.duration);
  if (!Number.isFinite(duration) || duration <= 0) {
    return;
  }

  const leadTime = Math.min(CROSSFADE_TRIGGER_SECONDS, Math.max(3, duration / 3));
  const remainingSeconds = duration - player.currentTime;
  if (remainingSeconds <= leadTime) {
    startCrossfadeToPreparedTrack();
  }
}

function addToPlaylist(path, options = {}) {
  const {
    silent = false,
    notify = true,
    statusMessage = null,
    snackbarMessage = 'Track ajoutee a la playlist'
  } = options;
  const file = getFileFromRegistry(path);
  if (!file) {
    return -1;
  }

  state.playlist.push(path);
  state.activeSavedPlaylistId = 'current';
  persistCurrentPlaylist();
  persistActivePlaylistId();
  if (!silent) {
    renderPlaylist();
    renderSavedPlaylists();
  }
  if (notify) {
    notifyUser(statusMessage || `Ajoute a la playlist : ${file.name}`, {
      snackbarMessage
    });
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

  persistCurrentPlaylist();
  persistActivePlaylistId();
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
  persistCurrentPlaylist();
  persistActivePlaylistId();
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Playlist melangee : ${state.playlist.length} fichier(s)`);
}

function renderPlaylist() {
  renderCurrentPlaylistHeader();

  if (!state.playlist.length) {
    el.playlistPanel.className = 'playlist-list muted';
    el.playlistPanel.innerHTML = 'Aucun fichier dans la playlist.';
    prepareUpcomingTracks();
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

  prepareUpcomingTracks();
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

  notifyUser(`Playlist exportee : ${state.playlist.length} fichier(s)`, {
    snackbarMessage: 'Playlist exportee'
  });
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
    name: getCurrentPlaylistDisplayName(),
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
    cancelCrossfade();
    return;
  }

  const index = state.playlist.indexOf(state.currentTrack.path);
  if (index === -1) {
    state.currentTrack = null;
    state.currentPlaylistIndex = -1;
    cancelCrossfade();
    clearAudioPlayer(el.audioPlayer);
    clearAudioPlayer(el.secondaryAudioPlayer);
    clearAudioPlayer(el.tertiaryAudioPlayer);
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
  persistCurrentPlaylist();
  persistActivePlaylistId();
  syncCurrentTrackWithPlaylist();
  renderPlaylist();
  renderSavedPlaylists();
  closePlaylistMenu();
  notifyUser(`Playlist importee : ${state.playlist.length} fichier(s)`, {
    snackbarMessage: 'Playlist importee'
  });
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

  cancelCrossfade();
  state.currentPlaylistIndex = index;
  state.currentTrack = file;
  renderPlayer(autoPlay);
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Lecture : ${file.name}`);
}

function skipToNextPlaylistTrack() {
  if (!state.playlist.length || state.crossfadeInProgress) {
    return;
  }

  const nextIndex = getNextPlaylistIndex();
  if (nextIndex >= 0) {
    playPlaylistIndex(nextIndex, true);
  }
}

function playFile(path) {
  const file = getFileFromRegistry(path);
  if (!file) {
    return;
  }

  cancelCrossfade();
  state.currentTrack = file;
  state.currentPlaylistIndex = state.playlist.indexOf(path);
  renderPlayer(true);
  renderPlaylist();
  renderSavedPlaylists();
  setStatus(`Lecture : ${file.name}`);
}

function renderPlayerUiOnly() {
  const track = state.currentTrack;
  if (!track) {
    updateNowPlayingTitle('Aucun media selectionne');
    el.detailsPanel.innerHTML = 'Les informations du fichier selectionne apparaitront ici.';
    syncVisualizationTrack(null);
    syncPlayerActions();
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
  syncVisualizationTrack(track);
  syncPlayerActions();
}

function renderPlayer(autoPlay = false) {
  const track = state.currentTrack;
  const activePlayer = getActiveAudioPlayer();

  if (!track) {
    cancelCrossfade();
    clearAudioPlayer(el.audioPlayer);
    clearAudioPlayer(el.secondaryAudioPlayer);
    clearAudioPlayer(el.tertiaryAudioPlayer);
    renderPlayerUiOnly();
    syncAudioPlayerVisibility();
    return;
  }

  renderPlayerUiOnly();

  const mediaUrl = buildMediaUrl(track);
  if (!mediaUrl) {
    prepareUpcomingTracks();
    return;
  }

  const playbackPath = getTrackPlaybackPath(track);

  if (activePlayer.dataset.path !== playbackPath) {
    activePlayer.src = mediaUrl;
    activePlayer.dataset.path = playbackPath;
  }

  syncAudioPlayerVisibility();
  prepareUpcomingTracks();

  if (autoPlay) {
    if (activePlayer.ended) {
      activePlayer.currentTime = 0;
    }

    activePlayer.play().catch(() => {
      setStatus('Lecture bloquee par le navigateur. Clique sur Play.', true);
    });
  }

  syncPlayerActions();
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
    cancelCrossfade();
    state.currentTrack = null;
    state.currentPlaylistIndex = -1;
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
el.visualizeModeBtn.addEventListener('click', () => {
  switchMode('visualize');
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
el.playerLikeBtn.addEventListener('click', () => {
  if (!state.currentTrack?.path) {
    return;
  }

  if (likedTrackPaths.has(state.currentTrack.path)) {
    likedTrackPaths.delete(state.currentTrack.path);
    syncPlayerActions();
    notifyUser(`Like retire : ${state.currentTrack.title || state.currentTrack.name}`, {
      snackbarMessage: 'Like retire'
    });
    return;
  }

  likedTrackPaths.add(state.currentTrack.path);
  syncPlayerActions();
  notifyUser(`Like ajoute : ${state.currentTrack.title || state.currentTrack.name}`, {
    snackbarMessage: 'Track aimee'
  });
});
el.playerAddPlaylistBtn.addEventListener('click', () => {
  if (!state.currentTrack?.path) {
    return;
  }

  addToPlaylist(state.currentTrack.path, {
    statusMessage: `Ajoute a la playlist : ${state.currentTrack.title || state.currentTrack.name}`,
    snackbarMessage: 'Track ajoutee a la playlist'
  });
});

// Playlist mode buttons
el.playlistPlayBtn.addEventListener('click', () => {
  if (!state.playlist.length) {
    setStatus('Aucune piste dans la playlist.', true);
    return;
  }

  playPlaylistIndex(0, true);
});
el.playlistSkipBtn.addEventListener('click', () => {
  skipToNextPlaylistTrack();
});
el.playlistRandomBtn.addEventListener('click', () => {
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
function handlePlayerEnded(playerKey) {
  if (state.crossfadeInProgress && playerKey === state.fadingPlayerKey) {
    finalizeCrossfadeTransition();
    return;
  }

  if (playerKey !== state.activePlayerKey) {
    return;
  }

  skipToNextPlaylistTrack();
}

function handlePlayerPlay() {
  if (state.crossfadeInProgress) {
    state.crossfadePlayerStarted = true;
    requestWakeLock();
    return;
  }

  ensureAudioAnalysisRunning();
  requestWakeLock();
}

function handlePlayerPause() {
  if (!hasAnyPlayingAudio()) {
    releaseWakeLock();
  }

  renderEmotionState();
}

function handlePlayerTimeUpdate(playerKey) {
  if (playerKey !== state.activePlayerKey) {
    return;
  }

  maybeStartCrossfade(getActiveAudioPlayer());
}

function handlePlayerSeeked(playerKey) {
  if (playerKey !== state.activePlayerKey) {
    return;
  }

  stopCrossfadeAnimation();
  rebuildUpcomingPlayers();
  maybeStartCrossfade(getActiveAudioPlayer());
}

el.audioPlayer.addEventListener('ended', () => {
  handlePlayerEnded('primary');
});
el.secondaryAudioPlayer.addEventListener('ended', () => {
  handlePlayerEnded('secondary');
});
el.tertiaryAudioPlayer.addEventListener('ended', () => {
  handlePlayerEnded('tertiary');
});
el.audioPlayer.addEventListener('play', handlePlayerPlay);
el.secondaryAudioPlayer.addEventListener('play', handlePlayerPlay);
el.tertiaryAudioPlayer.addEventListener('play', handlePlayerPlay);
el.audioPlayer.addEventListener('pause', handlePlayerPause);
el.secondaryAudioPlayer.addEventListener('pause', handlePlayerPause);
el.tertiaryAudioPlayer.addEventListener('pause', handlePlayerPause);
el.audioPlayer.addEventListener('timeupdate', () => {
  handlePlayerTimeUpdate('primary');
});
el.secondaryAudioPlayer.addEventListener('timeupdate', () => {
  handlePlayerTimeUpdate('secondary');
});
el.tertiaryAudioPlayer.addEventListener('timeupdate', () => {
  handlePlayerTimeUpdate('tertiary');
});
el.audioPlayer.addEventListener('seeked', () => {
  handlePlayerSeeked('primary');
});
el.secondaryAudioPlayer.addEventListener('seeked', () => {
  handlePlayerSeeked('secondary');
});
el.tertiaryAudioPlayer.addEventListener('seeked', () => {
  handlePlayerSeeked('tertiary');
});
if (el.emotionWheel) {
  el.emotionWheel.addEventListener('click', handleEmotionWheelClick);
}
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
  renderEmotionWheelSelection();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    releaseWakeLock();
    return;
  }

  if (hasAnyPlayingAudio()) {
    requestWakeLock();
  }
});
themeMediaQuery.addEventListener('change', () => {
  if (state.themeMode === 'auto') {
    applyTheme();
  }
});

window.mooEmotionWheel = {
  directions: EMOTION_WHEEL_DIRECTIONS,
  emotionMap: EMOTION_WHEEL_MAP,
  normalizeAngleDegrees,
  clampNormalizedRadius,
  getWheelLevelFromRadius,
  getEmotionFromWheelPosition,
  getWheelPositionFromEmotion
};

applyTheme();
loadSavedPlaylists();
loadCurrentPlaylist();
loadActivePlaylistId();
if (state.activeSavedPlaylistId && state.activeSavedPlaylistId !== 'current') {
  if (!openSavedPlaylistById(state.activeSavedPlaylistId, { silent: true })) {
    state.activeSavedPlaylistId = 'current';
    persistActivePlaylistId();
  }
}
syncDetailsVisibility();
syncPlaylistsVisibility();
syncContentFilterButtons();
syncPlaylistModeButtons();
syncPlayerActions();
syncAudioPlayerVisibility();
initEmotionCardToggles();
syncVisualizationTrack(state.currentTrack);
renderSavedPlaylists();
renderPlaylist();
switchMode('library');
loadDrives();
window.addEventListener('load', startCronPolling, { once: true });









