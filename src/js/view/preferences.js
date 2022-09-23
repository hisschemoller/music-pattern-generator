import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import createMIDIInputView from './midi_input.js';
import createMIDIOutputView from './midi_output.js';

const midiInputsEl = document.querySelector('.prefs__inputs');
const midiOutputsEl = document.querySelector('.prefs__outputs');
const midiNoInputsEl = document.getElementById('prefs__no-inputs');
const midiNoOutputsEl = document.getElementById('prefs__no-outputs');
const radioEls = document.querySelectorAll('.prefs__theme');
const midiPortViews = [];

let OSTheme = 'light';
let isOSTheme = false;

/**
 * General module setup.
 */
export function setup() {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    OSTheme = 'dark';
	};
  addEventListeners();
}

/**
 * Listen to events.
 */
function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    OSTheme = e.matches ? 'dark' : 'light';
		if (isOSTheme) {
			dispatch(getActions().setTheme('os', OSTheme));
		}
	});

	for (let i = 0, n = radioEls.length; i < n; i++) {
		radioEls[i].onclick = (e) => {
			const theme = e.target.value === 'os' ? OSTheme : e.target.value;
			dispatch(getActions().setTheme(e.target.value, theme));
			setTheme(e.target.value, theme);
		}
	}
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.CREATE_PROJECT:
    case actions.SET_THEME:
        updateControl('theme', state);
        break;
    
    case actions.CREATE_MIDI_PORT:
    case actions.UPDATE_MIDI_PORT:
    case actions.MIDI_PORT_CHANGE:
        updateMIDIPortViews(state);
        break;
  }
}

/**
 * Dispatch an action to update the themeSetting and theme.
 * @param {String} themeSetting Radio buttons setting.
 * @param {String} theme The theme to use.
 */
function setTheme(themeSetting, theme) {
	dispatch(getActions().setTheme(themeSetting, theme));
}

/**
 * Callback function to update one of the controls after if the
 * preference's state changed.
 * @param {String} key Key that indicates the control.
 * @param {Object} state Application state.
 */
function updateControl(key, state) {
	switch (key) {
		case 'theme':
			isOSTheme = state.themeSetting === 'os';
			document.querySelector(`[name=theme][value=${state.themeSetting}]`).checked = true;
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
		let view = midiPortViews.find(view => view.getId() === id);

		// remove ports that don't exist anymore
		if (view && portState === 'disconnected') {
			view.terminate();
			midiPortViews.splice(midiPortViews.findIndex(view => view.getId() === id), 1);
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

	// show No Inputs message if there are no views
	if (midiNoInputsEl) {
		const hasInputViews = midiPortViews.some((view) => view.getIsInput());
		midiNoInputsEl.style.display = hasInputViews ? 'none' : 'inline';
	}

	// show No Outputs message if there are no views
	if (midiNoOutputsEl) {
		const hasOutputViews = midiPortViews.some((view) => !view.getIsInput());
		midiNoOutputsEl.style.display = hasOutputViews ? 'none' : 'inline';
	}
}
