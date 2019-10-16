import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

const listEl = document.querySelector('.presets__list');
const editEl = document.querySelector('.presets__edit');
const numPresets = 16;

export function setup() {
  addEventListeners();
  build();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
  editEl.addEventListener('change', handleEditClick);
}

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
  dispatch(getActions().loadPreset(e.currentTarget.parentNode.dataset.index));
}

function handleStoreClick(e) {
  dispatch(getActions().storePreset(e.currentTarget.parentNode.dataset.index));
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
      break;

    case actions.TOGGLE_PRESETS_MODE:
      setPresetEditMode(state);
      break;
  }
}

function setPresetEditMode(state) {
  editEl.checked = state.presetsEditModeActive;
  listEl.dataset.mode = state.presetsEditModeActive ? 'edit' : '';
}

function updateList(state) {
  for (let i = 0, n = numPresets; i < n; i++) {
    listEl.children[i].dataset.state = state.presets[i] ? 'set' : '';
  }
}