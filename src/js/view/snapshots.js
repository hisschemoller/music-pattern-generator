import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

const listEl = document.querySelector('.snapshots__list');
const editEl = document.querySelector('.snapshots__edit');
const numSnapshots = 16;
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
  const template = document.querySelector('#template-snapshots-item');
  for (let i = 0, n = numSnapshots; i < n; i++) {
    const clone = template.content.cloneNode(true);
    const el = clone.firstElementChild;
    listEl.appendChild(el);

    el.querySelector('.snapshots__item-load .snapshots__item-label').innerHTML = `${i + 1}.`;
    el.querySelector('.snapshots__item-store .snapshots__item-label').innerHTML = '+';
    el.dataset.index = i;
    el.querySelector('.snapshots__item-load').addEventListener('touchend', handleLoadClick);
    el.querySelector('.snapshots__item-load').addEventListener('click', handleLoadClick);
    el.querySelector('.snapshots__item-store').addEventListener('touchend', handleStoreClick);
    el.querySelector('.snapshots__item-store').addEventListener('click', handleStoreClick);
  }
}

function handleLoadClick(e) {
  dispatch(getActions().loadSnapshot(parseInt(e.currentTarget.parentNode.dataset.index, 10)));
}

function handleStoreClick(e) {
  dispatch(getActions().storeSnapshot(parseInt(e.currentTarget.parentNode.dataset.index)));
}

function handleEditClick() {
  dispatch(getActions().toggleSnapshotsMode());
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {

    case actions.CREATE_PROJECT:
    case actions.STORE_SNAPSHOT:
      setSnapshotEditMode(state);
      updateList(state);
      showSelectedIndex(state);
      break;

    case actions.TOGGLE_SNAPSHOTS_MODE:
      setSnapshotEditMode(state);
      showSelectedIndex(state);
      break;

    case actions.LOAD_SNAPSHOT:
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
function setSnapshotEditMode(state) {
  editEl.checked = state.snapshotsEditModeActive;
  if (state.snapshotsEditModeActive) {
    listEl.classList.add('edit-mode');
  } else {
    listEl.classList.remove('edit-mode');
  }
}

function showSelectedIndex(state) {
  const { snapshotIndex, showSnapshotsPanel, } = state;
  if (showSnapshotsPanel) {
    if (selectedListEl){
      selectedListEl.classList.remove('is-selected');
      selectedListEl = null;
    }
    if (typeof snapshotIndex === 'number') {
      selectedListEl = listEl.children[snapshotIndex];
      selectedListEl.classList.add('is-selected');
    }
  }
}

/**
 * 
 * @param {Object} state App state.
 */
function updateList(state) {
  for (let i = 0, n = numSnapshots; i < n; i++) {
    if (state.snapshots[i]) {
      listEl.children[i].classList.add('is-set');
    } else {
      listEl.children[i].classList.remove('is-set');
    }
  }
}
