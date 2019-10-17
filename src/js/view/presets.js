import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

const listEl = document.querySelector('.presets__list');
const editEl = document.querySelector('.presets__edit');
const numPresets = 16;
let selectedListEl = null;

export function setup() {
  addEventListeners();
  build();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
  editEl.addEventListener('change', handleEditClick);
}

/**
 * Crete the 16 list items.
 */
function build() {
  const template = document.querySelector('#template-presets-item');
  for (let i = 0, n = numPresets; i < n; i++) {
    const clone = template.content.cloneNode(true);
    const el = clone.firstElementChild;
    listEl.appendChild(el);

    el.querySelector('.presets__item-load .presets__item-label').innerHTML = `${i + 1}.`;
    el.querySelector('.presets__item-store .presets__item-label').innerHTML = '+';
    el.dataset.index = i;
    el.querySelector('.presets__item-load').addEventListener('touchend', handleLoadClick);
    el.querySelector('.presets__item-load').addEventListener('click', handleLoadClick);
    el.querySelector('.presets__item-store').addEventListener('touchend', handleStoreClick);
    el.querySelector('.presets__item-store').addEventListener('click', handleStoreClick);
  }
}

function handleLoadClick(e) {
  dispatch(getActions().loadPreset(parseInt(e.currentTarget.parentNode.dataset.index, 10)));
}

function handleStoreClick(e) {
  dispatch(getActions().storePreset(parseInt(e.currentTarget.parentNode.dataset.index)));
}

function handleEditClick() {
  dispatch(getActions().togglePresetsMode());
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {

    case actions.CREATE_PROJECT:
    case actions.STORE_PRESET:
      setPresetEditMode(state);
      updateList(state);
      showSelectedIndex(state);
      break;

    case actions.TOGGLE_PRESETS_MODE:
      setPresetEditMode(state);
      showSelectedIndex(state);
      break;

    case actions.LOAD_PRESET:
    case actions.CHANGE_PARAMETER:
    case actions.TOGGLE_PANEL:
      showSelectedIndex(state);
      break;
  }
}

/**
 * Toggle snapshot edit mode.
 * @param {Object} state App state.
 */
function setPresetEditMode(state) {
  editEl.checked = state.presetsEditModeActive;
  if (state.presetsEditModeActive) {
    listEl.classList.add('edit-mode');
  } else {
    listEl.classList.remove('edit-mode');
  }
}

function showSelectedIndex(state) {
  const { presetIndex, showPresetsPanel, } = state;
  console.log(typeof presetIndex === 'number', presetIndex, showPresetsPanel);
  if (showPresetsPanel) {
    if (selectedListEl){
      selectedListEl.classList.remove('is-selected');
      selectedListEl = null;
    }
    if (typeof presetIndex === 'number') {
      selectedListEl = listEl.children[presetIndex];
      selectedListEl.classList.add('is-selected');
    }
  }
}

/**
 * 
 * @param {Object} state App state.
 */
function updateList(state) {
  for (let i = 0, n = numPresets; i < n; i++) {
    if (state.presets[i]) {
      listEl.children[i].classList.add('is-set');
    } else {
      listEl.children[i].classList.remove('is-set');
    }
  }
}
