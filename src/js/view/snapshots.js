import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

const listEl = document.querySelector('.snapshots__list');
const editEl = document.querySelector('.snapshots__edit');
let selectedListEl = null;
let learnClickLayer = null;

export function setup() {
  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
  editEl.addEventListener('change', handleEditClick);
}

/**
 * Crete the 16 list items.
 * @param {Object} state Application state.
 */
function build(state) {
  const { snapshots } = state;

  if (listEl.childNodes.length > 0) {
    return;
  }

  const template = document.querySelector('#template-snapshots-item');
  const templateLearnmode = document.querySelector('#template-snapshots-learnmode');
  for (let i = 0, n = snapshots.length; i < n; i++) {
    let clone = template.content.cloneNode(true);
    const  el = clone.firstElementChild;
    listEl.appendChild(el);

    el.querySelector('.snapshots__item-load .snapshots__item-label').innerHTML = `${i + 1}.`;
    el.querySelector('.snapshots__item-store .snapshots__item-label').innerHTML = '+';
    el.dataset.index = i;
    el.querySelector('.snapshots__item-load').addEventListener('touchend', handleLoadClick);
    el.querySelector('.snapshots__item-load').addEventListener('click', handleLoadClick);
    el.querySelector('.snapshots__item-store').addEventListener('touchend', handleStoreClick);
    el.querySelector('.snapshots__item-store').addEventListener('click', handleStoreClick);

    clone = templateLearnmode.content.cloneNode(true);
    const learnmodeEl = clone.firstElementChild;
    el.appendChild(learnmodeEl);

    learnmodeEl.addEventListener('click', handleLearnLayerClick);
  }
}

/**
 * State of the parameter in the assignment process changed,
 * the element will show this visually.
 * @param {String} state New state of the parameter.
 */
function changeRemoteState(state) {
  const { assignments, learnModeActive, learnTargetParameterKey, learnTargetProcessorId, } = state;
  if (learnModeActive) {
    document.querySelectorAll('.snapshots__learnmode').forEach(el => {
      const index = el.parentNode.dataset.index;
      const assignment = assignments.allIds.find(id => 
        assignments.byId[id].processorId === 'snapshots' && 
         assignments.byId[id].paramKey === index);
      el.classList.add('show');
      el.dataset.assigned = !!assignment;
      el.dataset.selected = learnTargetProcessorId === 'snapshots' && learnTargetParameterKey === index;
    });
  } else {
    document.querySelectorAll('.snapshots__learnmode').forEach(el => el.classList.remove('show'));
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

function handleLearnLayerClick(e) {
  dispatch(getActions().toggleMIDILearnTarget('snapshots', e.target.parentNode.dataset.index));
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
      build(state);
      setSnapshotEditMode(state);
      updateList(state);
      showSelectedIndex(state);
      changeRemoteState(state);
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
				
    case actions.TOGGLE_MIDI_LEARN_MODE:
    case actions.TOGGLE_MIDI_LEARN_TARGET:
    case actions.ASSIGN_EXTERNAL_CONTROL:
    case actions.UNASSIGN_EXTERNAL_CONTROL:
      changeRemoteState(state);
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
		
/**
 * State of the parameter in the assignment process changed,
 * the element will show this visually.
 * @param {String} status New state of the parameter.
 */
function showRemoteState(status) {
  switch (status) {
    case 'enter':
      document.querySelectorAll('.snapshots__learnmode').forEach(el => el.classList.add('show'));
      // learnClickLayer.addEventListener('click', onLearnLayerClick);
      break;
    case 'exit':
      document.querySelectorAll('.snapshots__learnmode').forEach(el => el.classList.remove('show'));
      break;
    default:
      console.log('Unknown remote state: ', state);
      break;
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
  const { snapshots } = state;
  for (let i = 0, n = snapshots.length; i < n; i++) {
    if (snapshots[i]) {
      listEl.children[i].classList.add('is-set');
    } else {
      listEl.children[i].classList.remove('is-set');
    }
  }
}
