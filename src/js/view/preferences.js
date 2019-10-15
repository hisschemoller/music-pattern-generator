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
  themeCheckEl.addEventListener('change', e => {
    dispatch(getActions().setTheme(e.target.checked));
	});
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.SET_THEME:
        updateControl('dark-theme', state.theme === 'dark');
        break;
    
    case actions.CREATE_MIDI_PORT:
    case actions.UPDATE_MIDI_PORT:
    case actions.MIDI_PORT_CHANGE:
        updateMIDIPortViews(state.ports);
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
 * @param {Array} ports MIDI port objects.
 */
function updateMIDIPortViews(ports) {
	ports.allIds.forEach(id => {
		const port = ports.byId[id];
		let view = midiPortViews.find(view => port.id === view.getID());
		if (view && port.state === 'disconnected') {
			view.terminate();
			midiPortViews.splice(midiPortViews.findIndex(view => port.id === view.getID()), 1);
		}
		if (!view && port.state === 'connected') {
			let createFunction, parentEl;
			if (port.type === 'input') {
				createFunction = createMIDIInputView;
				parentEl = midiInputsEl;
			} else {
				createFunction = createMIDIOutputView;
				parentEl = midiOutputsEl;
			}
			midiPortViews.push(createFunction({
				id: port.id,
				name: port.name,
				parentEl: parentEl,
				isInput: port.type === 'input',
				syncEnabled: port.syncEnabled,
				remoteEnabled: port.remoteEnabled,
				networkEnabled: port.networkEnabled
			}));
		}
	});
}

// /**
//  * Preferences settings view.
//  */
// export default function createPreferencesView(specs) {
//     var that,
//         store = specs.store,
//         preferencesEl = document.querySelector('.prefs'),
//         midiInputsEl = document.querySelector('.prefs__inputs'),
//         midiOutputsEl = document.querySelector('.prefs__outputs'),
//         midiPortViews = [],
//         controls = {
//             darkTheme: {
//                 type: 'checkbox',
//                 input: document.querySelector('.prefs__dark-theme')
//             }
//         },

//         init = function() {
//             controls.darkTheme.input.addEventListener('change', function(e) {
//                 store.dispatch(store.getActions().setTheme(e.target.checked));
//             });

//             document.addEventListener(store.STATE_CHANGE, (e) => {
//                 switch (action.type) {
//                     case actions.SET_THEME:
//                         updateControl('dark-theme', state.theme === 'dark');
//                         break;
                    
//                     case actions.CREATE_MIDI_PORT:
//                     case actions.UPDATE_MIDI_PORT:
//                     case actions.MIDI_PORT_CHANGE:
//                         updateMIDIPortViews(state.ports);
//                         break;
//                 }
//             });
//         },

//         /**
//          * Callback function to update one of the controls after if the
//          * preference's state changed.
//          * @param {String} key Key that indicates the control.
//          * @param {Boolean} value Value of the control.
//          */
//         updateControl = function(key, value) {
//             switch (key) {
//                 case 'dark-theme':
//                     controls.darkTheme.input.checked = value;
//                     break;
//             }
//         },

//         /**
//          * Update lists of ports after a change.
//          * @param {Array} ports MIDI port objects.
//          */
//         updateMIDIPortViews = function(ports) {
//             ports.allIds.forEach(id => {
//                 const port = ports.byId[id];
//                 let view = midiPortViews.find(view => port.id === view.getID());
//                 if (view && port.state === 'disconnected') {
//                     view.terminate();
//                     midiPortViews.splice(midiPortViews.findIndex(view => port.id === view.getID()), 1);
//                 }
//                 if (!view && port.state === 'connected') {
//                     let createFunction, parentEl;
//                     if (port.type === 'input') {
//                         createFunction = createMIDIInputView;
//                         parentEl = midiInputsEl;
//                     } else {
//                         createFunction = createMIDIOutputView;
//                         parentEl = midiOutputsEl;
//                     }
//                     midiPortViews.push(createFunction({
//                         store: store,
//                         id: port.id,
//                         name: port.name,
//                         parentEl: parentEl,
//                         isInput: port.type === 'input',
//                         syncEnabled: port.syncEnabled,
//                         remoteEnabled: port.remoteEnabled,
//                         networkEnabled: port.networkEnabled
//                     }));
//                 }
//             });
//         };

//     that = specs.that;

//     init();

//     return that;
// }
