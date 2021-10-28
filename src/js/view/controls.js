import { dispatch, getActions, getState, STATE_CHANGE, } from '../state/store.js';

const resetKeyCombo = [];
const newEl = document.querySelector('#file-new');
const importEl= document.querySelector('#file-import');
const exportEl = document.querySelector('#file-export');
const playEl = document.getElementById('play-check');
const bpmEl = document.getElementById('bpm-number');
const remoteEl = document.getElementById('learn-check');
const snapshotsEl = document.getElementById('snapshots-check');
const libraryEl = document.getElementById('library-check');
const prefsEl = document.getElementById('prefs-check');
const editEl = document.getElementById('edit-check');
const connectionsEl = document.getElementById('connections-check');
const helpEl = document.getElementById('help-check');

export function setup() {
  addEventListeners();
}

function addEventListeners() {
  const actions = getActions();

  document.addEventListener(STATE_CHANGE, handleStateChanges);

  newEl.addEventListener('click', e => {
    dispatch(actions.newProject());
  });
  importEl.addEventListener('change', e => {
    dispatch(actions.importProject(e.target.files[0]));
    e.target.value = null;
  });
  exportEl.addEventListener('click', e => {
    dispatch(actions.exportProject());
  });
  playEl.addEventListener('change', e => {
    dispatch(actions.setTransport('toggle'));
  });
  bpmEl.addEventListener('change', e => {
    dispatch(actions.setTempo(bpmEl.value));
  });
  remoteEl.addEventListener('change', e => {
    dispatch(actions.toggleMIDILearnMode());
  });
  snapshotsEl.addEventListener('change', e => {
    dispatch(actions.togglePanel('snapshots'));
  });
  libraryEl.addEventListener('change', e => {
    dispatch(actions.togglePanel('library'));
  });
  prefsEl.addEventListener('change', e => {
    dispatch(actions.togglePanel('preferences'));
  });
  editEl.addEventListener('change', e => {
    dispatch(actions.togglePanel('settings'));
  });
  connectionsEl.addEventListener('change', e => {
    dispatch(actions.toggleConnectMode());
  });
  helpEl.addEventListener('change', e => {
    dispatch(actions.togglePanel('help'));
  });

  document.addEventListener('keyup', e => {

    // don't perform shortcuts while typing in a text input.
    if (!(e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text')) {
      switch (e.keyCode) {
        case 32: // space
          dispatch(actions.setTransport('toggle'));
          break;
        
        case 83: // s
          console.log('state', getState());
          break;
      }
    }
    resetKeyCombo.length = 0;
  });

  document.addEventListener('keydown', e => {

    // don't perform shortcuts while typing in a text input.
    if (!(e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text')) {
      switch (e.keyCode) {
        case 82: // r
        case 83: // s
        case 84: // t
          // clear all data on key combination 'rst' (reset)
          resetKeyCombo.push(e.keyCode);
          if (resetKeyCombo.indexOf(82) > -1 && resetKeyCombo.indexOf(83) > -1 && resetKeyCombo.indexOf(84) > -1) {
            localStorage.clear();
            dispatch(actions.newProject());
          }
          break;
      }
    }
  });
}

/**
 * Handle state changes.
 * @param {Object} e Custom store event.
 */
function handleStateChanges(e) {
  const { state, action, } = e.detail;
  const actions = getActions();
  
  switch (action.type) {
    case actions.CREATE_PROJECT:
    case actions.DELETE_PROCESSOR:
    case actions.SELECT_PROCESSOR:
    case actions.TOGGLE_MIDI_LEARN_MODE:
    case actions.TOGGLE_PANEL:
      updateInputs(state);
      bpmEl.value = state.bpm;
      break;

    case actions.SET_TEMPO:
      bpmEl.value = state.bpm;
      break;
  
    case actions.SET_TRANSPORT:
      playEl.checked = state.transport === 'play';
      break;
  }
}

/**
 * Update controls state.
 * @param  {Object} state App state.
 */ 
function updateInputs(state) {
  helpEl.checked = state.showHelpPanel;
  prefsEl.checked  = state.showPreferencesPanel;
  remoteEl.checked = state.learnModeActive;
  editEl.checked = state.showSettingsPanel;
  libraryEl.checked = state.showLibraryPanel;
  snapshotsEl.checked = state.showSnapshotsPanel;
  connectionsEl.checked = state.connectModeActive;
}
