import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import createMIDIInputView from './midi_input.js';
import createMIDIOutputView from './midi_output.js';

const midiInputsEl = document.querySelector('.prefs__inputs');
const midiOutputsEl = document.querySelector('.prefs__outputs');
const themeCheckEl = document.querySelector('.prefs__dark-theme');
const midiPortViews = [];

export function setup() {
  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
  themeCheckEl.addEventListener('change',() => {
    dispatch(getActions().toggleTheme());
	});
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.CREATE_PROJECT:
    case actions.TOGGLE_THEME:
        updateControl('dark-theme', state.theme === 'dark');
        break;
    
    case actions.CREATE_MIDI_PORT:
    case actions.UPDATE_MIDI_PORT:
    case actions.MIDI_PORT_CHANGE:
        updateMIDIPortViews(state);
        break;
  }
}

/**
 * Callback function to update one of the controls after if the
 * preference's state changed.
 * @param {String} key Key that indicates the control.
 * @param {Boolean} value Value of the control.
 */
function updateControl(key, value) {
	switch (key) {
		case 'dark-theme':
			themeCheckEl.checked = value;
			break;
	}
}

/**
 * Update lists of ports after a change.
 * @param {Object} state App state.
 */
function updateMIDIPortViews(state) {
	const { ports } = state;
	ports.allIds.forEach(portId => {
		const { id, name, networkEnabled, remoteEnabled, state: portState, syncEnabled, type, } = ports.byId[portId];
		let view = midiPortViews.find(view => view.getID() === id);

		// remove ports that don't exist anymore
		if (view && portState === 'disconnected') {
			view.terminate();
			midiPortViews.splice(midiPortViews.findIndex(view => view.getID() === id), 1);
		}

		// add new ports
		if (!view && portState === 'connected') {
			let createFunction, parentEl;
			if (type === 'input') {
				createFunction = createMIDIInputView;
				parentEl = midiInputsEl;
			} else {
				createFunction = createMIDIOutputView;
				parentEl = midiOutputsEl;
			}
			midiPortViews.push(createFunction({
				id,
				name,
				parentEl,
				isInput: type === 'input',
				syncEnabled,
				remoteEnabled,
				networkEnabled,
			}));
		}
	});
}
