import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

/**
 * MIDI input or output port processor view.
 */
export default function createMIDIBaseView(data) {
  const { id, name, networkEnabled, parentEl, remoteEnabled, syncEnabled, } = data;
	let el, networkEl, remoteEl, syncEl;
        
	const initialize = function() {

		// find template, add clone to midi ports list
		const template = document.querySelector('#template-midi-port');
		const clone = template.content.cloneNode(true);
		el = clone.firstElementChild;
		parentEl.appendChild(el);
		
		// set data-connected="true" to make the element visible
		el.dataset.connected = true;
		
		// show label
		el.querySelector('.midi-port__label').innerHTML = name;
		
		// find checkboxes
		networkEl = el.querySelector('.midi-port__network');
		syncEl = el.querySelector('.midi-port__sync');
		remoteEl = el.querySelector('.midi-port__remote');
		
		// set checkboxes
		networkEl.querySelector('[type=checkbox]').checked = networkEnabled;
		syncEl.querySelector('[type=checkbox]').checked = syncEnabled;
		remoteEl.querySelector('[type=checkbox]').checked = remoteEnabled;
		
		// add DOM event listeners
		networkEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(id, 'networkEnabled'));
			}
		});
		syncEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(id, 'syncEnabled'));
			}
		});
		remoteEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(id, 'remoteEnabled'));
			}
		});

		// listen to state updates
		document.addEventListener(STATE_CHANGE, e => {
			const { state, action, actions, } = e.detail;
			switch (action.type) {

				case actions.TOGGLE_MIDI_PREFERENCE:
				case actions.CREATE_PROJECT:
					const port = state.ports.byId[id];  
					if (port) {
						networkEl.querySelector('[type=checkbox]').checked = port.networkEnabled;
						syncEl.querySelector('[type=checkbox]').checked = port.syncEnabled;
						remoteEl.querySelector('[type=checkbox]').checked = port.remoteEnabled;
					} else {
						console.log(`MIDI port with id ${id} not found.`);
					}
					break;
				}
			});
		},

		/**
		 * Called before this view is deleted.
		 */
		terminate = function() {
			if (el && parentEl) {
				parentEl.removeChild(el);
			}
		},

		getId = function() {
			return id;
		};
	
	initialize();
	
	return {
		getId,
		networkEl,
		remoteEl,
		syncEl,
		terminate,
	};
}
